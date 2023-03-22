<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import http from "@@/services/HttpService";
import { useFlash } from "@@/composables/useFlash";
import { useRouter } from "vue-router";
import moment from "moment";

// Data
const router = useRouter();
const sales = ref([]);
const paginate = ref(25);
const search = ref("");
const baseEndpoint = "/api/reports/todays-report";
let orderBy = ref("created_at");
let sortOrder = ref("desc");
let start_date = ref("");
let end_date = ref("");
const { flash } = useFlash();
const isLoading = ref(true);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getTodaysSalesReport();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getTodaysSalesReport();
  }
);

// Methods

const handleExportClick = async () => {
  const response = await http.get(
    baseEndpoint +
      "/export?search=" +
      search.value +
      "&start_date=" +
      start_date.value +
      "&end_date=" +
      end_date.value +
      "&status=completed",
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

const getTodaysSalesReport = async (page = 1) => {
  isLoading.value = true;
  const response = await axios.get(
    baseEndpoint +
      "?page=" +
      page +
      "&paginate=" +
      paginate.value +
      "&search=" +
      search.value
  );

  sales.value = response.data.data;
  isLoading.value = false;
};

const handleFilterSales = async () => {
  await getTodaysSalesReport();
};

const handleSort = (col) => {
  orderBy.value = col;
  sortOrder.value = sortOrder.value == "desc" ? "asc" : "desc";
  getTodaysSalesReport();
};

const displayProfit = (netAmount, cost, shipping_charges) => {
  if (cost == null) return null;
  let profit = parseFloat(netAmount) - parseFloat(cost);
  if (shipping_charges) profit = profit - parseFloat(shipping_charges);
  return profit.toFixed(2);
};

// Hooks
onMounted(() => {
  getTodaysSalesReport();
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Todays Sales Report Summary</h1>
    </template>
    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-striped">
        <tbody>
          <tr>
            <td class="fw-bold">Total Net Amount</td>
            <td>{{ sales.total_net_amount }}</td>
          </tr>
          <tr>
            <td class="fw-bold">Total Purchase Amount</td>
            <td>{{ sales.total_purchase_amount.toFixed(2) }}</td>
          </tr>
          <tr>
            <td class="fw-bold">Total Profit Amount</td>
            <td>{{ sales.total_profit_amount.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Panel>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Todays Sales Report</h1>
      <!-- <div>
        <button class="btn btn-lg btn-info" @click="handleExportClick">
          <i class="fa fa-download"></i>
          Export to Excel
        </button>
      </div> -->
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

    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Invoice No</th>
            <th>Customer</th>
            <!-- <th>Status</th> -->
            <th>Cost</th>
            <th>Total</th>
            <th>Profit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sale, index) in sales.sales.data" :key="sale.id">
            <td>{{ index + 1 }}</td>
            <td><AppDate :timestamp="sale.date" /></td>
            <td>
              <router-link
                :to="{ name: 'sales.show', params: { id: sale.id } }"
              >
                {{ sale.id }}
              </router-link>
            </td>
            <td>{{ sale.account.name }}</td>
            <!-- <td>
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
            </td> -->
            <td>{{ sale.purchase_amount.toFixed(2) }}</td>
            <td>{{ sale.net_amount }}</td>
            <td>
              {{
                displayProfit(
                  sale.net_amount,
                  sale.purchase_amount,
                  sale.shipping_charges
                )
              }}
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
        :data="sales.sales"
        @pagination-change-page="getTodaysSalesReport"
      />
      <div class="text-center">
        <small>
          Showing {{ sales.sales.from }} to {{ sales.sales.to }} of
          {{ sales.sales.total }}
        </small>
      </div>
    </template>
  </Panel>
</template>
