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
          <img
            @load="handleImageLoad"
            src="/img/pharma-logo-black.png"
            style="display: none;"
          />
          <!-- <img
            
            src="/img/pharma-logo-black.png"
            style="display: none;"
          /> -->
          <h1
            style="font-family: monospace; font-weight: 900; font-size: 22px;"
          >
            <storng>iCrack</storng>
          </h1>
        </div>

        <div align="center" style="margin-top:1em;">
          <img :src="sale.qr_code" alt="Qr Code" srcset="" width="70" />
        </div>
        <div align="center">
          <small>{{ sale.reference_id }}</small>
        </div>
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
