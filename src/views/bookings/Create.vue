<script setup>
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
import { v4 as uuidv4 } from "uuid";

// Data
const baseEndpoint = "/api/sales";
const { flash } = useFlash();
const router = useRouter();
const toast = ref(useToast());

const employees = ref({
  isLoading: false,
  data: [],
});

const swal = inject("$swal");
let modal = null;
let modalID = "customersModal";


const getEmployees = async (page = 1) => {
  employees.value.loading = true;
  const { data: response } = await axios.get(`/api/employees`);
  employees.value.data = response.data;
  employees.value.loading = false;
};

const form = ref(
  new Form({
    id: "",
    account_id: "",
    date: moment().format("YYYY-MM-DD"),
    booking_item_details: [],
  })
);

const selectedCustomer = ref(null);

const customerForm = ref(
  new Form({
    id: "",
    name: "",
    trade_name: "",
    phone: "",
    email: "",
    address: "",
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
const handleAddBookingItem = (index) => {
  const newBookingItem = {
    id: uuidv4(),
    employee_id: "",
    device_name: null,
    imei: null,
    device_type: "",
    device_make: "",
    device_model: "",
    issue: null,
    issue_type: "",
    estimated_delivery_date: null,
    serial_no: null,
    customer_comments: null,
    notes: null,
    estimated_cost: null,
  };
  form.value.booking_item_details.push(newBookingItem);
};

const handleDeleteBookingItem = (booingItem) => {
  form.value.booking_item_details = form.value.booking_item_details.filter(
    (q) => q.id !== booingItem.id
  );
};

const handleSubmit = async () => {
  try {
    const { data: response } = await form.value.post(`/api/booking-list`);

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
          router.push({ name: "booking.items.index" });
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
        <h1 class="h3 mb-0 text-middle">New Booking</h1>
      </template>
      <div class="d-flex g-0 align-items-end col-8">
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
      <HasError :form="form" field="account_id" />
      <div class="mt-5">
        <div class="d-flex justify-content-between mt-4 mb-4">
          <h3>Booking Details</h3>
          <div class="text-end">
            <button
              v-if="!form.booking_item_details.length"
              type="button"
              @click="handleAddBookingItem()"
              class="btn btn-primary"
            >
              <i class="fa fa-plus"></i>
            </button>
          </div>
        </div>
        <hr />
        <div class="mb-5">
          <h4 class="text-center" v-if="!form.booking_item_details.length">
            You do not have any items
          </h4>
          <div
            v-for="(item, index) in form.booking_item_details"
            :key="item.id"
          >
            <!-- <pre>{{ item }}</pre> -->
            <div
              class="mb-3 d-flex justify-content-between align-content-center"
            >
              <h4 class="badge bg-primary text-white fs-4">
                Booking Item <b>#{{ index + 1 }}</b>
              </h4>
              <button
                @click="handleDeleteBookingItem(item)"
                type="button"
                class="btn btn-danger"
              >
                <i class="fa fa-trash"></i>
              </button>
            </div>
            <div class="row mt-4">
              <div class="col">
                <div class="mb-3">
                  <label class="form-label" for="device_name"
                    ><b>Item Details:</b></label
                  >
                  <input
                    type="text"
                    class="form-control"
                    v-model="item.device_name"
                    id="device_name"
                    placeholder="Samsung"
                  />
                  <HasError :form="form" field="device_name" />
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label class="form-label" for="imei"><b>IMEI No:</b></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="item.imei"
                    id="imei"
                    placeholder="789654123963"
                    maxlength="15"
                  />
                  <HasError :form="form" field="imei" />
                </div>
              </div>
              <div class="col">
                <div class="mb-3">
                  <label class="form-label" for="device_type"
                    ><b>Device Type:</b></label
                  >
                  <select
                    class="form-select"
                    v-model="item.device_type"
                    id="device_type"
                  >
                    <option value="">Select Device Type</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Smartwatches">Smartwatches</option>
                    <option value="Gaming Consoles">Gaming Consoles</option>
                    <option value="Audio Devices">Audio Devices</option>
                    <option value="Digital Cameras">Digital Cameras</option>
                    <option value="Drones">Drones</option>
                    <option value="VR Headsets">VR Headsets</option>
                    <option value="Other">Other</option>
                  </select>
                  <HasError :form="form" field="device_type" />
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-4">
                <label class="form-label" for="device_make"
                  ><b>Device Make:</b></label
                >
                <select
                  class="form-select"
                  v-model="item.device_make"
                  id="device_make"
                >
                  <option value="">Select Device Make</option>
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Huawei">Huawei</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Oppo">Oppo</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Sony">Sony</option>
                  <option value="LG">LG</option>
                  <option value="HTC">HTC</option>
                  <option value="Motorola">Motorola</option>
                  <option value="Nokia">Nokia</option>
                  <option value="Blackberry">Blackberry</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="Asus">Asus</option>
                  <option value="Dell">Dell</option>
                  <option value="HP">HP</option>
                  <option value="Acer">Acer</option>
                  <option value="Toshiba">Toshiba</option>
                  <option value="Panasonic">Panasonic</option>
                  <option value="Fujitsu">Fujitsu</option>
                  <option value="Other">Other</option>
                </select>
                <HasError :form="form" field="device_make" />
              </div>
              <div class="col-4">
                <label class="form-label" for="device_model"
                  ><b>Device Model:</b></label
                >
                <input
                  type="text"
                  class="form-control"
                  v-model="item.device_model"
                  id="device_model"
                  placeholder="A32"
                />
                <HasError :form="form" field="device_model" />
              </div>
              <div class="col-4">
                <label class="form-label" for="issue_type"
                  ><b>Fault Type:</b></label
                >
                <select
                  class="form-select"
                  v-model="item.issue_type"
                  id="issue_type"
                >
                  <option value="">Select Fault Type</option>
                  <option value="Screen Damage">Screen Damage</option>
                  <option value="Battery Problems">Battery Problems</option>
                  <option value="Water Damage">Water Damage</option>
                  <option value="Software Issues">Software Issues</option>
                  <option value="Hardware Issues">Hardware Issues</option>
                  <option value="Data Recovery">Data Recovery</option>
                  <option value="Speaker and Microphone Issues"
                    >Speaker and Microphone Issues</option
                  >
                  <option value="Signal and Connectivity Issues"
                    >Signal and Connectivity Issues</option
                  >
                  <option value="Touchscreen Problems"
                    >Touchscreen Problems</option
                  >
                  <option value="Charging Issues">Charging Issues</option>
                  <option value="Malware and Virus Removal"
                    >Malware and Virus Removal</option
                  >
                  <option value="Overheating Issues">Overheating Issues</option>
                  <option value="Device not Turning on"
                    >Device not Turning on</option
                  >
                  <option value="Device Freezing or Crashing"
                    >Device Freezing or Crashing</option
                  >
                  <option value="SIM Card Issues">SIM Card Issues</option>
                  <option value="GPS Issues">GPS Issues</option>
                  <option value="Camera Issues">Camera Issues</option>
                  <option value="Audio Jack Issues">Audio Jack Issues</option>
                  <option value="Physical Damage">Physical Damage</option>
                  <option value="Other">Other</option>
                </select>
                <HasError :form="form" field="issue_type" />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-8">
                <label class="form-label" for="imei"><b>Item Fault:</b></label>
                <textarea
                  v-model="item.issue"
                  id="issue"
                  class="form-control w-100"
                  placeholder="Display panel"
                ></textarea>

                <HasError :form="form" field="issue" />
              </div>
              <div class="col-4">
                <label class="form-label" for="estimated_delivery_date"
                  ><b>Estimated Delivery Date:</b></label
                >
                <input
                  type="date"
                  class="form-control"
                  v-model="item.estimated_delivery_date"
                  id="estimated_delivery_date"
                />
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
                  v-model="item.estimated_cost"
                  placeholder="500"
                  id="estimated_cost"
                />
                <HasError :form="form" field="estimated_cost" />
              </div>
              <div class="col-4">
                <label class="form-label" for="employee_id"
                  ><b>Employee / Technician:</b></label
                >
                <select class="form-control" v-model="item.employee_id">
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
              <div class="col-4">
                <label class="form-label" for="serial_no"
                  ><b>Serial No:</b></label
                >
                <input
                  type="number"
                  class="form-control"
                  v-model="item.serial_no"
                  placeholder="Optional"
                  id="serial_no"
                />
                <HasError :form="form" field="serial_no" />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <label class="form-label" for="customer_comments"
                  ><b>Customer Notes:</b></label
                >
                <textarea
                  v-model="item.customer_comments"
                  id="customer_comments"
                  class="form-control w-100"
                  placeholder="Optional"
                ></textarea>

                <HasError :form="form" field="customer_comments" />
              </div>
              <div class="col-6">
                <label class="form-label" for="notes"><b>Notes:</b></label>
                <textarea
                  v-model="item.notes"
                  id="notes"
                  class="form-control w-100"
                  placeholder="Optional"
                ></textarea>

                <HasError :form="form" field="notes" />
              </div>
            </div>

            <div class="d-flex justify-content-end mt-5"></div>
            <hr class="mt-5 mb-4" />
          </div>
          <div class="text-end" v-if="form.booking_item_details.length">
            <button
              @click="handleAddBookingItem(index)"
              type="button"
              class="btn btn-primary me-2"
            >
              <i class="fa fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="text-end">
          <Button
            :form="form"
            :disabled="!form.booking_item_details.length"
            class="btn btn-lg btn-primary"
            >Save</Button
          >
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
      <label class="form-label" for="trade_name">Trade Name:</label>
      <input
        v-model="customerForm.trade_name"
        type="text"
        class="form-control"
        id="trade_name"
      />
      <HasError :form="customerForm" field="trade_name" />
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
      <HasError :form="customerForm" field="email" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="address">Address:</label>
      <textarea
        v-model="customerForm.address"
        type="address"
        class="form-control"
        id="address"
      ></textarea>
      <HasError :form="customerForm" field="address" />
    </div>
    <template #footer>
      <Button :form="customerForm" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
