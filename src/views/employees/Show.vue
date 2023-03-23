<script setup>
import { onMounted, ref, inject } from "vue";
import axios from "axios";
import { useFlash } from "@@/composables/useFlash";
import { useRoute } from "vue-router";

// Data
const { flash } = useFlash();
const route = useRoute();
const customer = ref([]);
const baseEndpoint = "/api/customers";
const swal = inject("$swal");
let isloaded = ref(false);

const columns = [
  {
    title: "#",
    name: "",
  },
  {
    title: "Date",
    name: "date",
  },
  {
    title: "Amount",
    name: "amount",
  },
];

// Methods
const getcustomer = async (id) => {
  const response = await axios.get(`${baseEndpoint}/${id}`);
  customer.value = response.data.data;
  isloaded.value = true;
};
const destroy = async (id) => {
  swal
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    })
    .then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${baseEndpoint}/${id}`)
          .then((response) => {
            if (response.data.status == "success") {
              getcustomer();
              flash(response.data.message);
            } else {
              flash(response.data.message);
            }
          })
          .catch((error) => console.log(error));
      }
    });
};

// Hooks
onMounted(() => {
  getcustomer(route.params.id);
});
</script>

<template v-if="isLoaded">
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">View Customer</h1>
      <router-link class="btn btn-primary" :to="{ name: 'customers.index' }">
        All customers
      </router-link>
    </template>

    <div class="row mb-5">
      <div class="col-12">
        <div class="d-flex align-items-center">
          <div class="flex-shrink-0">
            <i class="fa fa-user-circle-o fa-4x" aria-hidden="true"></i>
          </div>
          <div class="flex-grow-1 ms-3">
            <h3 class="card-title font text-dark">{{ customer.name }}</h3>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <div>
          <h5 class="text-body align-items-center d-flex">
            <i
              class="d-inline-block fa fa-2x fa-envelope me-2"
              aria-hidden="true"
            ></i>
            <strong>Email</strong>
          </h5>
          <p>{{ customer.email }}</p>
        </div>
        <hr />
        <div>
          <h5 class="text-body align-items-center d-flex">
            <i
              class="d-inline-block fa fa-2x fa-phone me-2"
              aria-hidden="true"
            ></i>
            <strong>Phone</strong>
          </h5>
          <p>{{ customer.phone }}</p>
        </div>
      </div>
      <div class="col-4"></div>
      <div class="col-4">
        <div>
          <h5 class="text-body align-items-center d-flex">
            <i
              class="d-inline-block fa fa-2x fa-money me-2"
              aria-hidden="true"
            ></i>
            <strong>Total Spending</strong>
          </h5>
          <p>{{ customer.sales_amount }}</p>
        </div>
      </div>
    </div>
    <template #footer>
      <Pagination :data="customer" @pagination-change-page="getcustomer" />
    </template>
  </Panel>

  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Sale History</h1>
    </template>
    <div class="table-responnsive">
      <table class="table table-striped-table-bordered table-hover">
        <thead class="bg-primary text-light">
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Invoice No</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sale, index) in customer.sales" :key="sale.id">
            <td>{{ index + 1 }}</td>
            <td>{{ sale.date }}</td>
            <td>
              <router-link
                :to="{ name: 'sales.show', params: { id: sale.id } }"
              >
                {{ sale.id }}
              </router-link>
            </td>
            <td>{{ sale.net_amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Panel>
</template>
