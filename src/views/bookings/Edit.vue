<script setup>
import { onMounted, ref, inject, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
import moment from "moment";
import { Modal } from "bootstrap";
import { useFlash } from "@@/composables/useFlash";

// Data
let modal = null;
let modalID = "messageModal";
let statusModal = null;
let statusModalID = "statusModal";

const baseEndpoint = "/api/booking-items";
const { flash } = useFlash();
const route = useRoute();
const router = useRouter();

const bookingItems = ref({
  data: null,
  isLoading: true,
});

const employees = ref({
  isLoading: false,
  data: [],
});

const swal = inject("$swal");

const form = ref(
  new Form({
    id: "",
    account_id: "",
    date: moment().format("YYYY-MM-DD"),
    booking_list_details: [],
  })
);

const messageForm = ref(
  new Form({
    message: null,
    phone: null,
  })
);

const statusForm = ref(
  new Form({
    id: null,
    status: null,
    estimated_cost: null,
    charges: null,
  })
);

// Methods
const getEmployees = async (page = 1) => {
  employees.value.loading = true;
  const { data: response } = await axios.get(`/api/employees`);
  employees.value.data = response.data;
  employees.value.loading = false;
};

const getItems = async () => {
  bookingItems.value.isLoading = true;
  const response = await axios.get(`${baseEndpoint}/${route.params.id}`);
  bookingItems.value.data = response.data.data;

  form.value.id = bookingItems.value.data.id;
  form.value.account = bookingItems.value.data.account;
  form.value.account_id = bookingItems.value.data.account.id;
  form.value.date = bookingItems.value.data.date;
  form.value.booking_list_details =
    bookingItems.value.data.booking_list_details;
  form.value.reference_id = bookingItems.value.data.reference_id;

  bookingItems.value.isLoading = false;
};

const handleSubmit = async () => {
  try {
    const { data: response } = await form.value.patch(
      `/api/booking-list/${form.value.id}`
    );

    if (response.status == "success") {
      form.value.reset();
      flash(response.message);
      router.push({ name: "booking.items.index" });
    }
  } catch (error) {
    flash(response.message, "error");
    console.log(error);
  }
};

const printBarcode = (id) => {
  const routeData = router.resolve({
    name: "bookings.barcode.print",
    params: { id },
  });
  window.open(routeData.href, "_blank");
};

const printSaleInvoice = (item) => {

  if(!item.charges){
    flash('Kindly add charges to generate sale invoice.', 'error');
    return;
  }

  const routeData = router.resolve({
    name: "bookings.invoice",
    params: { id: item.id },
  });
  window.open(routeData.href, "_blank");

  
};

const showStatusModal = (selectedItem) => {
  statusForm.value.id = selectedItem.id;
  statusForm.value.status = selectedItem.status;
  statusForm.value.estimated_cost = selectedItem.estimated_cost;
  statusModal.show();
};

const updateStatus = async () => {
  try {
    const { data: response } = await statusForm.value.patch(
      `/api/booking-items/${statusForm.value.id}/update-status`
    );

    if (response.status == "success") {
      statusModal.hide();
      statusForm.value.reset();
      flash(response.message);
      await getItems();
    }
  } catch (error) {
    flash(response.message, "error");
  }
};

const showMessageModal = (selectedItem) => {
  messageForm.value.message = `Hello ${selectedItem.account.name}, your device (Ref: ${selectedItem.reference_id}) is repaired.\n\nhttps://g.page/r/Cd5T4cka7ogJEBM/review`;
  messageForm.value.phone = selectedItem.account.phone;
  modal.show();
};

const sendMessage = async () => {
  try {
    const { data: response } = await messageForm.value.post(
      `/api/booking-items/send-message`
    );

    if (response.status == "success") {
      modal.hide();
      messageForm.value.reset();
      flash(response.message);
    }
  } catch (error) {
    flash(response.message, "error");
  }
};

// Hooks
onMounted(async () => {
  await getEmployees();
  await getItems();

  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });

  statusModal = new Modal(document.getElementById(statusModalID), {
    keyboard: false,
  });
});
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div v-if="!bookingItems.isLoading">
      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">
            Booking Details ( Reference No:
            {{ bookingItems.data.reference_id }})
          </h1>
        </template>

        <div class="row">
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date">Customer Name:</label>
              <p>
                <b>{{ bookingItems.data.account.name }}</b>
              </p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date">Date:</label>
              <p>
                <b><AppDate :timestamp="bookingItems.data.date" /></b>
              </p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date">Total Booking Items:</label>
              <p>
                <b>{{ bookingItems.data.booking_items_count }}</b>
              </p>
            </div>
          </div>
        </div>
      </Panel>
      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">
            Booking Items
          </h1>
        </template>

        <div class="mb-5">
          <div
            v-for="(item, index) in bookingItems.data.booking_list_details"
            :key="item.id"
          >
            <div
              class="mb-3 d-flex justify-content-between align-content-center"
            >
              <div>
                <h4 class="badge bg-primary text-white fs-4 me-3">
                  Booking Item <b>#{{ index + 1 }}</b>
                </h4>
                <span
                  class="text-capitalize badge bg-success me-2"
                  v-if="item.status == 'repaired'"
                  >{{ item.status }}</span
                >
                <span class="text-capitalize badge bg-info me-2" v-else>{{
                  item.status
                }}</span>

                <span class="badge bg-black"># {{ item.reference_id }}</span>
              </div>

              <div>
                <button
                  type="button"
                  @click="showStatusModal(item)"
                  class="btn btn-sm me-2 btn-outline-primary"
                >
                  Update Status
                </button>
                <button
                  type="button"
                  @click="printBarcode(item.id)"
                  class="btn btn-sm me-2 btn-outline-primary"
                >
                  Print Barcode
                </button>
                <button
                  type="button"
                  @click="printSaleInvoice(item)"
                  class="btn btn-sm me-2 btn-outline-primary"
                >
                  Print Sale Invoice
                </button>
                <button
                  type="button"
                  @click="showMessageModal(item)"
                  class="btn btn-sm me-2 btn-outline-primary"
                >
                  Send SMS
                </button>
              </div>
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
            <hr class="my-5" />
          </div>
        </div>

        <template #footer>
          <div class="text-end">
            <Button :form="form" class="btn btn-lg btn-primary">Update</Button>
          </div>
        </template>
      </Panel>
    </div>
    <div class="text-center" v-else>
      <AppLoader />
    </div>
  </form>

  <VueModal :id="statusModalID" @onSubmit="updateStatus">
    <template #title>
      Update Status
    </template>

    <div class="row mb-3">
      <div class="col">
        <label class="form-label" for="status"><b>Status:</b></label>
        <select class="form-select" v-model="statusForm.status" id="status">
          <option value="">Select Status</option>
          <option value="in progress">In Progress</option>
          <option value="repaired">Repaired</option>
          <option value="complete">Complete</option>
          <option value="can not be repaired">Can't Repaired</option>
          <option value="customer collected CBR">Customer Collected CBR</option>
          <option value="customer collected payment pending">
            Payment Pending
          </option>
          <option value="shop property">Shop Property</option>
          <option value="awaiting customer response">Awaiting Response</option>
          <option value="awaiting parts">Awaiting Parts</option>
        </select>
        <HasError :form="statusForm" field="status" />
        <small>Mark invoice as <b>repaired, completed or can't repaired</b> to update charges.</small>
      </div>
    </div>
    <div class="row" v-if="statusForm.estimated_cost">
      <div class=".col">
        <p >Estimated Cost: <b>{{ statusForm.estimated_cost }}</b></p>
      </div>
    </div>
    <div
      class="row"
      v-if="
        statusForm.status != 'in progress' &&
        statusForm.status != 'shop property' &&
        statusForm.status != 'awaiting customer response' &&
        statusForm.status != 'awaiting parts'
      "
    >
      <div class="col">
        <label class="form-label" for="charges"><b>Charges:</b></label>
        <input
          type="number"
          class="form-control"
          v-model="statusForm.charges"
          placeholder="500"
          id="charges"
        />

        <HasError :form="statusForm" field="charges" />
      </div>
    </div>

    <template #footer>
      <Button :form="statusForm" class="btn btn-primary">Update</Button>
    </template>
  </VueModal>

  <VueModal :id="modalID" @onSubmit="sendMessage">
    <template #title>
      Send SMS
    </template>

    <div class="row">
      <div class="col">
        <label class="form-label" for="mesage"><b>Message:</b></label>
        <textarea
          class="form-control"
          id="mesage"
          v-model="messageForm.message"
          cols="10"
          rows="5"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <Button :form="messageForm" class="btn btn-primary">Send</Button>
    </template>
  </VueModal>
</template>
