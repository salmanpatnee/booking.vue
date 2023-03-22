<script setup>
import Form from "vform";
import { Modal } from "bootstrap";
import { onMounted, ref, inject } from "vue";
import expenseTypeService from "@@/services/ExpenseTypesService";
import { useFlash } from "@@/composables/useFlash";
import TypesTable from "./TypesTable.vue";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const expenseTypes = ref([]);
const editMode = ref(false);
const swal = inject("$swal");
const { flash, confirmAtts } = useFlash();
let modalID = "expenseTypesModal";
let modal = null;
const sortColumn = ref({ path: "name", order: "asc" });

const form = ref(
  new Form({
    id: "",
    name: "",
  })
);

// Methods
const getExpenseTypes = async () => {
  const { order, path } = sortColumn.value;
  const { data: types } = await expenseTypeService.getTypes(
    "?sortOrder=" + order + "&orderBy=" + path
  );
  expenseTypes.value = types.data;
};

const handleCreate = () => {
  editMode.value = false;
  form.value.reset();
  modal.show();
};

const store = async () => {
  try {
    const { data: response } = await form.value.post(
      expenseTypeService.apiEndpoint
    );

    if (response.status == "success") {
      modal.hide();
      getExpenseTypes();
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleEdit = async (id) => {
  editMode.value = true;
  const { data: response } = await expenseTypeService.getType(id);
  form.value.fill(response.data);
  modal.show();
};

const update = async () => {
  try {
    const { data: response } = await form.value.put(
      `${expenseTypeService.apiEndpoint}/${form.value.id}`
    );

    if (response.status == "success") {
      modal.hide();
      getExpenseTypes();
      editMode.value = false;
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};
const handleDelete = async (id) => {
  const originalTypes = expenseTypes.value;
  expenseTypes.value = originalTypes.filter((type) => type.id !== id);

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await expenseTypeService.deleteType(id);
      if (response.status === "success") flash(response.message);
    } else expenseTypes.value = originalTypes;
  } catch (error) {
    expenseTypes.value = originalTypes;
    console.log(error);
    flash("An unexpected error occurred.", "error");
  }
};

const handleSubmit = () => {
  editMode.value ? update() : store();
};
const handleSort = (sortColumn) => {
  sortColumn.value = sortColumn;
  getExpenseTypes();
};

onMounted(() => {
  getExpenseTypes();

  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 text-middle">Expense Types</h1>
      <button
        v-if="can('expense-add')"
        type="button"
        class="btn btn-primary"
        @click="handleCreate"
      >
        Add Type
      </button>
    </template>
    <div class="row">
      <div class="col-12">
        <TypesTable
          :types="expenseTypes"
          :sortColumn="sortColumn"
          @onEdit="handleEdit"
          @onDelete="handleDelete"
          @onSort="handleSort"
        />
      </div>
    </div>
  </Panel>

  <Teleport to="body">
    <VueModal :id="modalID" @onSubmit="handleSubmit">
      <template #title> {{ editMode ? "Edit" : "Add" }} Expense Type </template>
      <div class="mb-3">
        <label class="form-label" for="name">Name:</label>
        <input
          v-model="form.name"
          type="text"
          class="form-control form-control-lg"
          id="name"
          required
        />
        <HasError :form="form" field="name" />
      </div>
      <template #footer>
        <Button :form="form" class="btn btn-primary">Save</Button>
      </template>
    </VueModal>
  </Teleport>
</template>
