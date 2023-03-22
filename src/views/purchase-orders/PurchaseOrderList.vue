<script setup>
import { onMounted, ref, inject, watch } from "vue";
import axios from "axios";
import Form from "vform";
import { Modal } from "bootstrap";
import { useRouter } from "vue-router";

// Data
const router = useRouter();
const purchaseOrders = ref([]);
const paginate = ref(10);
const search = ref("");
const baseEndpoint = "/api/purchase-orders";
let orderBy = ref("created_at");
let sortOrder = ref("desc");

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getPurchaseOrders();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getPurchaseOrders();
  }
);

// Methods
const getPurchaseOrders = async (page = 1) => {
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
      orderBy.value
  );
  purchaseOrders.value = response.data.data.data;
};

// const show = (id) => {
//     router.push({ name: 'purchases-orders.show', params: { id: id } })
// }

// const edit = (id) => {
//     router.push({ name: 'purchases.edit', params: { id: id } })
// }
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
              getPurchaseOrders();
              flash(response.data.message);
            } else {
              flash(response.data.message);
            }
          })
          .catch((error) => console.log(error));
      }
    });
};

const handleSort = (col) => {
  orderBy.value = col;
  sortOrder.value = sortOrder.value == "desc" ? "asc" : "desc";
  getPurchaseOrders();
};

// const handleShow = (id) => {
//     router.push({ name: 'purchases.show', params: { id: id } })
// }

const pay = (id) => {
  modal.show();
};

const addPayment = () => {};

// Hooks
onMounted(() => {
  getPurchaseOrders();
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Purchase Orders</h1>
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
            <th>Location</th>
            <th>Status</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(purchaseOrder, index) in purchaseOrders"
            :key="purchaseOrder.id"
          >
            <td>{{ index + 1 }}</td>
            <td><AppDate :date="purchaseOrder.date"/></td>
            <td>{{ purchaseOrder.location.name }}</td>
            <td>
              <span
                class="text-capitalize badge"
                :class="{
                  'bg-warning': purchaseOrder.status === 'demanded',
                  'bg-success': purchaseOrder.status === 'accepted',
                }"
              >
                {{ purchaseOrder.status }}</span
              >
            </td>
            <td class="text-center">
              <RouterLink
                v-if="purchaseOrder.status !== 'accepted'"
                class="btn btn-success m-2"
                :to="`/purchase-orders/${purchaseOrder.id}/purchases/create`"
              >
                <i class="fa fa-check-circle-o" aria-hidden="true"></i> &nbsp;
                Make Purchase
              </RouterLink>
              <RouterLink
                v-if="purchaseOrder.status === 'accepted'"
                class="btn btn-primary m-2"
                :to="`/purchase-orders/check/${purchaseOrder.id}`"
              >
                <i class="fa fa-check-circle-o" aria-hidden="true"></i> &nbsp;
                Check Purchase
              </RouterLink>
              <button class="btn btn-warning">
                <i class="fa fa-times" aria-hidden="true"></i> &nbsp; Discard
              </button>

              <RouterLink
                class="btn btn-info m-2"
                :to="{
                  name: 'purchase.order.show',
                  params: { id: purchaseOrder.id },
                }"
              >
                <i class="fa fa-eye" aria-hidden="true"></i> &nbsp; View
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <!-- <Pagination :data="purchases" @pagination-change-page="getPurchaseOrders" @onReturn="handleReturn" /> -->
    </template>
  </Panel>
</template>
