<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import axios from "axios";

import purchaseService from "@@/services/PurchaseService";
// import PurchasedProductsTable from './PurchasedProductsTable.vue';

// Data
const baseEndpoint = "/api/booking-list";
const sale = ref({});
const route = useRoute();
let isLoaded = ref(false);
let imageLoaded = 0;
const settings = ref({
  data: [], 
  isLoading: true
})

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

const totalEstimatedCostDisplay = computed(() => {
  return sale.value.booking_list_details.reduce((accumulator, object) => {
    return accumulator + parseFloat((object.estimated_cost) ? object.estimated_cost : 0);
  }, 0);
});

const getSettings = async () => {
  settings.value.isLoading = true;
  const response = await axios.get(`api/settings`);
  settings.value.data = response.data.data;
  settings.value.isLoading = false;
};

// Hooks
onMounted(async () => {
  await getSettings();
  await getBooking();
  document.body.classList.add("sale-print");
  isLoaded.value = true;
});
</script>

<template>
  <div v-if="isLoaded && !settings.isLoading">
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
          <img
            @load="handleImageLoad"
            src="/img/pharma-logo-black.png"
            style="display: none;"
          />
          <h1
            style="font-family: monospace; font-weight: 900; font-size: 22px;"
          >
            <storng>{{settings.data[0].value}}</storng>
          </h1>
          <p style="font-size: 10px; margin-bottom: 5px;">
            {{settings.data[1].value}}
          </p>
          <p style="font-size: 10px; margin-bottom: 5px;">{{settings.data[2].value}}</p>
          <p>Attention: This is not a sale invoice.</p>
          <!-- <img src="/img/pharma-logo-black.png" /> -->
        </div>
        <div align="center">
          <hr class="mt-2 mb-2" />
          <div class="row mb-0">
            <div class="col text-start">
              <p style="margin-bottom: 5px; font-size: 12px;">
                <b>Booking Reference:</b> {{ sale.reference_id }}
              </p>
              <p style="margin-bottom: 5px; font-size: 12px;">
                <b>Date:</b> <AppDate :timestamp="sale.date" />
              </p>
              <p style="margin-bottom: 5px; font-size: 12px;">
                <b>Customer:</b> {{ sale.account.name }}
              </p>
              <p style="margin-bottom: 5px; font-size: 12px;">
                <b>Trade:</b> {{ sale.account.trade_name }}
              </p>
              <p style="margin-bottom: 5px; font-size: 12px;">
                <b>Phone:</b> {{ sale.account.phone }}
              </p>
              <p style="margin-bottom: 0px; font-size: 12px;">
                <b>Items:</b>
              </p>
            </div>
          </div>

          <!-- ITEMS -->
          <div
            class="row mb-2"
            v-for="(booking_list_detail, index) in sale.booking_list_details"
            :key="booking_list_detail.id"
          >
            <div class="col text-start">
              <hr class="mt-0 mb-1" />
              <p
                style="font-size: 12px; margin-bottom: 0px;"
              >
                <b>Barcode:</b> {{ sale.reference_id }}
              </p>
              <p style="font-size: 12px; margin-bottom: 0px;">
                <b>Item</b>: {{ booking_list_detail.device_name }}
              </p>
              <p style="font-size: 12px; margin-bottom: 0px;">
                <b>Fault</b>: {{ booking_list_detail.issue }}
              </p>
              <p style="font-size: 12px; margin-bottom: 0px;">
                <b>Serial No:</b> {{ booking_list_detail.serial_no }}
              </p>
              <p style="font-size: 12px; margin-bottom: 0px;">
                <b>IMEI:</b> {{ booking_list_detail.imei }}
              </p>
              <p style="font-size: 12px; margin-bottom: 0px;">
                <b>Delivery Date:</b>
                <AppDate
                  :timestamp="booking_list_detail.estimated_delivery_date"
                />
              </p>
              <p style="font-size: 12px; margin-bottom: 0px;">
                <b>Estimated Cost:</b> {{ booking_list_detail.estimated_cost }}
              </p>
              <p style="font-size: 12px; margin-bottom: 0px;">
                <b>Status:</b> {{ booking_list_detail.status }}
              </p>
              <p style="font-size: 12px; margin-bottom: 0px;">
                <b>Comments:</b> {{ booking_list_detail.customer_comments }}
              </p>
            </div>
          </div>
          <!-- ITEMS END-->
          <div class="row mb-2">
            <div class="col text-start">
              <hr class="mb-2 mt-2" />
              <p style="font-size: 12px; margin-bottom: 0px;" class="mb-0"><b>Total Items:</b> {{ sale.booking_items_count }}</p>
              <p style="font-size: 12px; margin-bottom: 0px;" class="mb-0">
                <b>Total Estimated Cost:</b> {{ $filters.currencyPound(totalEstimatedCostDisplay) }}
              </p>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col text-center">
              <strong>Terms &amp; Conditions</strong>
              <hr class="mb-2 mt-2" />
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                Any repair items not collected within 30 days will be disposed
                off or sold to recove repairs cost. iCrack Technologies Limited
                is not liaiable for reimbursing the cost of item.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                All items needs to be checked by customer before leaving iCrack
                Technologies premises or personnel.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                True Condition of the items booked in for repair diagnosis needs
                to be fully clarified by the customer upon which the quote will
                be provided. Any fault or condition identified during diagnosis
                might change the quotation.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                Hardware repairs have 90 days warranty. Water/Liquid damage
                repairs have 15 days warranty. Batteries come with 30 days
                warranty. Warranty excludes faults relating to physical or
                accidental damage or if the device is opened whilst in your
                possession. If the nature of the repair falls outside the terms
                of your warranty or guarantee, then you may incur a charge for
                the repair.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                If you take your device to a third party after it has been
                repaired by iCrack Technologies this will void the warranty on
                your device. This includes both repaired and purchashed devices.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                All software related repairs will not be covered by our
                warranty.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                The warranty only covers the original repair. For example, if
                you pay for a screen repair and the screen becomes faulty, you
                will be covered with a 6-Month warranty. If any additional
                faults occur that are not related to the original repair this
                will not be covered under warranty and will need to be paid for.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                If the device is damaged it shall not be covered under warranty.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                All warranty claims have to be reported within the warranty
                period and returned to our premises within two weeks from this
                date.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                If the device you returned has been reset we will need the
                iCloud/Google account information we will not provide a
                warranty.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                Warranty on all accessories sole by iCrack Technologies for 30
                Days.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                We will not be reponsible for Loss of Sim Card/ Memory Card
                During Repairs, it is your responsibility to take them out
                before sending device or leaving our premises.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                Liquid Damage repairs can take up to 7 - 14 days.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                Any Motherboard related repairs can take up to 7 - 14 days.
              </p>
              <p class="text-start" style="font-size: 8px; margin-bottom: 7px;">
                Any software related repairs can take up to 7 - 14 days.
              </p>
            </div>
          </div>
        </div>

        <!-- <hr id="main-header" class="mb-2 mt-2" />
        <div align="center">
          <img :src="sale.qr_code" alt="Qr Code" srcset="" width="50"/>
        </div>
        <div align="center">
          <small>{{ sale.reference_id }}</small>
        </div> -->
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
