<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import axios from "axios";

// Data
const baseEndpoint = "/api/booking-items";
const sale = ref({});
const route = useRoute();
let isLoaded = ref(false);
let imageLoaded = 0;

// Methods
const getBooking = async () => {
  const response = await axios.get(
    `${baseEndpoint}/${route.params.id}?for=print`
  );
  sale.value = response.data.data;
};

const handleImageLoad = () => {
  imageLoaded++;
  if (imageLoaded == 1) {
    handlePrint();
  }
};

const handlePrint = () => {
  const printContents = document.getElementById("printable").innerHTML;
  // const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;

  window.print();

  // document.body.innerHTML = originalContents;
  window.onafterprint = window.close;
};

onMounted(async () => {
  await getBooking();
  document.body.classList.add("sale-print");
  isLoaded.value = true;
});
</script>

<template>
  <div v-if="isLoaded">
    <div id="printable">
      <div
        class="print-invoice"
        style="
          background: white;
          padding: 10px;
          margin: 0 auto;
          text-align: center;
        "
      >
        <main class="content">
          <div class="container-fluid p-0">
            <img
              @load="handleImageLoad"
              src="/img/logo.jpg"
              style="display: none;"
            />
            <div class="row">
              <div class="col-12" id="printable">
                <div class="card">
                  <div class="card-body m-sm-3 m-md-5">
                    <div class="mb-3 text-center">
                      <h1>iCrack</h1>
                      <p>
                        84 Gracechurch Shopping Centre, <br />The Parade,
                        Birmingham, <br />Sutton Coldfield B72 1PH, <br />United
                        Kingdom
                      </p>
                      <p>07883 731494</p>
                    </div>

                    <div class="row mb-4">
                      <div class="col-6 text-start">
                        <div class="text-muted">
                          Bill to:
                          <strong> {{ sale.account.name }} </strong>
                        </div>
                        <div class="text-muted">
                          Phone:
                          <strong> {{ sale.account.phone }} </strong>
                        </div>
                        <div class="text-muted">
                          Trade Name:
                          <strong> {{ sale.account.trade_name }} </strong>
                        </div>
                      </div>
                      <div class="col-6 text-end">
                        <div class="text-muted">
                          Booking Reference:
                          <strong>{{ sale.booking_list_reference_id }}</strong>
                        </div>
                        <div class="text-muted">
                          Booking Item Reference:
                          <strong>{{ sale.reference_id }}</strong>
                        </div>

                        <div class="text-muted">
                          Date:
                          <strong><AppDate :timestamp="sale.date" /></strong>
                        </div>
                      </div>
                    </div>
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Items</th>
                          <th>Description</th>
                          <th>Price</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{{ sale.device_name }}</td>
                          <td>{{ sale.issue }}</td>
                          <td>{{ sale.charges }}</td>
                          <td>{{ sale.charges }}</td>
                        </tr>
                        <tr>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>Subtotal</th>
                          <th>{{ sale.charges }}</th>
                        </tr>
                        <tr>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>Total</th>
                          <th>{{ sale.charges }}</th>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .sale-print {
    font-family: monospace !important;
    color: #000 !important;
  }
  .table > tbody > tr > td,
  table > tbody > tr > th {
    padding: 0 !important;
    text-align: center !important;
    font-family: monospace;
    color: black !important;
  }
}
</style>
