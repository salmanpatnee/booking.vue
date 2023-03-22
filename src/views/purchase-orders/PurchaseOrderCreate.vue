<script setup>
import { onMounted, ref, computed, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import Form from "vform";
import { useToast } from "vue-toastification";
import moment from "moment";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";

// Data
const router = useRouter();
const toast = ref(useToast());
const purchases = ref([]);
const products = ref([]);
const purchase_order_detailss = ref([]);
const product_type = ref("alert");
const search = ref("");
const baseEndpoint = "/api/purchases";
let orderBy = ref("created_at");
let sortOrder = ref("desc");

const form = ref(
  new Form({
    date: moment().format("YYYY-MM-DD"),
    purchase_order_details: [],
    status: "ordered",
  })
);

// const purchase_order_details = ref(null);

watch(
  () => product_type.value,
  (product_type, prevCount) => {
    getProducts();
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
  const response = await axios.get(
    baseEndpoint +
      "?page=" +
      page +
      "&search=" +
      search.value +
      "&sortOrder=" +
      sortOrder.value +
      "&orderBy=" +
      orderBy.value
  );
  purchases.value = response.data.data;
};

const debounce = (fn, delay) => {
  let timeout;

  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const getProducts = async () => {
  let $type = product_type.value === "alert" ? "&alerted=1" : "";
  const response = await axios.get(
    `api/products?for=purchase-orders.create${$type}`
  );
  products.value = response.data;
};

const isProductAdded = (product) => {
  const productExist = form.value.purchase_order_details.findIndex((p) => {
    return p.product_id === product.id;
  });

  if (productExist === -1) return false;

  form.value.purchase_order_details = form.value.purchase_order_details.filter(
    (p) => p.product_id !== product.id
  );
  return true;
};

const handleAddProduct = (product, event) => {
  if (isProductAdded(product)) return;

  const obj = {
    product_id: product.id,
    product_name: product.name,
    quantity_demanded: 1,
  };

  form.value.purchase_order_details.push(obj);
};

const handleRemoveProduct = (productId) => {
  form.value.purchase_order_details = form.value.purchase_order_details.filter(
    (p) => p.product_id !== productId
  );
};

const toggleProductAdded = (id) => {
  return form.value.purchase_order_details.filter(
    (purchaseOrderDetail) => purchaseOrderDetail.product_id === id
  ).length
    ? "active "
    : "";
};

const store = () => {
  form.value
    .post("api/purchase-orders")
    .then((response) => {
      if (response.data.status == "success") {
        toast.value.success(response.data.message);
        console.log(response);
        router.push({ name: "purchase.order.index" });
      }
    })
    .catch((error) => console.log(error));
};

// Hooks
onMounted(() => {
  getProducts();
});
</script>

<template>
  <div class="row">
    <div class="col-4">
      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">Products</h1>
        </template>
        <div class="mb-3">
          <label class="form-label" for="">Select Product Type</label>
          <select class="form-select" v-model="product_type">
            <option value="alert" selected>Alert Quantity</option>
            <option value="all"> Show All</option>
          </select>
        </div>
        <ol class="list-group list-group-numbered" v-if="products.length">
          <li
            v-for="(product, index) in products"
            :key="index"
            @click="handleAddProduct(product, $event)"
            class="list-group-item d-flex justify-content-between align-items-start clickable"
            :class="toggleProductAdded(product.id)"
          >
            <div class="ms-2 me-auto">
              <div class="fw-bold">{{ product.name }}</div>
            </div>
            <span class="badge bg-primary rounded-pill">{{
              product.quantity
            }}</span>
          </li>
        </ol>
      </Panel>
    </div>

    <div class="col">
      <form @submit.prevent="store()">
        <Panel>
          <template #header>
            <h1 class="h3 mb-0 text-middle">Demand List</h1>
          </template>
          <div class="row">
            <div class="col">
              <div class="mb-3">
                <label class="form-label" for="date">Date:</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="form.date"
                  id="date"
                />
                <HasError :form="form" field="date" />
              </div>
            </div>
            <div class="col">
              <div class="mb-3"></div>
            </div>
          </div>
          <hr class="mb-3" />
          <div
            class="table-responsive"
            v-if="form.purchase_order_details.length"
          >
            <table class="table table-striped table-hover table-bordered">
              <thead class="bg-primary text-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(purchaseOrderDetail,
                  index) in form.purchase_order_details"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ purchaseOrderDetail.product_name }}</td>
                  <td>
                    <input
                      type="number"
                      v-model="purchaseOrderDetail.quantity_demanded"
                      class="form-control w-auto"
                    />
                  </td>
                  <td class="text-center">
                    <button
                      class="btn btn-danger btn-sm"
                      @click="
                        handleRemoveProduct(purchaseOrderDetail.product_id)
                      "
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-info" role="alert">
            Order sheet is empty.
          </div>
          <template #footer v-if="form.purchase_order_details.length">
            <Button :form="form" class="btn btn-lg btn-primary"
              >Create Purchase Order</Button
            >
          </template>
        </Panel>
      </form>
    </div>
  </div>
</template>
