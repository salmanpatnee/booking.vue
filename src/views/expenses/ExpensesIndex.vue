<script setup>
import expenseService from "@@/services/ExpenseService";
import expenseTypesService from "@@/services/ExpenseTypesService";
import Form from "vform";
import { Modal } from "bootstrap";
import moment from "moment";
import { useFlash } from "@@/composables/useFlash";
import { useCan } from "@@/composables/useCan";
import { onMounted, ref, inject, watch } from "vue";

// Data
const { can } = useCan();
const { flash, confirmAtts } = useFlash();
const expenseTypes = ref([]);
const expenses = ref({
  data: [],
  isLoading: true,
});
let start_date = ref("");
let end_date = ref("");
const editMode = ref(false);
const paginate = ref(25);
const search = ref("");
const swal = inject("$swal");
let modalID = "expensesModal";
let modal = null;

const form = ref(
  new Form({
    id: "",
    expense_type_id: "",
    payment_method_id: 1, //Cash
    amount: "",
    description: "",
    date: moment().format("YYYY-MM-DD"),
  })
);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getExpenses();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getExpenses();
  }
);

const handleSubmit = () => {
  editMode.value ? update() : addExpense();
};

// Methods
const getExpenses = async (page = 1) => {
  expenses.value.isLoading = true;

  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}&start_date=${start_date.value}&end_date=${end_date.value}`;
  const { data: response } = await expenseService.getExpenses(params);
  expenses.value = response;
  expenses.value.isLoading = false;
};
const getExpenseTypes = async () => {
  const { data: response } = await expenseTypesService.getTypes();
  expenseTypes.value = response.data;
};

const handleCreate = () => {
  editMode.value = false;
  form.value.reset();
  modal.show();
};
const addExpense = async () => {
  try {
    const { data: response } = await form.value.post(
      expenseService.apiEndpoint
    );

    console.log({ response }, "Expense");

    if (response.status == "success") {
      modal.hide();
      getExpenses();
      flash(response.message);
    }
  } catch (error) {
    console.log({ error });
    flash(error.response.data.message, "error");
  }
};

const edit = async (id) => {
  editMode.value = true;
  const { data: response } = await expenseService.getExpense(id);
  form.value.fill(response.data);
  // const obj = {...response.data.data, date:moment(response.data.data.date).format("YYYY-MM-DD")};
  // form.value.fill(obj);
  modal.show();
};

const update = async () => {
  try {
    const { data: response } = await form.value.put(
      `${expense.apiEndpoint}/${form.value.id}`
    );

    if (response.status == "success") {
      modal.hide();
      getExpenses();
      editMode.value = false;
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (id) => {
  const originalExpenses = expenses.value;
  expenses.value = originalExpenses.filter((expense) => expense.id !== id);

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await expenseService.deleteExpense(id);
      if (response.status === "success") flash(response.message);
    } else expenses.value = originalExpenses;
  } catch (error) {
    expenses.value = originalExpenses;
    console.log(error);
    flash("An unexpected error occurred.", "error");
  }
};

const handleFilterExpenses = async () => {
  await getExpenses();
};

// Hooks
onMounted(async () => {
  await getExpenses();
  await getExpenseTypes();
  moment().format();
  modal = new Modal(document.getElementById("ExpensesModal"), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <div class="row g-3">
      <div class="col">
        <div class="row">
          <label for="start_date" class="col-sm-4 fw-bold col-form-label"
            >Start Date</label
          >
          <div class="col-sm-8">
            <input
              type="date"
              id="start_date"
              v-model="start_date"
              class="form-control"
              placeholder="Start Date"
            />
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <label for="end_date" class="col-sm-4 fw-bold col-form-label"
            >End Date</label
          >
          <div class="col-sm-8">
            <input
              type="date"
              id="end_date"
              v-model="end_date"
              class="form-control"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
      <div class="col">
        <button
          type="button"
          @click="handleFilterExpenses"
          class="btn btn-primary"
        >
          Filter
        </button>
      </div>
    </div>
  </Panel>

  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Expenses</h1>
      <button
        v-if="can('expense-add')"
        type="button"
        class="btn btn-primary"
        @click="handleCreate"
      >
        Add Expense
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

    <div class="table-responsive" v-if="!expenses.isLoading">
      <table class="card-1 mb-0 table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <td>#</td>
            <td>Date</td>
            <td>Type</td>
            <td>Amount</td>
            <td>Description</td>
            <!-- <td>Action</td> -->
          </tr>
        </thead>

        <tbody>
          <tr v-for="(expense, index) in expenses.data" :key="expense.id">
            <td>{{ index + 1 }}</td>
            <td><AppDate :timestamp="expense.date" /></td>
            <td>{{ expense.expense_type }}</td>
            <td>{{ expense.amount }}</td>
            <td>{{ expense.description }}</td>
            <!-- <td>
              <div class="text-center">
                <button
                  @click.prevent="edit(expense.id)"
                  v-if="can('expense-edit')"
                  class="btn btn-sm btn-info me-1 mb-1"
                >
                  <div class="fa fa-pencil"></div>
                </button>
                <button
                  @click.prevent="destroy(expense.id)"
                  v-if="can('expense-delete')"
                  class="btn btn-sm btn-danger me-1 mb-1"
                >
                  <div class="fa fa-trash"></div>
                </button>
              </div>
            </td> -->
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <AppLoader />
    </div>
    <template #footer v-if="!expenses.isLoading">
      <Pagination :data="expenses" @pagination-change-page="getExpenses" />

      <div class="text-center">
        <small>
          Showing {{ expenses.meta.from }} to {{ expenses.meta.to }} of
          {{ expenses.meta.total }}
        </small>
      </div>
    </template>
  </Panel>

  <VueModal :id="modalID" @onSubmit="handleSubmit">
    <template #title> {{ editMode ? "Edit" : "Add" }} Expense </template>
    <div class="mb-3">
      <label class="form-label" for="expense_type_id">Type:</label>
      <select
        v-model="form.expense_type_id"
        required
        class="form-control"
        id="expense_type_id"
      >
        <option value="">Select Type</option>
        <option
          :value="expenseType.id"
          v-for="expenseType in expenseTypes"
          :key="expenseType.id"
        >
          {{ expenseType.name }}
        </option>
      </select>
      <HasError :form="form" field="expense_type_id" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="amount">Amount:</label>
      <input
        required
        min="1"
        v-model="form.amount"
        type="number"
        class="form-control"
        id="amount"
      />
      <HasError :form="form" field="amount" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="description">Description:</label>
      <textarea
        v-model="form.description"
        class="form-control"
        id="description"
      ></textarea>
      <HasError :form="form" field="description" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="date">Date:</label>
      <input v-model="form.date" type="date" class="form-control" id="date" />
      <HasError :form="form" field="date" />
    </div>

    <input
      type="hidden"
      name="payment_method_id"
      v-model="form.payment_method_id"
    />
    <template #footer>
      <Button :disabled="form.amount == ''" :form="form" class="btn btn-primary"
        >Save</Button
      >
    </template>
  </VueModal>
</template>
