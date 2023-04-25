<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import axios from "axios";

import purchaseService from "@@/services/PurchaseService";
// import PurchasedProductsTable from './PurchasedProductsTable.vue';

// Data
const baseEndpoint = "/api/bookings";
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
const totalDiscountDisplay = computed(() => {
  const { discount_amount } = sale.value;
  return discount_amount === "0.00"
    ? "0.00"
    : parseFloat(discount_amount).toFixed(2);
});
const dueAmountDisplay = computed(() => {
  return purchase.value.net_amount - purchase.value.paid_amount;
});
// Hooks
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
          border: 1px solid #a1a1a1;
          width: 100mm;
          background: white;
          padding: 10px;
          margin: 0 auto;
          text-align: center;
        "
      >
        <div align="center">
          <!-- <img
            @load="handleImageLoad"
            src="/img/pharma-logo-black.png"
            style="display: none;"
          /> -->
          <img
            
            src="/img/pharma-logo-black.png"
            style="display: none;"
          />
          <h1
            style="
              font-family: monospace;
              font-weight: 900;
              text-transform: uppercase;
            "
          >
            <storng>iCrack</storng>
          </h1>
          <!-- <img src="/img/pharma-logo-black.png" /> -->
        </div>
        <div align="center">
          <!-- <h1
            style="
              font-family: monospace;
              margin-top: 0.8em;
              border-bottom: 2px solid;
              padding-bottom: 0.2em;
              border-top: 2px solid;
            "
          > -->
          <h1 style="margin-top: 50px;">
            <!-- <storng>Booking ID</storng> -->
          </h1>
          <div class="row mb-3">
            <div class="col text-start">
              <p style="margin-bottom:5px;">Booking Reference: {{sale.reference_id}}</p>
              <p style="margin-bottom:5px;">Date: <AppDate :timestamp="sale.date"/></p>
              <p style="margin-bottom:5px;">Customer: {{ sale.account.name }}</p>
              <p style="margin-bottom:5px;">Trade: {{ sale.account.trade_name }}</p>
              <p style="margin-bottom:5px;">Phone: {{ sale.account.phone }}</p>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col text-start">
              <strong>Issue Description</strong>
              <hr/>
              <p>Item: {{sale.device_name}}</p>
              <p>Fault: {{ sale.issue }}</p>
              <p>Serial No: {{ sale.serial_no }}</p>
              <p>IMEI: {{ sale.imei }}</p>
              <p>Delivery Date: <b><AppDate :timestamp="sale.estimated_delivery_date"/></b></p>
              <p>Status: {{sale.status}}</p>
              <p>Comments: {{sale.customer_comments}}</p>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col text-start">
              <hr/>
              <p>Total Estimated Cost: {{sale.estimated_cost}}</p>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col text-center">
              <strong>Terms &amp; Conditions</strong>
              <hr/>
              <p class="text-start">Any repair items not collected within 30 days will be disposed off or sold to recover repairs cost. iCrack Technologies Limited is not liaiable for reimbursing the cost of item.</p>
              <p class="text-start">All items needs to be checked by customer before leaving iCrack Technologies premises or personnel.</p>
              <p class="text-start">True condition of the items booked in for repair diagnosis needs to be fully clarified by the customer upon which the quote will be provided. Any fault or condition identified during diagnosis might change the quotation.</p>
              <p class="text-start">Hardware repairs have 90 days warranty. Water/Liquid damage repairs have 15  days warranty. Batteries come with 30 days waranty. Warranty excludes faults relating to physicals or accidental damage or if the device is open  whilst in your possession. If the nature of the repair falls outside the terms of your warranty or guarantee, then you may incur a charge for the repair.</p>
               <p class="text-start">Our warranty does not cover repairs on Wifi faults on the iPhone 4 and 4s</p>
               <p class="text-start">If you take your device to a third party after it has been repaired by iCrack Technologies this will void the warranty on your device. This includes both repaired and purchased devices.</p>
               <p class="text-start">All software related repairs will not be covered by our warranty.</p>
               <p class="text-start">The warranty only covers the original repair. For example, if you pay for a screen repair and the screen becomes faulty, you will be covered with a 6-Month warranty. If any additional faults occur that are not related to the original repair this will not be covered under warranty and will need to be paid for.</p>
            </div>
          </div>
          <!-- <h2
            style="font-family: monospace; border: 2px solid; font-weight: bold"
          >
            {{ sale.reference_id }}
          </h2> -->
        </div>

        <hr />
        <div align="center">
          <img :src="sale.qr_code" alt="Qr Code" srcset="" />
        </div>
        <div align="center">
          <small>{{ sale.reference_id }}</small>
        </div>
        <!-- <div align="center" style="margin-top: 20px">
          <hr />

          <p style="font-family: monospace; color: black; margin-bottom: 0">
            <strong>Address</strong>: Plot # 118/1, Block A, Alamgeer Society
            Model Colony Malir Karachi.
          </p>
          <p style="font-family: monospace; color: black; margin-bottom: 0">
            <strong>Contact No</strong>: 03000742762
          </p>
          <p style="font-family: monospace; color: black; margin-bottom: 0">
            <strong>Email</strong>: info@pharmasquare.com.pk
          </p>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .sale-print {
    font-family: "Times New Roman" !important;
  }
}
</style>
