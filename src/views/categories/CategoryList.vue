<script setup>
import { Modal } from "bootstrap";
import Form from "vform";
import { onMounted, ref, inject, watch } from "vue";
import categoryService from "@@/services/CategoryService";
import { useFlash } from "@@/composables/useFlash";
import CategoriesTable from "./CategoriesTable.vue";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const categories = ref([]);
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
    getCategories();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getCategories();
  }
);

// Methods
const handleSubmit = () => {
  editMode.value ? update() : store();
};

const getCategories = async (page = 1) => {
  isLoading.value = true;
  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const { data: response } = await categoryService.getCategories(params);
  categories.value = response;
  isLoading.value = false;
};

const handleCreate = () => {
  editMode.value = false;
  form.value.reset();
  modal.show();
};

const store = async () => {
  try {
    const { data: response } = await form.value.post(
      categoryService.apiEndpoint
    );

    if (response.status == "success") {
      modal.hide();
      getCategories();
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleEdit = async (id) => {
  editMode.value = true;
  const { data: response } = await categoryService.getCategory(id);
  form.value.fill(response.data);
  modal.show();
};

const update = async () => {
  try {
    const { data: response } = await form.value.put(
      `${categoryService.apiEndpoint}/${form.value.id}`
    );

    if (response.status == "success") {
      modal.hide();
      getCategories();
      editMode.value = false;
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (id) => {
  const originalCategories = categories.value.data;

  categories.value.data = originalCategories.filter(
    (category) => category.id !== id
  );

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await categoryService.deleteCategory(id);
      if (response.status === "success") flash(response.message);
    } else categories.value.data = originalCategories;
  } catch (error) {
    categories.value.data = originalCategories;
    console.log(error);
    flash("An unexpected error occurred.", "error");
  }
};

// Hooks
onMounted(async () => {
  await getCategories();
  modal = new Modal(document.getElementById("categoriesModal"), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Categories</h1>
      <button
        v-if="can('category-add')"
        type="button"
        class="btn btn-primary"
        @click="handleCreate"
      >
        Add Category
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
      <CategoriesTable
      :categories="categories.data"
      :sortColumn="sortColumn"
      @onEdit="handleEdit"
      @onDelete="handleDelete"
      @onSort="handleSort"
    />
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    

    <template #footer v-if="!isLoading">
      <Pagination :data="categories" @pagination-change-page="getCategories" />
      <div class="text-center">
        <small>
          Showing {{ categories.meta.from }} to {{ categories.meta.to }} of
          {{ categories.meta.total }}
        </small>
      </div>
    </template>
  </Panel>

  <VueModal id="categoriesModal" @onSubmit="handleSubmit">
    <template #title>
      <h5 class="fw-bold modal-title text-light" id="exampleModalLabel">
        {{ editMode ? "Edit" : "Add" }} Category
      </h5>
    </template>
    <div class="mb-3">
      <label class="form-label" for="name">Name:</label>
      <input
        v-model="form.name"
        type="text"
        class="form-control"
        id="name"
        required
      />
      <HasError :form="form" field="name" />
    </div>
    <template #footer>
      <Button :form="form" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
