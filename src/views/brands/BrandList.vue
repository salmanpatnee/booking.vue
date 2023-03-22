<script setup>
import { onMounted, ref, inject, watch } from "vue";
import Form from "vform";
import { Modal } from "bootstrap";
import { useFlash } from "@@/composables/useFlash";
import brandService from "@@/services/BrandService";
import BrandsTable from "./BrandsTable.vue";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const brands = ref([]);
const editMode = ref(false);
const paginate = ref(10);
const search = ref("");
const swal = inject("$swal");
const { flash, confirmAtts } = useFlash();
const isLoading = ref(true);

const form = ref(
  new Form({
    id: "",
    name: "",
  })
);

let modal = null;

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getBrands();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getBrands();
  }
);

// Methods
const handleSubmit = () => {
  editMode.value ? update() : store();
};

const getBrands = async (page = 1) => {
  isLoading.value = true;
  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const { data: response } = await brandService.getBrands(params);
  brands.value = response;
  isLoading.value = false;
};
const handleCreate = () => {
  editMode.value = false;
  form.value.reset();
  modal.show();
};
const store = async () => {
  try {
    const { data: response } = await form.value.post(brandService.apiEndpoint);

    if (response.status == "success") {
      modal.hide();
      getBrands();
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleEdit = async (id) => {
  editMode.value = true;
  const { data: response } = await brandService.getBrand(id);
  form.value.fill(response.data);
  modal.show();
};

const update = async () => {
  try {
    const { data: response } = await form.value.put(
      `${brandService.apiEndpoint}/${form.value.id}`
    );

    if (response.status == "success") {
      modal.hide();
      getBrands();
      editMode.value = false;
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (id) => {
  const originalBrands = brands.value.data;

  brands.value.data = originalBrands.filter((brand) => brand.id !== id);

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await brandService.deleteBrand(id);
      if (response.status === "success") flash(response.message);
    } else brands.value.data = originalBrands;
  } catch (error) {
    brands.value.data = originalBrands;
    console.log(error);
    flash("An unexpected error occurred.", "error");
  }
};

// Hooks
onMounted(() => {
  getBrands();
  modal = new Modal(document.getElementById("brandsModal"), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Brands</h1>
      <button v-if="can('brand-add')" type="button" class="btn btn-primary" @click="handleCreate">
        Add Brand
      </button>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <PaginateDropdown v-model="paginate" />
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <Search v-model="search" />
      </div>
    </div>
    <div v-if="!isLoading">
      <BrandsTable
      :brands="brands.data"
      :sortColumn="sortColumn"
      @onEdit="handleEdit"
      @onDelete="handleDelete"
      @onSort="handleSort"
    />
    </div>
    <div v-else class="text-center" >
      <h3>Loading...</h3>
    </div>
   

    
    <template #footer v-if="!isLoading">
      <Pagination :data="brands" @pagination-change-page="getBrands" />
      <div class="text-center">
        <small>
          Showing {{ brands.meta.from }} to {{ brands.meta.to }} of
          {{ brands.meta.total }}
        </small>
      </div>
        </template>
  </Panel>

  <VueModal id="brandsModal" @onSubmit="handleSubmit">
    <template #title>
      <h5 class="fw-bold modal-title text-light" id="brandsModalLabel">
        {{ editMode ? "Edit" : "Add" }} Brands
      </h5>
    </template>
    <div class="mb-3">
      <label class="form-label" for="name">Name:</label>
      <input v-model="form.name" type="text" class="form-control" id="name" required />
      <HasError :form="form" field="name" />
    </div>
    <template #footer>
      <Button :form="form" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
