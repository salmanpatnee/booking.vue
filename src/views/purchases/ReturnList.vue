<script setup>
import { onMounted, ref, watch } from "vue";
import purchaseReturnService from "@@/services/PurchaseReturnService";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const purchaseReturn = ref([]);
const paginate = ref(10);
const search = ref("");
let orderBy = ref("created_at");
let sortOrder = ref("desc");
const isLoading = ref(true);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getpurchaseReturn();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getpurchaseReturn();
  }
);

// Methods
const getpurchaseReturn = async (page = 1) => {
  isLoading.value = true;
  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}&sortOrder=${sortOrder.value}&orderBy=${orderBy.value}`;

  const response = await purchaseReturnService.getPurchaseReturns(params);

  purchaseReturn.value = response.data.data;
  isLoading.value = false;
};

// Hooks
onMounted(async () => await getpurchaseReturn());
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Purchase Return</h1>
      <router-link
        v-if="can('purchase-return-add')"
        class="btn btn-primary"
        :to="{ name: 'purchases.return' }"
      >
        Add Purchase Return
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

    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Invoice No</th>
            <th>Purchase ID</th>
            <th>Supplier</th>
            <th>Amount Before Return</th>
            <th>Amount After Return</th>
            <th>Retun Amount</th>
            <th>Status</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(purchase, index) in purchaseReturn.data"
            :key="purchase.id"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <AppDate :timestamp="purchase.date" />
            </td>
            <td>
              <!-- {{ purchase.purchase.id }} -->
              <router-link
                :to="{
                  name: 'purchase.return.show',
                  params: { id: purchase.id },
                }"
              >
                {{ purchase.purchase.id }}
              </router-link>
            </td>
            <td>
              <router-link
                :to="{
                  name: 'purchases.show',
                  params: { id: purchase.id },
                }"
              >
                {{ purchase.purchase.reference_number }}
              </router-link>
            </td>
            <td>{{ purchase.purchase.account.name }}</td>
            <td>{{ purchase.purchase_amount_before_return }}</td>
            <td>{{ purchase.purchase_amount_after_return }}</td>
            <td>{{ purchase.purchase_return_amount }}</td>
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
            <td>
              <router-link
                class="btn btn-sm btn-primary me-1"
                :to="{
                  name: 'purchase.return.show',
                  params: { id: purchase.id },
                }"
              >
                <i class="mr-1 fa fa-eye"></i>
              </router-link>
              <router-link
                class="btn btn-sm btn-info me-1"
                :to="{
                  name: 'purchase.return.print',
                  params: { id: purchase.id },
                }"
                target="_blank"
              >
                <i class="mr-1 fa fa-print"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    <template #footer v-if="!isLoading">
      <Pagination
        :data="purchaseReturn"
        @pagination-change-page="getpurchaseReturn"
      />
      <div class="text-center">
        <small>
          Showing {{ purchaseReturn.from }} to {{ purchaseReturn.to }} of
          {{ purchaseReturn.total }}
        </small>
      </div>
    </template>
  </Panel>
</template>
