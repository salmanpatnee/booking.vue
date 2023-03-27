<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import http from "@@/services/HttpService";
import { useFlash } from "@@/composables/useFlash";
import { useRouter } from "vue-router";
import { useCan } from "@@/composables/useCan";
import { Modal } from "bootstrap";
import Form from "vform";

// Data
let modal = null;
let modalID = "invoiceModal";
const router = useRouter();
const { can } = useCan();
const sales = ref([]);
const paginate = ref(25);
const search = ref("");
const id = ref("");
const status = ref("");
const baseEndpoint = "/api/bookings";
let orderBy = ref("created_at");
let sortOrder = ref("desc");
let start_date = ref("");
let end_date = ref("");
const { flash } = useFlash();

const isLoading = ref(true);

const invoiceForm = ref(
  new Form({
    amount: null,
    reference_id: null,
    id: null,
  })
);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getBookings();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getBookings();
  }
);
watch(
  () => id.value,
  (id, prevCount) => {
    getBookings();
  }
);

// Methods

const showInvoiceModal = (booking) => {
  invoiceForm.value.reset();
  invoiceForm.value.reference_id = booking.reference_id;
  invoiceForm.value.id = booking.id;
  modal.show();
};
const generateInvoice = async (id) => {
  let routeData = router.resolve({
    name: "bookings.invoice",
    params: { id },
  });
  window.open(routeData.href, "_blank");
  // modal.hide();
  // isLoaded.value = false;
  // invoiceForm.value.reset();
};

const handleExportClick = async () => {
  const response = await http.get(
    baseEndpoint +
      "/export?search=" +
      search.value +
      "&id=" +
      id.value +
      "&start_date=" +
      start_date.value +
      "&end_date=" +
      end_date.value,
    {
      // If you forget this, your download will be corrupt.
      responseType: "blob",
    }
  );
  //Let's create a link in the document that we'll
  // programmatically 'click'.
  const link = document.createElement("a");

  // Tell the browser to associate the response data to
  // the URL of the link we created above.
  link.href = window.URL.createObjectURL(new Blob([response.data]));

  // Tell the browser to download, not render, the file.
  link.setAttribute("download", "sales.xlsx");

  // Place the link in the DOM.
  document.body.appendChild(link);

  // Make the magic happen!
  link.click();
};

const getBookings = async (page = 1) => {
  isLoading.value = true;
  const response = await axios.get(
    baseEndpoint +
      "?page=" +
      page +
      "&paginate=" +
      paginate.value +
      "&search=" +
      search.value +
      "&id=" +
      id.value +
      "&start_date=" +
      start_date.value +
      "&end_date=" +
      end_date.value +
      "&status=" +
      status.value
  );
  sales.value = response.data;
  isLoading.value = false;
};

const handleFilterSales = async () => {
  await getBookings();
};

const handleSort = (col) => {
  orderBy.value = col;
  sortOrder.value = sortOrder.value == "desc" ? "asc" : "desc";
  getBookings();
};

const showInvoicePopup = () => {
  console.log("Clicked");
};
// Hooks
onMounted(() => {
  getBookings();

  modal = new Modal(document.getElementById(modalID), {
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
          @click="handleFilterSales"
          class="btn btn-primary"
        >
          Filter
        </button>
      </div>
    </div>
  </Panel>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Bookings</h1>
      <div>
        <router-link
          v-if="can('sale-add')"
          class="btn btn-lg btn-primary me-4"
          :to="{ name: 'pos.create' }"
        >
          Add Sale
        </router-link>
      </div>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <label class="d-inline-block me-2 fw-bold"> Show </label>
        <select v-model="paginate" class="form-select w-auto">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div class="col"></div>
      <div class="align-items-center col-auto d-flex">
        <!-- <label class="d-inline-block me-2 fw-bold" for="search"> Search </label> -->
        <input
          type="search"
          placeholder="Search by ID"
          v-model.trim.lazy="id"
          class="form-control"
          id="id"
        />
      </div>
      <div class="col">
        <select class="form-control" v-model="status" @change="getBookings()">
          <option value="">--Filter by Status--</option>
          <option value="in progress">In Progress</option>
          <option value="repaired">Repaired</option>
          <option value="complete">Complete</option>
          <option value="can not be repaired">Can't Repaired</option>
          <option value="customer collected CBR">Customer Collected CBR</option>
          <option value="customer collected payment pending">
            Payment Pending
          </option>
          <option value="shop property">Shop Property</option>
          <option value="awaiting customer response">Awaiting Response</option>
          <option value="awaiting parts">Awaiting Parts</option>
        </select>
      </div>
    </div>

    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <!-- <th>#</th> -->
            <th>ID</th>
            <th>Status</th>
            <th>Item</th>
            <th>Fault</th>
            <th>Estimated Cost</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Repair By</th>
            <th class="text-center" style="width: 160px">Action</th>
          </tr>
        </thead>
        <tbody>
          <!-- <td>{{ index + 1 }}</td> -->
          <tr v-for="(sale, index) in sales.data" :key="sale.id">
            <td>{{ sale.reference_id }}</td>
            <td class="text-capitalize">{{ sale.status }}</td>
            <td>{{ sale.device_name }}</td>
            <td>{{ sale.issue }}</td>
            <td>{{ sale.estimated_cost }}</td>
            <td>{{ sale.account.name }}</td>
            <td><AppDate :timestamp="sale.date" /></td>
            <td>{{ sale.employee.name }}</td>
            <td class="text-center">
              <router-link
                v-if="sale.status != 'complete'"
                class="btn btn-sm btn-info me-1 mb-1"
                :to="{ name: 'bookings.edit', params: { id: sale.id } }"
              >
                <i class="mr-1 fa fa-pencil"></i>
              </router-link>
              <button
                v-else
                @click="generateInvoice(sale.id)"
                class="btn btn-sm btn-warning me-1 mb-1"
              >
                <i class="mr-1 fa fa-print"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    <template #footer v-if="!isLoading">
      <Pagination :data="sales" @pagination-change-page="getBookings" />
      <div class="text-center">
        <small>
          Showing {{ sales.meta.from }} to {{ sales.meta.to }} of
          {{ sales.meta.total }}
        </small>
      </div>
    </template>
  </Panel>
  <VueModal :id="modalID" @onSubmit="generateInvoice">
    <template #title>
      Generate Invoice #{{ invoiceForm.reference_id }}</template
    >
    <div class="mb-3">
      <label class="form-label" for="amount">Amount:</label>
      <input
        v-model="invoiceForm.amount"
        type="number"
        class="form-control"
        id="amount"
        required
      />
      <HasError :form="invoiceForm" field="amount" />
    </div>

    <template #footer>
      <Button :form="invoiceForm" class="btn btn-primary">Generate</Button>
    </template>
  </VueModal>
</template>
