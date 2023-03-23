<script setup>
import http from "@@/services/HttpService";
import { Modal } from "bootstrap";
import { useRouter } from "vue-router";
import { onMounted, ref, inject, watch } from "vue";
import { useFlash } from "@@/composables/useFlash";
import productService from "@@/services/ProductService";
import ProductsTable from "./ProductsTable.vue";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const products = ref([]);
const stock = ref({
  data: {},
  loading: false,
});
const paginate = ref(50);
const search = ref("");
const swal = inject("$swal");
const { flash, confirmAtts } = useFlash();
const sortColumn = ref({ path: "created_at", order: "asc" });
const router = useRouter();
const isLoading = ref(true);
let modal = null;

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getProducts();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getProducts();
  }
);

// Methods
const getProducts = async (page = 1) => {
  isLoading.value = true;
  const { order, path } = sortColumn.value;
  const params = {
    page: page,
    paginate: paginate.value,
    search: search.value,
    sortOrder: order,
    orderBy: path,
  };
  const { data: response } = await productService.getProducts(params);
  products.value = response;
  isLoading.value = false;
};
const handleSort = (sortColumn) => {
  sortColumn.value = sortColumn;
  getProducts();
};
const handleShow = async (id) => {
  router.push({ name: "products.show", params: { id: id } });
};
const handleEdit = async (id) => {
  router.push({ name: "products.edit", params: { id: id } });
};
const handleDelete = async (id) => {
  const originalProducts = products.value;
  products.value = originalProducts.filter((product) => product.id !== id);

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await productService.deleteProduct(id);
      if (response.status === "success") flash(response.message);
    } else products.value = originalProducts;
  } catch (error) {
    products.value = originalProducts;
    console.log(error);
    flash("An unexpected error occurred.", "error");
  }
};

const handleExportClick = async () => {
  const response = await http.get(`/api/products/export`, {
    // If you forget this, your download will be corrupt.
    responseType: "blob",
  });
  //Let's create a link in the document that we'll
  // programmatically 'click'.
  const link = document.createElement("a");

  // Tell the browser to associate the response data to
  // the URL of the link we created above.
  link.href = window.URL.createObjectURL(new Blob([response.data]));

  // Tell the browser to download, not render, the file.
  link.setAttribute("download", "products.xlsx");

  // Place the link in the DOM.
  document.body.appendChild(link);

  // Make the magic happen!
  link.click();
};

const handleShowProductStock = async (id) => {
  stock.value.loading = true;
  const { data: response } = await http.get(
    `/api/products/${id}/stock-details`
  );
  stock.value.data = response.data;
  stock.value.loading = false;
  modal.show();
};
// Hooks

onMounted(async () => {
  await getProducts();
  modal = new Modal(document.getElementById("stockModal"), {
    keyboard: false,
  });
  // await handleExportClick();
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Products</h1>
      <div>
        <router-link
          class="btn btn-primary btn-lg"
          :to="{ name: 'products.create' }"
        >
          Add Product
        </router-link>
        <!-- <button
          v-if="can('product-view')"
          class="btn btn-lg btn-info"
          @click="handleExportClick"
        >
          <i class="fa fa-download"></i> Export Products
        </button> -->
      </div>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <!-- <label class="d-inline-block me-2 fw-bold"> Show </label> -->
        <PaginateDropdown v-model="paginate" />
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <Search v-model="search" />
      </div>
    </div>

    <div v-if="!isLoading">
      <ProductsTable
        :products="products.data"
        :sortColumn="sortColumn"
        @onSort="handleSort"
        @onShow="handleShow"
        @onEdit="handleEdit"
        @onDelete="handleDelete"
        @showProductStock="handleShowProductStock"
      />
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>

    <template #footer v-if="!isLoading">
      <Pagination :data="products" @pagination-change-page="getProducts" />
      <div class="text-center">
        <small>
          Showing {{ products.meta.from }} to {{ products.meta.to }} of
          {{ products.meta.total }}
        </small>
      </div>
    </template>
  </Panel>
  <VueModal id="stockModal">
    <template #title>
      <h5 class="fw-bold modal-title text-light" id="stockModalLabel">
        Stock Report - {{ stock.data.name }}
      </h5>
    </template>

    <div class="table-responsive" v-if="stock.data.stock_details">
      <table class="card-1 mb-0 table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr clas="border-bottom">
            <th>#</th>
            <th>Location</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(stock, index) in stock.data.stock_details"
            :key="stock.location_id"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ stock.location.name }}</td>
            <td>{{ stock.total_available_quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <div class="alert alert-info">No detail avaialble at this moments.</div>
    </div>
  </VueModal>
</template>
