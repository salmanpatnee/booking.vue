<script setup>
import http from "@@/services/HttpService";
import { useRouter } from "vue-router";
import { onMounted, ref, inject, watch } from "vue";
import { useFlash } from "@@/composables/useFlash";
import partService from "@@/services/PartService";

// Data
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

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getParts();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getParts();
  }
);

// Methods
const getParts = async (page = 1) => {
  isLoading.value = true;
  const { order, path } = sortColumn.value;
  const params = {
    page: page,
    paginate: paginate.value,
    search: search.value,
    sortOrder: order,
    orderBy: path,
  };
  const { data: response } = await partService.getParts(params);
  products.value = response;
  isLoading.value = false;
};
const handleSort = (sortColumn) => {
  sortColumn.value = sortColumn;
  getParts();
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
      const { data: response } = await partService.deleteProduct(id);
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
};
// Hooks

onMounted(async () => {
  await getParts();

});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Products</h1>
      <div>
        <router-link
          class="btn btn-primary btn-lg"
          :to="{ name: 'parts.create' }"
        >
          Add Product
        </router-link>
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
      <div class="table-responsive">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Code</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Price</th>
            <th>Quantity</th>
            <th class="text-center" style="width: 160px;">Action</th>
          </tr>
        </thead>
        <tbody>
          <!-- <td>{{ index + 1 }}</td> -->
          <tr v-for="(product, index) in products.data" :key="product.id">
            <td>{{ index+1 }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.code }}</td>
            <td>{{ product.category?.name }}</td>
            <td>{{ product.cost }}</td>
            <td>{{ product.price }}</td>
            <td>{{ product.quantity }}</td>
            
            <td class="text-center">
              <router-link
                
                class="btn btn-sm btn-info me-1 mb-1"
                :to="{ name: 'parts.edit', params: { id: product.id } }"
              >
                <i class="mr-1 fa fa-pencil"></i>
              </router-link>
              <!-- <router-link
                
                class="btn btn-sm btn-primary me-1 mb-1"
                :to="{ name: 'parts.show', params: { id: product.id } }"
              >
                <i class="mr-1 fa fa-eye"></i>
              </router-link> -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>

    <template #footer v-if="!isLoading">
      <Pagination :data="products" @pagination-change-page="getParts" />
      <div class="text-center">
        <small>
          Showing {{ products.meta.from }} to {{ products.meta.to }} of
          {{ products.meta.total }}
        </small>
      </div>
    </template>
  </Panel>
</template>
