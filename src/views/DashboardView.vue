<script setup>
import http from "@@/services/HttpService";
import { onMounted, ref } from "vue";
import StatCard from "@@/components/commons/StatCard.vue";
import { useCan } from "@@/composables/useCan";

const { can } = useCan();
const stats = ref({
  data: [],
  isLoading: false,
});

const getDashboardStats = async () => {
  stats.value.isLoading = true;
  const response = await http.get(`/api/dashboard`);
  stats.value.data = response.data;
  stats.value.isLoading = false;
};

onMounted(async () => {
  await getDashboardStats();
});
</script>

<template>
  <div class="align-items-center d-flex justify-content-between mb-5">
    <h1 class="h3">Dashboard</h1>
    <button @click="getDashboardStats" class="btn btn-sm btn-info btn-outline-info rounded-circle" title="Refresh Dashboard">
      <i class="fa fa-refresh"></i>
    </button>
  </div>
  <div v-if="!stats.isLoading ">
    <div class="row">
      <div class="col d-flex">
        <div class="w-100">
          <div class="row row-cols-1 row-cols-md-3 g-3">
            <div class="col">
              <stat-card
                title="TOTAL CUSTOMERS"
                :figure="stats.data.total_customers"
              />
            </div>
            <div class="col">
              <stat-card
                title="TOTAL SUPPLIERS"
                :figure="stats.data.total_suppliers"
                type="success"
              />
            </div>
            <div class="col">
              <stat-card
                title="TOTAL PRODUCTS"
                :figure="stats.data.total_products"
                type="success"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row my-2">
      <h3 class="my-2">Todays Summary</h3>
      <div class="col d-flex mt-4">
        <div class="w-100">
          <div class="row row-cols-1 row-cols-md-3 g-3">
            <div class="col">
              <stat-card
                title="TOTAL ORDERS"
                :figure="stats.data.todays_total_orders"
                type="info"
              />
            </div>
            <div class="col">
              <stat-card
                title="TOTAL PURCHASES"
                :figure="parseFloat(stats.data.todays_total_purchase_amount)"
                type="info"
              />
            </div>
            <div class="col">
              <stat-card
                title="TOTAL SALES"
                :figure="parseFloat(stats.data.todays_total_sales_amount)"
                type="info"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col d-flex">
        <div class="w-100">
          <div class="row row-cols-1 row-cols-md-3 g-3">
            <div class="col">
              <stat-card
                title="TOTAL EXPENSES"
                :figure="stats.data.todays_total_expenses"
                type="danger"
              />
            </div>
            <div class="col">
              <stat-card
                title="PURCHASE RETURN"
                :figure="parseFloat(stats.data.todays_total_purchase_return_amount)"
                type="danger"
              />
            </div>
            <div class="col">
              <stat-card
                title="SALES RETURN"
                :figure="parseFloat(stats.data.todays_total_sales_return_amount)"
                type="danger"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Alert Products</h1>
      </template>
      <div class="table-responsive">
        <table
          class="card-1 mb-0 table table-bordered table-hover table-striped"
        >
          <thead class="bg-primary text-bg-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in stats.data.alert_quantity_products">
              <td>{{ index + 1 }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.category }}</td>
              <td>{{ product.brand }}</td>
              <td>{{ product.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  </div>
  <div class="text-center" v-else>
    <app-loader  />
  </div>
</template>
