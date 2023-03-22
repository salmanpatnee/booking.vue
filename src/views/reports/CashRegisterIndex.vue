<script setup>
import { onMounted, ref, watch } from "vue";
import http from "@@/services/HttpService";

// Data
const cashRegisters = ref([]);
const paginate = ref(25);
const baseEndpoint = "/api/cash-registers";
let start_date = ref("");
let end_date = ref("");
const isLoading = ref(true);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getCashRegisters();
  }
);

// Methods
const getCashRegisters = async (page = 1) => {
  isLoading.value = true;
  const response = await http.get(
    baseEndpoint +
      "?page=" +
      page +
      "&paginate=" +
      paginate.value + "&start_date=" + start_date.value + "&end_date=" + end_date.value
  );

  cashRegisters.value = response.data.data;
  isLoading.value = false;
};

const handleFilterSales = async () => {
  await getCashRegisters();
};

// Hooks
onMounted(async () => {
  await getCashRegisters();
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
      <h1 class="h3 mb-0 text-middle">Cash Register Report</h1>
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
    </div>
    <!-- <pre>{{cashRegisters}}</pre> -->
    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>Open Time</th>
            <th>Close Time</th>
            <th>User</th>
            <th>Opening Cash</th>
            <th>Cash Sales</th>
            <th>Card Sales</th>
            <th>Sale Returns</th>
            <th>Total Expenses</th>
            <th>Closing Cash </th>
            <th>Total Orders</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(register, index) in cashRegisters.data" :key="register.id">
            <td><AppDate :timestamp="register.start_datetime"/> <br/> <AppTime :timestamp="register.start_datetime"/></td>
            <td><AppDate :timestamp="register.end_datetime"/> <br/> <AppTime :timestamp="register.end_datetime"/></td>
            <td>{{register.user.name}}</td>
            <td>{{register.cash_in_hand}}</td>
            <td>{{register.total_cash_sales}}</td>
            <td>{{register.total_card_sales}}</td>
            <td>{{register.total_sales_returns_amount}}</td>
            <td>{{register.total_expenses}}</td>
            <td>{{register.cash_in_hand_at_end}}</td>
            <td>{{register.sales_count}}</td>
            <td>
                <router-link class="btn btn-sm btn-primary me-1 mb-1"
                  :to="{ name: 'reports.registers.show', params: { id: register.id } }"
                >
                  <i class="mr-1 fa fa-eye"></i>
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
        :data="cashRegisters.data"
        @pagination-change-page="getCashRegisters"
      />
      <div class="text-center">
        <small>
          Showing {{ cashRegisters.from }} to {{ cashRegisters.to }} of
          {{ cashRegisters.total }}
        </small>
      </div>
    </template>
  </Panel>
</template>
