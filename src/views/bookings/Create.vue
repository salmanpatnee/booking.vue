<script setup>
import http from "@@/services/HttpService";
import { useAuthStore } from "@@/stores/authStore";
import { onMounted, ref, inject, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
import { useToast } from "vue-toastification";
import moment from "moment";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";
import { Modal } from "bootstrap";
import { useFlash } from "@@/composables/useFlash";

// Data
const authStore = useAuthStore();

const isLoaded = ref(false);
const { flash } = useFlash();
const sale = ref({
  data: null,
  isLoading: true,
});

const route = useRoute();
const router = useRouter();
const toast = ref(useToast());
const customers = ref({
  isLoading: false,
  data: [],
});
const employees = ref({
  isLoading: false,
  data: [],
});
const products = ref([]);
const baseEndpoint = "/api/sales";
const swal = inject("$swal");
const barcodeInput = ref(null);
const productBarcodeInput = ref(null);

let discountRateKey = "discount_rate_cash";
let modal = null;
let modalID = "customersModal";
let shouldSubmit = true;
const bankAccounts = ref([]);

// const isRegisterOpen = computed(() => {
//   return authStore.user.cash_registers.length;
// });

const getEmployees = async (page = 1) => {
  // const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const params = `?for=sales.create`;
  employees.value.loading = true;
  const { data: response } = await axios.get(`/api/employees`);
  employees.value.data = response.data;
  employees.value.loading = false;
};

const handleShipment = () => {
  if (form.value.is_deliverable) {
    discountRateKey = "discount_rate_shipment";
  } else {
    discountRateKey = "discount_rate_cash";
  }

  form.value.sale_details.forEach((sD) => {
    console.log(sD[discountRateKey]);
    sD.discount_rate = sD[discountRateKey];
    console.log(sD[discountRateKey] / 100);
    sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
  });
};

const form = ref(
  new Form({
    id: "",
    account_id: "",
    employee_id: "",
    date: moment().format("YYYY-MM-DD"),
    device_name: null,
    model_no: null,
    imei: null,
    estimated_cost: null,
    issue: null,
    // status: "inprogress",
  })
);

const selectedProduct = ref(null);
const selectedCustomer = ref(null);

const customerForm = ref(
  new Form({
    id: "",
    name: "",
    email: "",
    phone: "",
    trader: "",
    balance: 0.0,
    account_type: "customer",
    for: "pos",
  })
);

// Methods

const addCustomer = () => {
  customerForm.value
    .post(`api/sales/customers`)
    .then((response) => {
      if (response.data.status == "success") {
        selectedCustomer.value = response.data.data;
        form.value.account_id = selectedCustomer.value.id;
        modal.hide();
      }
    })
    .catch((error) => {
      flash(error.response.data.message, "error");
    });
};

const handleSubmit = async () => {
  try {
    const { data: response } = await form.value.post(`/api/bookings`);

    if (response.status == "success") {
      form.value.reset();
      selectedCustomer.value = "";

      swal
        .fire({
          title: "Success!",
          text: "Do You Want To Print ?",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Yes!",
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            let routeData = router.resolve({
              name: "bookings.proceed.invoice",
              params: { id: response.data.id },
            });
            window.open(routeData.href, "_blank");
          }
        });
    }
  } catch (error) {
    console.log(error);
  }
};


const handleSelectedCustomer = () => {
  form.value.account_id = selectedCustomer.value.id;
};

const showCustomerModal = () => {
  customerForm.value.reset();
  modal.show();
};

// Hooks
onMounted(async () => {
  await getEmployees();
  
  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Add Booking</h1>
      </template>
      <div class="d-flex g-0 align-items-end mb-5 col-8">
        <div class="col">
          <FormAjaxSelect
            ref="customerInput"
            name="customer"
            slug="customers"
            label="Select / Add Customer"
            v-model="selectedCustomer"
            @update:modelValue="handleSelectedCustomer"
            @add-new-customer="showCustomerModal"
          />
        </div>
        <div class="col-auto">
          <button
            type="button"
            class="btn-primary btn rounded-0"
            @click="showCustomerModal"
          >
            <i class="fa fa-plus"></i>
          </button>
        </div>
      </div>
      <div class="mt-3">
        <h3>Issue Description</h3>
        <div class="row mt-4">
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="device_name"
                ><b>Device Name:</b></label
              >
              <input
                type="text"
                class="form-control"
                v-model="form.device_name"
                id="device_name"
                placeholder="Samsung"
                required
              />
              <HasError :form="form" field="device_name" />
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="model_no"><b>Model No:</b></label>
              <input
                type="text"
                class="form-control"
                v-model="form.model_no"
                id="model_no"
                placeholder="A32"
                required
              />
              <HasError :form="form" field="model_no" />
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="imei"><b>IMEI:</b></label>
              <input
                type="text"
                class="form-control"
                v-model="form.imei"
                id="imei"
                placeholder="789654123963"
                required
                maxlength="15"
              />
              <HasError :form="form" field="imei" />
            </div>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-4">
            <label class="form-label" for="estimated_cost"
              ><b>Estimated Cost:</b></label
            >
            <input
              type="number"
              class="form-control"
              v-model="form.estimated_cost"
              placeholder="500"
              id="estimated_cost"
              required
            />
            <HasError :form="form" field="estimated_cost" />
          </div>
          <div class="col-4">
            <label class="form-label" for="estimated_cost"
              ><b>Employee / Technician:</b></label
            >
            <select class="form-control" v-model="form.employee_id" required>
              <option value="">--Select--</option>
              <option
                :value="employee.id"
                v-for="employee in employees.data"
                :key="employee.id"
              >
                {{ employee.name }}
              </option>
            </select>
            <HasError :form="form" field="employee_id" />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-8">
          <label class="form-label" for="imei"><b>Issue:</b></label>
          <textarea
            v-model="form.issue"
            id="issue"
            class="form-control w-100"
            placeholder="Display panel"
            required
          ></textarea>

          <HasError :form="form" field="issue" />
        </div>
      </div>
      <template #footer>
        <div class="text-end">
          <Button :form="form" class="btn btn-lg btn-primary">Save</Button>
        </div>
      </template>
    </Panel>
  </form>

  <VueModal :id="modalID" @onSubmit="addCustomer">
    <template #title> Add Customer </template>
    <div class="mb-3">
      <label class="form-label" for="name">Name:</label>
      <input
        v-model="customerForm.name"
        type="text"
        class="form-control"
        id="name"
      />
      <HasError :form="customerForm" field="name" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="phone">Phone:</label>
      <input
        v-model="customerForm.phone"
        type="tel"
        class="form-control"
        id="phone"
      />
      <HasError :form="customerForm" field="phone" />
    </div>

    <div class="mb-3">
      <label class="form-label" for="email">Email:</label>
      <input
        v-model="customerForm.email"
        type="email"
        class="form-control"
        id="email"
      />
      <HasError :form="form" field="email" />
    </div>

    <div class="mb-3">
      <label class="form-label" for="trader">Trader:</label>
      <input
        v-model="customerForm.trader"
        type="text"
        class="form-control"
        id="trader"
      />
      <HasError :form="customerForm" field="trader" />
    </div>
    <template #footer>
      <Button :form="customerForm" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
