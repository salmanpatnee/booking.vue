<script setup>
import { onMounted, ref, computed } from "vue";
import http from "@@/services/HttpService";
import moment from "moment";
import Form from "vform";
import { Modal } from "bootstrap";
import expenseService from "@@/services/ExpenseService";
import expenseTypesService from "@@/services/ExpenseTypesService";
import { useAuthStore } from "@@/stores/authStore";
import { useFlash } from "@@/composables/useFlash";
import { useRouter } from "vue-router";
import { useCan } from "@@/composables/useCan";
import { useAppStore } from "@@/stores/appStore";

const appStore = useAppStore();
const { can } = useCan();
const authStore = useAuthStore();
const router = useRouter();
let modalID = "expensesModal";
let modal = null;

let registerModalId = "registerModal";
let registerModal = null;
let openRegisterModal = null;
let dayClosingModal = null;
const editMode = ref(false);
const daySummary = ref([]);
const expenseTypes = ref([]);
const { flash } = useFlash();

// const isRegisterOpen = computed(() => {
//   return authStore.user.cash_registers && authStore.user.cash_registers.length;
// });

const cashRegisterForm = ref(
  new Form({
    cash_in_hand: null,
    date: moment().format("YYYY-MM-DD"),
  })
);

const dayClosingForm = ref(
  new Form({
    cash_in_hand_at_end: null,
    date: moment().format("YYYY-MM-DD"),
  })
);

const form = ref(
  new Form({
    id: "",
    expense_type_id: "",
    payment_method_id: 1, //Cash
    amount: "",
    description: "",
    date: moment().format("YYYY-MM-DD"),
    by: "cashier",
  })
);

const getExpenseTypes = async () => {
  const { data: response } = await expenseTypesService.getTypes();
  expenseTypes.value = response.data;
};

const handleAddExpense = () => {
  form.value.reset();
  modal.show();
};
const store = async () => {
  try {
    const { data: response } = await form.value.post(
      expenseService.apiEndpoint
    );

    if (response.status == "success") {
      modal.hide();
      flash(response.message);
    }
  } catch (error) {
    flash(error.response.data.message, "error");
  }
};

const handleLogout = async () => {
  try {
    const response = await http.post(`/api/logout`);
    authStore.logout();
    router.push({ name: "login" });
    // if (response.status == 'success') {
    // // flash(response.message);
    // }
  } catch (error) {
    console.log({ error });
  }
};
const showClosingModal = async () => {
  dayClosingModal.show();
};
const getDaySummary = async () => {
  const { data: response } = await http.get(`/api/day-summary`);
  daySummary.value = response.data;
};

const handleOpenRegister = async () => {
  openRegisterModal.show();
};

const handleCashRegister = async () => {
  await cashRegisterForm.value
    .post(`/api/cash-registers`)
    .then((response) => {
      if (response.data.status == "success") {
        flash(response.data.message);
        authStore.user.cash_registers = response.data.data;
        cashRegisterForm.value.reset();
      }
    })
    .catch((error) => {
      flash(error.response.data.message, "error");
      authStore.user.cash_registers = null;
    });
};

/*
const handleCashRegister = async () => {
  try {
    await cashRegisterForm.value
      .post(`/api/cash-registers`)
      .then((response) => {
        if (response.data.status == "success") {
          openRegisterModal.hide();
          flash(response.data.message);
          authStore.user.cash_registers = response.data.data;
          cashRegisterForm.value.reset();
        }
      })
      .catch((error) => {
        flash(error.response.data.message, "error");
        authStore.user.cash_registers = {};
      });
  } catch (error) {
    flash(error.response.data.message, "error");
    authStore.user.cash_registers = {};
  }
};
*/

const handleRegisterClose = async () => {
  try {
    const { data: response } = await http.put(`/api/cash-registers/me`);

    if (response.status === "success") {
      flash(response.message);
      registerModal.hide();
      authStore.user.cash_registers = null;
    }
  } catch (error) {
    flash(error.response.data.message, "error");
  }
};

const handlePrepareDayClose = async () => {
  try {
    const { data: response } = await dayClosingForm.value.put(
      `/api/cash-registers/me`
    );

    if (response.status === "success") {
      dayClosingModal.hide();
      daySummary.value = response.data;
      registerModal.show();
      authStore.user.cash_registers = null;
    }
  } catch (error) {
    console.log({ error });
    flash(error.response.data.message, "error");
  }
};

onMounted(() => {
  // getExpenseTypes();
  moment().format();
});
</script>

<template>
  <nav class="navbar navbar-expand navbar-light navbar-bg">
    <a class="sidebar-toggle js-sidebar-toggle">
      <i class="hamburger align-self-center"></i>
    </a>

    <div class="navbar-collapse collapse">
      <ul class="navbar-nav navbar-align align-items-center">
        <li class="nav-item">
          <router-link
            class="btn btn-primary btn-lg mx-2"
            :to="{ name: 'bookings.create' }"
          >
            <i class="fa fa-plus-circle" aria-hidden="true"></i>
            New Booking
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            class="btn btn-primary btn-lg mx-2"
            :to="{ name: 'booking.items.index' }"
          >
            <i class="fa fa-calendar-minus-o" aria-hidden="true"></i>
            All Bookings Items
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            class="btn btn-primary btn-lg mx-2"
            :to="{ name: 'invoices.create' }"
          >
            <i class="fa fa-file" aria-hidden="true"></i>
            New Incoice
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            class="btn btn-primary btn-lg mx-2"
            :to="{ name: 'parts.create' }"
          >
            <i class="fa fa-th-large" aria-hidden="true"></i>
            Add Product
          </router-link>
        </li>
        <!-- <li class="nav-item">
          <router-link
            class="btn btn-primary btn-lg mx-2"
            :to="{ name: 'products.create' }"
          >
          <i class="fa fa-plus-circle" aria-hidden="true"></i>
            Add Product
          </router-link>
        </li> 
        <li class="nav-item">
          <router-link
            class="btn btn-primary btn-lg mx-2"
            :to="{ name: 'purchases.create' }"
          >
          <i class="fa fa-plus-circle" aria-hidden="true"></i>
            Add Purchase
          </router-link>
        </li>
        -->
        <li class="nav-item dropdown">
          <a
            class="nav-icon dropdown-toggle d-inline-block d-sm-none"
            href="#"
            data-bs-toggle="dropdown"
          >
            <i class="align-middle" data-feather="settings"></i>
          </a>

          <a
            class="nav-link dropdown-toggle d-none d-sm-inline-block"
            href="#"
            data-bs-toggle="dropdown"
          >
            <img
              src="/src/assets/img/avatars/avatar.jpg"
              class="avatar img-fluid rounded me-1"
              alt="Charles Hall"
            />
            <span class="text-dark">{{ authStore.user.name }}</span>
            <!-- <pre>{{ authStore.user.name }}</pre> -->
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <!-- <a class="dropdown-item" href="pages-profile.html"
              ><i class="align-middle me-1" data-feather="user"></i> Profile</a
            >
            <a class="dropdown-item" href="#"
              ><i class="align-middle me-1" data-feather="pie-chart"></i>
              Analytics</a
            >
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="index.html"
              ><i class="align-middle me-1" data-feather="settings"></i>
              Settings & Privacy</a
            >-->
            <!-- <a
              v-if="can('sale-edit') && appStore.isDayOpen"
              @click.prevent="showClosingModal"
              class="dropdown-item"
              href="#"
              ><i class="align-middle me-1" data-feather="help-circle"></i>
              Close Register</a
            > 
            <div class="dropdown-divider"></div>-->
            <a @click.prevent="handleLogout()" class="dropdown-item" href="#"
              >Log out</a
            >
          </div>
        </li>
      </ul>
    </div>
  </nav>

  <Teleport to="body">
    <VueModal id="openRegisterModalId" class="modal-lg" @onSubmit="">
      <template #title>
        <h3 class="m-0 text-light fw-bold">
          Open Register ({{ moment().format("dddd, MMMM Do YYYY") }})
        </h3>
      </template>
      <div class="row">
        <div class="col-2"></div>
        <div class="col">
          <div class="row mb-4 align-items-end">
            <div class="col-8">
              <!-- <label for="cash_in_hand" class="form-label">Cash in Hand:</label> -->
              <input
                type="number"
                placeholder="Cash in Hand"
                v-model="cashRegisterForm.cash_in_hand"
                class="form-control form-control-lg"
                id="cash_in_hand"
                required=""
              />
            </div>
            <div class="col-4">
              <button
                :disabled="!cashRegisterForm.cash_in_hand"
                type="button"
                @click.prevent="handleCashRegister"
                class="btn btn-primary"
              >
                Open Register
              </button>
            </div>
          </div>
        </div>
        <div class="col-2"></div>
      </div>

      <!-- <template #footer>
        <Button :form="form" class="btn btn-primary">Open</Button>
      </template> -->
    </VueModal>

    <VueModal id="dayClosingModalId" class="modal-lg" @onSubmit="">
      <template #title v-if="authStore.isRegisterOpen">
        <h3 class="m-0 text-light fw-bold">
          Day Closing (<app-date :timestamp="authStore.getRegisterDate" />)
        </h3>
      </template>
      <div class="row">
        <div class="col-2"></div>
        <div class="col">
          <div class="row mb-4 align-items-end">
            <div class="col-8">
              <!-- <label for="cash_in_hand" class="form-label">Cash in Hand:</label> -->
              <input
                type="number"
                placeholder="Cash in Till"
                v-model="dayClosingForm.cash_in_hand_at_end"
                class="form-control form-control-lg"
                id="cash_in_hand_at_end"
                min="0"
                required=""
              />
            </div>
            <div class="col-4">
              <button
                :disabled="!dayClosingForm.cash_in_hand_at_end"
                type="button"
                @click.prevent="handlePrepareDayClose"
                class="btn btn-primary"
              >
                Close Day
              </button>
            </div>
          </div>
        </div>
        <div class="col-2"></div>
      </div>
    </VueModal>
  </Teleport>

  <VueModal
    :id="registerModalId"
    class="modal-lg"
    @onSubmit="handleRegisterClose"
  >
    <template #title>
      <h3 class="m-0 text-light fw-bold">
        Register ({{ moment().format("dddd, MMMM Do YYYY") }})
      </h3>
    </template>
    <!-- <pre>{{ daySummary }}</pre> -->
    <div class="mb-3 table-responsive" v-if="daySummary">
      <table class="table">
        <thead>
          <tr>
            <th>Payment Method</th>
            <th>Sell</th>
            <!-- <th>Expense</th> -->
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cash in Hand:</td>
            <td>{{ daySummary.cash_in_hand }}</td>
            <!-- <td>--</td> -->
          </tr>
          <tr>
            <td>Cash Payment:</td>
            <td>{{ daySummary.cash_sales_amount }}</td>
            <!-- <td>--</td> -->
          </tr>
          <tr>
            <td>Card Payment:</td>
            <td>{{ daySummary.card_sales_amount }}</td>
            <!-- <td>--</td> -->
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mb-3 table-responsive">
      <table class="table">
        <tbody>
          <tr class="bg-success text-light fw-bold">
            <th>Total Sales</th>
            <td>{{ daySummary.total_sales_amount }}</td>
          </tr>
          <tr class="fw-bold">
            <th>Total Return</th>
            <td class="text-danger">
              {{ daySummary.total_sales_return_amount }}
            </td>
          </tr>
          <tr class="fw-bold">
            <th>Total Expense</th>
            <td>{{ daySummary.total_expense_amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <template #footer>
      <Button :form="form" class="btn btn-primary">Close Register</Button>
    </template> -->
  </VueModal>

  <VueModal :id="modalID" @onSubmit="store">
    <template #title> {{ editMode ? "Edit" : "Add" }} Expense </template>
    <div class="mb-3">
      <label class="form-label" for="expense_type_id">Type:</label>
      <select
        v-model="form.expense_type_id"
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
