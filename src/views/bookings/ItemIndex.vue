<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import http from "@@/services/HttpService";
import { useFlash } from "@@/composables/useFlash";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";
import Form from "vform";

// Data
let modal = null;
let modalID = "messageModal";
const router = useRouter();
const bookingItems = ref([]);
const paginate = ref(50);
const search = ref("");
const id = ref("");
const device_name = ref("");
const fault = ref("");
const baseEndpoint = "/api/booking-items";
let start_date = ref("");
let end_date = ref("");
const { flash } = useFlash();

const isLoading = ref(true);

const messageForm = ref(
  new Form({
    message: null,
    phone: null,
  })
);

const params = ref({
  reference_id: "",
  status: "",
  device_name: "",
  issue: "",
  customer: "",
  trade_name: "",
  employee: "",
  phone: "",
  email: "",
  sort_field: "created_at",
  sort_direction: "desc",
});

const selectedRowId = ref("");
const selectedItem = ref({});

watch(
  () => params,
  (newValue, oldValue) => {
    getBookingItems();
  },
  { deep: true }
);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getBookingItems();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getBookingItems();
  }
);
watch(
  () => id.value,
  (id, prevCount) => {
    getBookingItems();
  }
);
watch(
  () => device_name.value,
  (device_name, prevCount) => {
    getBookingItems();
  }
);
watch(
  () => fault.value,
  (fault, prevCount) => {
    getBookingItems();
  }
);

// Methods

const getBookingItems = async (page = 1) => {
  isLoading.value = true;
  selectedRowId.value = "";
  selectedItem.value = {};
  

  const response = await axios.get(baseEndpoint, {
    params: {
      page,
      paginate: paginate.value,
      search: search.value.length >= 4 ? search.value : "",
      start_date: start_date.value,
      end_date: end_date.value,
      ...params.value,
    },
  });
  bookingItems.value = response.data;
  isLoading.value = false;
};

const handleFilterbookingItems = async () => {
  await getBookingItems();
};

const clearDateFields = async () => {
  start_date.value = "";
  end_date.value = "";
  await getBookingItems();
};

const refreshData = async () => {
  start_date.value = "";
  end_date.value = "";
  await getBookingItems();
}

const handleShow = () => {
  if(!selectedRowId.value) {
    flash('Please select an item to view details.', 'error'); 
    return;
  }
  router.push({ name: "bookings.edit", params: { id: selectedRowId.value } });
};

const selectRow = (item, id) => {
  if (selectedRowId.value == id) {
    selectedRowId.value = "";
  } else {
    selectedRowId.value = id;
    selectedItem.value = item;
  }
};

const showMessageModal = () => {
  if(!selectedRowId.value) {
    flash('Please select an item to send sms to.', 'error'); 
    return;
  }

  messageForm.value.message = `Hello ${selectedItem.value.account.name}, your device (Ref: ${selectedItem.value.reference_id}) is ${selectedItem.value.status}.\n\nhttps://g.page/r/Cd5T4cka7ogJEBM/review`;
  messageForm.value.phone = selectedItem.value.account.phone;
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
      selectedRowId.value = "";
      selectedItem.value = "";
      flash(response.message);
    }
  } catch (error) {
    flash(response.message, "error");
  }
};

const printBarcode = () => {

  if(!selectedRowId.value) {
    flash('Please select an item to print barcode for.', 'error'); 
    return;
  }

  const routeData = router.resolve({
    name: "bookings.barcode.print",
    params: { id: selectedRowId.value },
  });
  window.open(routeData.href, "_blank");
};

const printInvoice = () => {
  if(!selectedRowId.value) {
    flash('Please select an item to print invoice for.', 'error'); 
    return;
  }

  const routeData = router.resolve({
    name: "bookings.proceed.invoice",
    params: { id: selectedItem.value.booking_list_id },
  });
  window.open(routeData.href, "_blank");
};

// Hooks
onMounted(() => {
  document.getElementById("sidebar").classList.add("collapsed");

  getBookingItems();

  modal = new Modal(document.getElementById(modalID), {
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
              class="form-control form-control-sm"
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
              class="form-control form-control-sm"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
      <div class="col">
        <button
          type="button"
          @click="handleFilterbookingItems"
          class="btn btn-primary"
        >
          Filter
        </button>
        <button
          type="button"
          @click="clearDateFields"
          class="btn ms-2 btn-outline-secondary"
        >
          Clear
        </button>
      </div>
    </div>
  </Panel>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Booking Items</h1>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col-2 d-flex">
        <label class="d-inline-block me-2 fw-bold"> Show </label>
        <select v-model="paginate" class="form-select form-select w-auto">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div class="col text-end">
        <button
          class="btn me-2"
          :class="!selectedRowId ? 'btn-outline-primary' : 'btn-primary'"
          @click="handleShow"
        >
          View/Edit Details 
        </button>
        
        <button
          @click="showMessageModal"
          class="btn me-2"
          :class="!selectedRowId ? 'btn-outline-primary' : 'btn-primary'"
        >
          Send SMS
        </button>
        <button
          @click="printBarcode"
          class="btn me-2"
          :class="!selectedRowId ? 'btn-outline-primary' : 'btn-primary'"
        >
          Print Barcode
        </button>
        <button
          @click="printInvoice"
          class="btn me-2"
          :class="!selectedRowId ? 'btn-outline-primary' : 'btn-primary'"
        >
          Print Booking Invoice
        </button>
        <button class="btn btn-primary me-2" @click.prevent="refreshData">
          Refresh
        </button>

      </div>
      <!-- <div class="align-items-center col-3 d-flex">
        <input
          type="search"
          placeholder="Search"
          v-model.trim.lazy="id"
          class="form-control"
          id="id"
        />
      </div> -->
    </div>
    <!-- <pre>{{ bookingItems }}</pre> -->
    <div class="table-responsive">
      <table class="table table-bordered table-booking table-sm">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>Barcode</th>
            <th>Status</th>
            <th>Item</th>
            <th>Fault</th>
            <th>Cost</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Trade</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Repair By</th>
          </tr>
        </thead>
        <tbody>
          <tr id="search-row">
            <td>
              <input
                style="width: 100px;"
                class="form-control form-control-sm"
                type="search"
                name="search_id"
                id="search_id"
                v-model="params.reference_id"
              />
            </td>
            <td>
              <select
                class="form-select form-select-sm"
                style="width: 100px;"
                v-model="params.status"
              >
                <!-- @change="getBookingItems()" -->
                <option value="">Status</option>
                <option value="in progress">In Progress</option>
                <option value="repaired">Repaired</option>
                <option value="complete">Complete</option>
                <option value="can not be repaired">Can't Repaired</option>
                <option value="customer collected CBR"
                  >Customer Collected CBR</option
                >
                <option value="customer collected payment pending">
                  Payment Pending
                </option>
                <option value="shop property">Shop Property</option>
                <option value="awaiting customer response"
                  >Awaiting Response</option
                >
                <option value="awaiting parts">Awaiting Parts</option>
              </select>
            </td>
            <td>
              <input
                style="width: 100px;"
                class="form-control form-control-sm"
                type="search"
                name="search_device_name"
                id="search_device_name"
                v-model="params.device_name"
              />
            </td>
            <td>
              <input
                style="width: 100px;"
                class="form-control form-control-sm"
                type="search"
                v-model="params.issue"
              />
            </td>
            <td></td>
            <td><span style="width: 85px; display: inline-block;"></span></td>
            <td>
              <input
                style="width: 120px;"
                class="form-control form-control-sm"
                v-model="params.customer"
                type="search"
                name="search_account_name"
                id="search_account_name"
              />
            </td>

            <td>
              <input
                style="width: 100px;"
                class="form-control form-control-sm"
                type="search"
                v-model="params.trade_name"
                name="search_trade"
                id="search_trade"
              />
            </td>

            <td>
              <input
                style="width: 100px;"
                class="form-control form-control-sm"
                type="search"
                v-model="params.phone"
                name="search_account_phone"
                id="search_account_phone"
              />
            </td>
            <td>
              <input
                class="form-control form-control-sm w-100"
                type="search"
                v-model="params.email"
                name="search_account_email"
                id="search_account_email"
              />
            </td>
            <td>
              <input
                style="width: 120px;"
                class="form-control form-control-sm"
                type="search"
                v-model="params.employee"
                name="employee_name"
                id="employee_name"
              />
            </td>
          </tr>
          <tr
            v-for="(item, index) in bookingItems.data"
            @click="selectRow(item, item.id)"
            :class="
              selectedRowId == item.id
                ? 'bg-primary bg-opacity-10 text-danger'
                : ''
            "
            :key="item.id"
            v-if="!isLoading"
          >
            <td>{{ item.reference_id }}</td>
            <td class="text-capitalize">{{ item.status }}</td>
            <td>{{ item.device_name }}</td>
            <td>{{ item.issue }}</td>
            <td>{{ item.estimated_cost }}</td>
            <td><AppDate :timestamp="item.date" /></td>
            <td>{{ item.account && item.account.name }}</td>

            <td>{{ item.account.trade_name }}</td>
            <td>{{ item.account.phone }}</td>
            <td>{{ item.account.email }}</td>
            <td>{{ item.employee && item.employee.name }}</td>
          </tr>
          <tr v-else>
            <td colspan="12" class="text-center">
              <AppLoader />
            </td>
          </tr>
        </tbody>
        <tfoot v-if="!isLoading">
          <tr>
            <td colspan="11" class="text-center py-3">
              <span class="fw-bold">{{ bookingItems.meta.total }}</span>
              Booking(s) Loaded. Total Estimated Repair Cost:
              <span class="fw-bold">{{
                $filters.currencyPound(bookingItems.meta.totalEstimatedCost)
              }}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <template #footer v-if="!isLoading">
      <Pagination
        :data="bookingItems"
        @pagination-change-page="getBookingItems"
      />
      <div class="text-center">
        <small>
          Showing {{ bookingItems.meta.from }} to {{ bookingItems.meta.to }} of
          {{ bookingItems.meta.total }}
        </small>
      </div>
    </template>

    <!--
     <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        
        
        <tbody>
        
          <tr v-for="(sale, index) in bookingItems.data" :key="item.id">
           
           
          
            <td>{{ item.account.name }}</td>
            <td><AppDate :timestamp="item.date" /></td>
            <td>{{ item.employee && item.employee.name }}</td>
            <td class="text-center">
              <router-link
                v-if="item.status != 'complete'"
                class="btn btn-sm btn-info me-1 mb-1"
                :to="{ name: 'bookings.edit', params: { id: item.id } }"
              >
                <i class="mr-1 fa fa-pencil"></i>
              </router-link>
              <router-link
                class="btn btn-sm btn-dark me-1 mb-1"
                :to="{ name: 'bookings.barcode.print', params: { id: item.id } }"
              >
                <i class="mr-1 fa fa-barcode"></i>
              </router-link>
              <router-link
                v-if="item.status != 'complete'"
                class="btn btn-sm btn-warning me-1 mb-1"
                :to="{ name: 'bookings.proceed.invoice', params: { id: item.id } }" target="_blank"
              >
              <i class="fa fa-print"></i>
              </router-link>
              <button
                v-else
                @click="generateInvoice(item.id)"
                class="btn btn-sm btn-warning me-1 mb-1"
              >
                <i class="mr-1 fa fa-print"></i>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="9"><span class="fw-bold">{{bookingItems.meta.total}}</span> Booking(s) Loaded. Total Estimated Repair Cost: <span class="fw-bold">{{ $filters.currencyPound(bookingItems.meta.totalEstimatedCost) }}</span> </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div> 
    <template #footer v-if="!isLoading">
      <Pagination :data="bookingItems" @pagination-change-page="getBookingItems" />
      <div class="text-center">
        <small>
          Showing {{ bookingItems.meta.from }} to {{ bookingItems.meta.to }} of
          {{ bookingItems.meta.total }}
        </small>
      </div>
    </template>
    -->
  </Panel>

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
