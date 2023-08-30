<script setup>
import http from "@@/services/HttpService";
import { useRouter } from "vue-router";
import { onMounted, ref, inject, watch } from "vue";
import { useFlash } from "@@/composables/useFlash";
import partService from "@@/services/PartService";
import { Modal } from "bootstrap";
import Form from "vform";

// Data
let modal = null;
let modalID = "stockUpdateModal";
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

const stockForm = ref(
  new Form({
    id: null,
    quantity: null,
  })
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

const showStockUpdateModal = (id, quantity) => {
  stockForm.value.id = id;
  stockForm.value.quantity = quantity;
  modal.show();
};

const updateStock = async () => {
  try {
    const { data: response } = await stockForm.value.patch(
      `/api/parts/${stockForm.value.id}/update-stock`
    );

    if (response.status == "success") {
      modal.hide();
      stockForm.value.reset();
      flash(response.message);
      await getParts();
    }
  } catch (error) {
    flash(response.message, "error");
  }

  console.log(stockForm.value);
};

// Hooks

onMounted(async () => {
  await getParts();

  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Manage Inventory</h1>
      <div>
        <router-link
          class="btn btn-primary btn-lg"
          :to="{ name: 'products.index' }"
        >
          All Products
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
              <th>Stock</th>
              <th class="text-center" style="width: 160px;">Action</th>
            </tr>
          </thead>
          <tbody>
            <!-- <td>{{ index + 1 }}</td> -->
            <tr v-for="(product, index) in products.data" :key="product.id">
              <td>{{ index + 1 }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.code }}</td>
              <td>{{ product.quantity }}</td>

              <td class="text-center">
                <button
                  @click="showStockUpdateModal(product.id, product.quantity)"
                  class="btn btn-sm btn-info me-1 mb-1"
                >
                  <i class="mr-1 fa fa-th-large"></i>
                </button>
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

  <VueModal :id="modalID" @onSubmit="updateStock">
    <template #title>
      Update Stock
    </template>

    <div class="row">
      <div class="col">
        <label class="form-label" for="quantity"><b>Stock:</b></label>
        <input
          type="number"
          min="0"
          class="form-control"
          id="quantity"
          v-model="stockForm.quantity"
        />
      </div>
    </div>

    <template #footer>
      <Button :form="stockForm" class="btn btn-primary">Update</Button>
    </template>
  </VueModal>
</template>
