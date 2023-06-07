<script setup>
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import http from "@@/services/HttpService";
import { useFlash } from "@@/composables/useFlash";
import { useRouter } from "vue-router";
import { useCan } from "@@/composables/useCan";
import { Modal } from "bootstrap";
import Form from "vform";

// Data
let modal = null;
let modalID = "invoiceModal";
const router = useRouter();
const bookingItems = ref([]);
const paginate = ref(25);
const search = ref("");
const id = ref("");
const device_name = ref("")
const status = ref("");
const fault = ref("");
const baseEndpoint = "/api/booking-items";
let orderBy = ref("created_at");
let sortOrder = ref("desc");
let start_date = ref("");
let end_date = ref("");
const { flash } = useFlash();

const isLoading = ref(true);

const invoiceForm = ref(
  new Form({
    amount: null,
    reference_id: null,
    id: null,
  })
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

const showInvoiceModal = (booking) => {
  invoiceForm.value.reset();
  invoiceForm.value.reference_id = booking.reference_id;
  invoiceForm.value.id = booking.id;
  modal.show();
};
const generateInvoice = async (id) => {
  let routeData = router.resolve({
    name: "bookings.invoice",
    params: { id },
  });
  window.open(routeData.href, "_blank");
  // modal.hide();
  // isLoaded.value = false;
  // invoiceForm.value.reset();
};

const handleExportClick = async () => {
  const response = await http.get(
    baseEndpoint +
      "/export?search=" +
      search.value +
      "&id=" +
      id.value +
      "&start_date=" +
      start_date.value +
      "&end_date=" +
      end_date.value,
    {
      // If you forget this, your download will be corrupt.
      responseType: "blob",
    }
  );
  //Let's create a link in the document that we'll
  // programmatically 'click'.
  const link = document.createElement("a");

  // Tell the browser to associate the response data to
  // the URL of the link we created above.
  link.href = window.URL.createObjectURL(new Blob([response.data]));

  // Tell the browser to download, not render, the file.
  link.setAttribute("download", "bookingItems.xlsx");

  // Place the link in the DOM.
  document.body.appendChild(link);

  // Make the magic happen!
  link.click();
};

const getBookingItems = async (page = 1) => {
  isLoading.value = true;
  const response = await axios.get(
    baseEndpoint +
      "?page=" +
      page +
      "&paginate=" +
      paginate.value +
      "&search=" +
      search.value +
      "&id=" +
      id.value +
      "&device_name=" +
      device_name.value +
      "&fault=" +
      fault.value +
      "&start_date=" +
      start_date.value +
      "&end_date=" +
      end_date.value +
      "&status=" +
      status.value
  );
  bookingItems.value = response.data;
  isLoading.value = false;
};

const handleFilterbookingItems = async () => {
  await getBookingItems();
};

const handleSort = (col) => {
  orderBy.value = col;
  sortOrder.value = sortOrder.value == "desc" ? "asc" : "desc";
  getBookingItems();
};

const showInvoicePopup = () => {
  console.log("Clicked");
};
// Hooks
onMounted(() => {
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
          @click="handleFilterbookingItems"
          class="btn btn-primary"
        >
          Filter
        </button>
      </div>
    </div>
  </Panel>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Booking Items</h1>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <label class="d-inline-block me-2 fw-bold"> Show </label>
        <select v-model="paginate" class="form-select w-auto">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div class="col"></div>
      <div class="align-items-center col-auto d-flex">
        <!-- <label class="d-inline-block me-2 fw-bold" for="search"> Search </label> -->
        <input
          type="search"
          placeholder="Search"
          v-model.trim.lazy="id"
          class="form-control"
          id="id"
        />
      </div>
      <div class="col">
        <select
          class="form-control"
          v-model="status"
          @change="getBookingItems()"
        >
          <option value="">--Filter by Status--</option>
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
      </div>
    </div>
    <!-- <pre>{{ bookingItems }}</pre> -->
    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Item</th>
            <th>Fault</th>
            <th>Estimated Cost</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Trade</th>
            <th>Repair By</th>
            <th>Phone</th>
            <th>Email</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr id="search-row">
            <td>
              <input
                style="width: 100px;"
                class="form-control"
                type="search"
                name="search_id"
                id="search_id" v-model.trim.lazy="id"
              />
            </td>
            <td>
              <select
                class="form-select"
                style="width: 100px;"
                v-model="status"
                @change="getBookingItems()"
              >
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
              <input style="width: 80px;" type="search" name="search_device_name" id="search_device_name" v-model.trim.lazy="device_name"/>
            </td>
            <td>
              <input style="width: 80px;" type="search" v-model.trim.lazy="fault"/>
              <!-- <select
                class="form-select"
                style="width: 100px;"
                v-model="fault"
                @change="getBookingItems()"
              >
                <option value="">Fault</option>
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
              </select> -->
            </td>
            <td></td>
            <td>
              <input style="width: 80px;" type="search" name="search_account_name" id="search_account_name" />
            </td>
            <td></td>
            <td>
              <input style="width: 80px;" type="search" name="search_trade" id="search_trade" />
            </td>
            <td>
              <input style="width: 80px;" type="search" name="employee_name" id="employee_name" />
            </td>
            <td>
              <input style="width: 80px;" type="search" name="search_account_phone" id="search_account_phone" />
            </td>
            <td>
              <input style="width: 80px;" type="search" name="search_account_email" id="search_account_email" />
            </td>
            <td></td>
          </tr>
          <tr v-for="(item, index) in bookingItems.data" :key="item.id">
            <td>{{ item.reference_id }}</td>
            <td class="text-capitalize">{{ item.status }}</td>
            <td>{{ item.device_name }}</td>
            <td>{{ item.issue }}</td>
            <td>{{ item.estimated_cost }}</td>
            <td>{{ item.account.name }}</td>
            <td><AppDate :timestamp="item.date" /></td>
            <td>{{ item.account.trade_name }}</td>
            <td>{{ item.employee && item.employee.name }}</td>
            <td>{{ item.account.phone }}</td>
            <td>{{ item.account.email }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
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
  <VueModal :id="modalID" @onSubmit="generateInvoice">
    <template #title>
      Generate Invoice #{{ invoiceForm.reference_id }}</template
    >
    <div class="mb-3">
      <label class="form-label" for="amount">Amount:</label>
      <input
        v-model="invoiceForm.amount"
        type="number"
        class="form-control"
        id="amount"
        required
      />
      <HasError :form="invoiceForm" field="amount" />
    </div>

    <template #footer>
      <Button :form="invoiceForm" class="btn btn-primary">Generate</Button>
    </template>
  </VueModal>
</template>
