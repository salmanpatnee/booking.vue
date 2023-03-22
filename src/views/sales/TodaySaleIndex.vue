<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import moment from "moment";
import { useAuthStore } from "@@/stores/authStore";

// Data
const sales = ref([]);

const totalSalesAmount = ref(0);
const totalSalesReturnAmount = ref(0);

const paginate = ref(25);
const search = ref("");
const baseEndpoint = "/api/todays-sales";
let orderBy = ref("created_at");
let sortOrder = ref("desc");
const authStore = useAuthStore();
let start_date = moment().format("YYYY-MM-DD");
let end_date = moment().format("YYYY-MM-DD");

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getTodaysSales();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getTodaysSales();
  }
);

// Methods
const getTodaysSales = async (page = 1) => {
  const response = await axios.get(
    baseEndpoint +
      "?page=" +
      page +
      "&paginate=" +
      paginate.value +
      "&search=" +
      search.value +
      "&sortOrder=" +
      sortOrder.value +
      "&orderBy=" +
      orderBy.value +
      "&start_date=" +
      authStore.getRegisterDate +
      "&end_date=" +
      authStore.getRegisterDate
  );
  sales.value = response.data.data.sales;
  totalSalesAmount.value = response.data.data.total_sales_amount;
  totalSalesReturnAmount.value = response.data.data.total_sales_return_amount;
};

const handleSort = (col) => {
  orderBy.value = col;
  sortOrder.value = sortOrder.value == "desc" ? "asc" : "desc";
  getTodaysSales();
};

const displayProfit = (netAmount, cost, shipping_charges) => {
  if (cost == null) return null;
  let profit = parseFloat(netAmount) - parseFloat(cost);
  if (shipping_charges) profit = profit - parseFloat(shipping_charges);
  return profit.toFixed(2);
};

// Hooks
onMounted(() => {
  getTodaysSales();
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Todays Sales</h1>
      <router-link class="btn btn-primary" :to="{ name: 'pos.create' }">
        <i class="fa fa-arrow-circle-left" aria-hidden="true"></i> Back to POS
      </router-link>
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
      <div class="align-items-center col d-flex">
        <label class="d-inline-block me-2 fw-bold" for="search"> Search </label>
        <input
          type="search"
          v-model.trim.lazy="search"
          class="form-control"
          id="search"
        />
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Invoice No</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Cost</th>
            <th>Profit</th>
            <th class="text-center" style="width: 160px">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sale, index) in sales.data" :key="sale.id">
            <td>{{ index + 1 }}</td>
            <td><AppDate :timestamp="sale.date" /><br/>  <AppTime :timestamp="sale.created_at" /></td>
            <td>
              <router-link
                :to="{ name: 'sales.show', params: { id: sale.id } }"
              >
                {{ sale.id }}
              </router-link>
            </td>
            <td>{{ sale.account.name }}</td>
            <td>
              <span
                class="text-capitalize badge"
                :class="{
                  'bg-info': sale.status == 'ordered',
                  'bg-warning': sale.status == 'draft',
                  'bg-success':
                    sale.status == 'final' || sale.status == 'completed',
                  'bg-danger': sale.status == 'returned',
                }"
                >{{ sale.status }}</span
              >
            </td>
            <td>{{ sale.net_amount }}</td>
            <td>{{ sale.purchase_amount.toFixed(2) }}</td>
            <td>
              {{
                displayProfit(
                  sale.net_amount,
                  sale.purchase_amount,
                  sale.shipping_charges
                )
              }}
            </td>

            <td>
              <div class="text-center">
                <router-link
                  class="btn btn-sm btn-primary me-1 mb-1"
                  :to="{ name: 'sales.show', params: { id: sale.id } }"
                >
                  <i class="mr-1 fa fa-eye"></i>
                </router-link>
                <router-link
                  class="btn btn-sm btn-success me-1 mb-1"
                  :to="{ name: 'sales.invoice', params: { id: sale.id } }"
                  target="_blank"
                >
                  <i class="mr-1 fa fa-print"></i>
                </router-link>
                <router-link
                  class="btn btn-sm btn-info me-1 mb-1"
                  :to="{
                    name: 'sales.return.create',
                    params: { id: sale.id },
                  }"
                >
                  <i class="fa fa-refresh" aria-hidden="true"></i>
                </router-link>
                <router-link
                  class="btn btn-sm btn-warning me-1 mb-1"
                  :to="{
                    name: 'exchanges.create',
                    params: { id: sale.id },
                  }"
                >
                  <i class="fa fa-exchange" aria-hidden="true"></i>
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th class="text-end" colspan="7">Todays Sale Total:</th>
            <th colspan="2">{{ totalSalesAmount }}</th>
          </tr>
          <tr>
            <th class="text-end" colspan="7">Todays Return Total:</th>
            <th colspan="2">{{ totalSalesReturnAmount }}</th>
          </tr>
          <tr>
            <th class="text-end" colspan="7">Net Total:</th>
            <th colspan="2">{{ totalSalesAmount-totalSalesReturnAmount }}</th>
          </tr>
        </tfoot>
      </table>
    </div>
    <template #footer>
      <Pagination :data="sales" @pagination-change-page="getTodaysSales" />
    </template>
  </Panel>
</template>
