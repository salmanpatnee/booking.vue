<script setup>
import Form from "vform";
import { Modal } from "bootstrap";
import moment from "moment";
import { onMounted, ref, watch, inject, computed } from "vue";
import purchaseService from "@@/services/PurchaseService";
import paymentService from "@@/services/PaymentService";
import { useFlash } from "@@/composables/useFlash";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const purchases = ref([]);
const paginate = ref(10);
const supplierName = ref("");
const reference_number = ref("");
const net_amount = ref(0);
const paid_amount = ref(0);
const search = ref("");
const swal = inject("$swal");
let modal = null;
const { flash, confirmAtts } = useFlash();
let start_date = ref("");
let end_date = ref("");
const isLoading = ref(true);
const payment_status = ref("");

const form = ref(
  new Form({
    date: moment().format("YYYY-MM-DD"),
    account_id: "",
    purchase_id: "",
    payment_method_id: 1,
    amount: 0,
  })
);

// Watcher
watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getPurchases();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getPurchases();
  }
);

// Methods
const getPurchases = async (page = 1) => {
  isLoading.value = true;
  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}&start_date=${start_date.value}&end_date=${end_date.value}&payment_status=${payment_status.value}`;
  const { data: response } = await purchaseService.getPurchases(params);
  purchases.value = response;
  isLoading.value = false;
};
const handleFilterPurchases = async () => {
  await getPurchases();
};

const getPurchase = async (id) => await purchaseService.getPurchase(id);

const handleDelete = async (id) => {
  const originalPurchases = purchases.value;
  purchases.value = originalPurchases.filter((purchase) => purchase.id !== id);

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await purchaseService.deletePurchase(id);
      if (response.status === "success") flash(response.message);
    } else purchases.value = originalPurchases;
  } catch (error) {
    purchases.value = originalPurchases;
    console.log(error);
    flash("An unexpected error occurred.", "error");
  }
};

const handlePayment = async (id) => {
  const { data: purchase } = await getPurchase(id);

  supplierName.value = purchase.data.account.name;
  reference_number.value = purchase.data.reference_number;
  net_amount.value = purchase.data.net_amount;
  paid_amount.value = purchase.data.paid_amount;

  form.value.fill(purchase.data);
  form.value.purchase_id = purchase.data.id;
  form.value.amount = 0;
  form.value.payment_method_id = 1; //CASH
  (form.value.date = moment().format("YYYY-MM-DD")), modal.show();
};

const handleAddPayment = async () => {
  try {
    const { data: response } = await form.value.post(
      paymentService.apiEndpoint
    );
    if (response.status === "success") {
      getPurchases();
      modal.hide();
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

// Computed
const dueAmountDisplay = computed(() => net_amount.value - paid_amount.value);

// Hooks
onMounted(async () => {
  await getPurchases();
  modal = new Modal(document.getElementById("paymentModal"), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <div class="row g-3">
      <div class="col">
        <div class="row">
          <label for="start_date" class="col-sm-4 fw-bold col-form-label"
            >Start Date</label
          >
          <div class="col-sm-8">
            <input
              type="date"
              id="start_date"
              v-model="start_date"
              class="form-control"
              placeholder="Start Date"
            />
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <label for="end_date" class="col-sm-4 fw-bold col-form-label"
            >End Date</label
          >
          <div class="col-sm-8">
            <input
              type="date"
              id="end_date"
              v-model="end_date"
              class="form-control"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
      <div class="col">
        <button
          type="button"
          @click="handleFilterPurchases"
          class="btn btn-primary"
        >
          Filter
        </button>
      </div>
      <!-- <div class="col">
        <div class="row">
          <div class="col-auto">
            <select
              class="form-control form-select"
              v-model="payment_status"
              @change="handleChange"
            >
              <option value="">Filter by Payment Status</option>
              <option value="due">Due</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div> -->
    </div>
  </Panel>

  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Purchases</h1>
      <router-link
        v-if="can('purchase-add')"
        class="btn btn-primary"
        :to="{ name: 'purchases.create' }"
      >
        Add Purchase
      </router-link>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <PaginateDropdown v-model="paginate" />
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <Search v-model="search" />
      </div>
    </div>

    <div v-if="!isLoading" class="table-responsive">
      <table
        v-if="!isLoading"
        class="table table-bordered table-hover table-striped"
      >
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Purchase ID</th>
            <th>Supplier</th>
            <th>Purchase Status</th>
            <th>Payment Status</th>
            <th>Grand Total</th>
            <th>Payment Due</th>
            <th class="text-center" style="width: 160px">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(purchase, index) in purchases.data" :key="purchase.id">
            <td>{{ index + 1 }}</td>
            <td><AppDate :timestamp="purchase.date" /></td>
            <td>{{ purchase.reference_number }}</td>
            <td>{{ purchase.account.name }}</td>
            <td>
              <span
                class="text-capitalize badge"
                :class="
                  purchase.status === 'ordered'
                    ? 'bg-info'
                    : '' || purchase.status === 'draft'
                    ? 'bg-warning'
                    : '' || purchase.status === 'received'
                    ? 'bg-success'
                    : '' || purchase.status === 'final'
                    ? 'bg-success'
                    : '' || purchase.status === 'returned'
                    ? 'bg-danger'
                    : ''
                "
              >
                {{ purchase.status }}
              </span>
            </td>
            <td>
              <span
                class="text-capitalize badge"
                :class="
                  purchase.payment_status === 'paid'
                    ? 'bg-success'
                    : '' || purchase.payment_status === 'due'
                    ? 'bg-danger'
                    : ''
                "
              >
                {{ purchase.payment_status }}
              </span>
            </td>
            <td>{{ purchase.net_amount }}</td>
            <td>{{ purchase.net_amount - purchase.paid_amount }}</td>
            <td>
              <div class="text-center">
                <router-link
                  v-if="can('purchase-view')"
                  class="btn btn-success btn-sm me-1 mb-1"
                  :to="{ name: 'purchases.show', params: { id: purchase.id } }"
                  ><i class="mr-1 fa fa-eye"></i>
                </router-link>

                <router-link
                  v-if="can('purchase-view')"
                  class="btn btn-warning btn-sm me-1 mb-1"
                  target="_blank"
                  :to="{
                    name: 'purchases.print',
                    params: { id: purchase.id },
                  }"
                  ><i class="mr-1 fa fa-print"></i>
                </router-link>
                <router-link
                  v-if="can('purchase-return-add') && (purchase.status !== 'returned' && purchase.status !== 'final' ) "
                  class="btn btn-danger btn-sm me-1 mb-1"
                  target="_blank"
                  :to="{
                    name: 'purchases.return',
                    params: { id: purchase.id },
                  }"
                >
                  <i class="fa fa-undo" aria-hidden="true"></i>
                </router-link>
                <a
                  v-if="
                    purchase.payment_status === 'due' && can('purchase-edit')
                  "
                  class="btn btn-info btn-sm me-1 mb-1"
                  @click.prevent="handlePayment(purchase.id)"
                >
                  <i class="mr-1 fa fa-money"></i>
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-center">
        <h3>Loading...</h3>
      </div>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    <template v-if="!isLoading" #footer>
      <Pagination :data="purchases" @pagination-change-page="getPurchases" />
      <div class="text-center">
        <small>
          Showing {{ purchases.meta.from }} to {{ purchases.meta.to }} of
          {{ purchases.meta.total }}
        </small>
      </div>
    </template>
  </Panel>

  <VueModal id="paymentModal" @onSubmit="handleAddPayment">
    <template #title> Add Payment </template>
    <div class="row">
      <div class="col">
        <label class="form-label" for="date"><b>Supplier:</b></label>
        <p>{{ supplierName }}</p>
      </div>
      <div class="col">
        <label class="form-label" for="date"><b>Reference No:</b></label>
        <p>{{ reference_number }}</p>
      </div>
      <div class="col">
        <label class="form-label me-2" for="date"><b>Total Amount</b></label>
        <p>{{ net_amount }}</p>
      </div>
      <div class="col">
        <label class="form-label me-2" for="date"><b>Due</b></label>
        <p>{{ dueAmountDisplay }}</p>
      </div>
    </div>
    <hr />
    <div class="row">
      <div class="col">
        <label class="form-label" for="date">Date:</label>
        <input
          type="date"
          class="form-control"
          v-model="form.date"
          id="date"
          readonly
        />
        <HasError :form="form" field="date" />
      </div>
      <div class="col">
        <label class="form-label" for="amount_paid">Amount:</label>
        <input
          type="number"
          :max="dueAmountDisplay"
          class="form-control form-control-lg"
          id="amount_paid"
          v-model="form.amount"
          required min="0"
        />
        <HasError :form="form" field="amount" />
      </div>
      <!-- <div class="col">
        <label class="form-label" for="payment_method_id"
          >Payment Method:</label
        >
        <select
          id="payment_method_id"
          class="form-select"
          v-model="form.payment_method_id"
        >
          <option value="1">Cash</option>
          <option value="2">Bank</option>
        </select>
        <HasError :form="form" field="payment_method_id" />
      </div> -->
    </div>
    <template #footer>
      <Button :form="form" class="btn btn-primary" :disabled="!form.amount"
        >Pay</Button
      >
    </template>
  </VueModal>
</template>
