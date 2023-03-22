<script setup>
import { onMounted, ref, watch } from "vue";
import productService from "@@/services/ProductService";

// Data
const quantity = ref(null);
const products = ref([]);
const paginate = ref(50);

// Watcher
watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getProductsByQuantity();
  }
);

// Methods
const getProductsByQuantity = async (page = 1) => {
  const params = {
    'page': page, 
    'paginate': paginate.value, 
    'for': 'products.stock', 
    'quantity' : quantity.value
  };

//   `?page=${page}&paginate=${paginate.value}&for=products.stock&quantity=${quantity.value}`;
  const { data: response } = await productService.getProductsByQuantity(params);
  products.value = response.data;
};

// Hooks
onMounted(async () => {
  await getProductsByQuantity();
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Stock Checker</h1>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <PaginateDropdown v-model="paginate" />
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <input type="number" v-model="quantity" class="form-control" id="quantity" />
        <button class="btn btn-primary ms-3" @click="getProductsByQuantity">Check</button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(product, index) in products.data"
            :key="product.id"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.quantity }}</td>
           
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <div class="text-end">
        <Pagination
          :data="products"
          @pagination-change-page="getProductsByQuantity"
        />
      </div>
    </template>
  </Panel>
</template>
