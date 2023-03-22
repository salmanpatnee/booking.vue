<script setup>
import Form from "vform";
import { Modal } from "bootstrap";
import { onMounted, ref, inject, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useFlash } from "@@/composables/useFlash";
import supplierService from "@@/services/SupplierService";
import SuppliersTable from "./SuppliersTable.vue";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const suppliers = ref([]);
const isLoading = ref(true);
const { flash, confirmAtts } = useFlash();
const router = useRouter();
const editMode = ref(false);
const paginate = ref(25);
const search = ref("");
const swal = inject("$swal");
const sortColumn = ref({ path: "created_at", order: "asc" });
const modalID = "suppliersModal";
let modal = null;

const form = ref(
  new Form({
    id: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    balance: 0.0,
    account_type: "supplier",
  })
);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getSuppliers();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getSuppliers();
  }
);

// Methods
const handleSubmit = () => {
  editMode.value ? update() : store();
};

const getSuppliers = async (page = 1) => {
  isLoading.value = true;
  const { order, path } = sortColumn.value;
  const params = `?page=${page}&type=supplier&paginate=${paginate.value}&search=${search.value}&sortOrder=${order}&orderBy=${path}`;

  const { data: response } = await supplierService.getSuppliers(params);
  suppliers.value = response;
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
      supplierService.apiEndpoint
    );

    if (response.status == "success") {
      modal.hide();
      getSuppliers();
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};
const handleEdit = async (id) => {
  editMode.value = true;
  const { data: response } = await supplierService.getSupplier(id);
  form.value.fill(response.data);
  modal.show();
};
const update = async () => {
  try {
    const { data: response } = await form.value.patch(
      `${supplierService.apiEndpoint}/${form.value.id}`
    );
    if (response.status == "success") {
      modal.hide();
      getSuppliers();
      editMode.value = false;
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleShow = async (id) => {
  router.push({ name: "suppliers.show", params: { id: id } });
};
const handleViewLedger = async (id) => {
  router.push({ name: "accounts.ledger", params: { id: id } });
};

const handleDelete = async (id) => {
  const originalSuppliers = suppliers.value;
  suppliers.value = originalSuppliers.filter((supplier) => supplier.id !== id);

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await supplierService.deleteSupplier(id);
      if (response.status === "success") flash(response.message);
    } else suppliers.value = originalSuppliers;
  } catch (error) {
    suppliers.value = originalSuppliers;
    console.log(error);
    flash("An unexpected error occurred.", "error");
  }
};

const handleSort = (sortColumn) => {
  sortColumn.value = sortColumn;
  getSuppliers();
};

// Hooks
onMounted(() => {
  getSuppliers();
  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel >
 
    <template #header>
      <h1 class="h3 mb-0 text-middle">Suppliers</h1>
      <button
        v-if="can('supplier-add')"
        type="button"
        class="btn btn-primary"
        @click="handleCreate"
      >
        Add Supplier
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
      <SuppliersTable
      :suppliers="suppliers.data"
      :sortColumn="sortColumn"
      @onSort="handleSort"
      @onShow="handleShow"
      @onEdit="handleEdit"
      @onDelete="handleDelete"
      @onViewLedger="handleViewLedger"
    />
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    

    <template #footer v-if="!isLoading">
      <Pagination :data="suppliers" @pagination-change-page="getSuppliers" />

      <div class="text-center">
        <small>
          Showing {{ suppliers.meta.from }} to {{ suppliers.meta.to }} of
          {{ suppliers.meta.total }}
        </small>
      </div>
    </template>

  </Panel>

  <VueModal :id="modalID" @onSubmit="handleSubmit">
    <template #title> {{ editMode ? "Edit" : "Add" }} Supplier </template>
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
    <div class="mb-3">
      <label class="form-label" for="email">Email:</label>
      <input
        v-model="form.email"
        type="email"
        class="form-control"
        id="email"
      />
      <HasError :form="form" field="email" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="phone">Phone:</label>
      <input
        v-model="form.phone"
        type="tel"
        class="form-control"
        id="phone"
        required
      />
      <HasError :form="form" field="phone" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="company">Company:</label>
      <input
        v-model="form.company"
        type="text"
        class="form-control"
        id="company"
      />
      <HasError :form="form" field="company" />
    </div>
    <template #footer>
      <Button :form="form" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
