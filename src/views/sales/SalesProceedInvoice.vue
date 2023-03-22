<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import axios from "axios";

import purchaseService from "@@/services/PurchaseService";
// import PurchasedProductsTable from './PurchasedProductsTable.vue';

// Data
const baseEndpoint = "/api/sales";
const sale = ref({});
const route = useRoute();
let isLoaded = ref(false);
let imageLoaded = 0;

// Methods
const getSale = async () => {
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
  await getSale();
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
          <img @load="handleImageLoad" src="/img/pharma-logo-black.png" style="display:none" />
          <h1
            style="
              font-family: monospace; font-weight: 900; text-transform: uppercase;
              
            "
          >
            <storng>Pharma Square</storng>
          </h1>
          <!-- <img src="/img/pharma-logo-black.png" /> -->
        </div>
        <div align="center">
          <h1
            style="
              font-family: monospace;
              margin-top: 0.8em;
              border-bottom: 2px solid;
              padding-bottom: 0.2em;
              border-top: 2px solid;
            "
          >
            <storng>Payment Counter Slip</storng>
          </h1>
          <h2
            style="
              font-family: monospace;
              border: 2px solid;
              font-weight: bold;
            "
          >
            {{ sale.id }}
          </h2>
        </div>
      
        <hr />
        <div align="center">
          <img :src="sale.qr_code" alt="Qr Code" srcset="" />
        </div>
        <div align="center" style="margin-top: 20px;">
         <hr/>

          <p  style="font-family:monospace;  color:black; margin-bottom: 0;">
            <strong >Address</strong>: Plot # 118/1, Block A, Alamgeer Society
            Model Colony Malir Karachi.
          </p>
          <p style="font-family:monospace;  color:black; margin-bottom: 0;">
            <strong>Contact No</strong>: 03000742762
          </p>
          <p style="font-family:monospace;  color:black; margin-bottom: 0;">
            <strong>Email</strong>: info@pharmasquare.com.pk
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .sale-print {
    font-family: 'Times New Roman' !important;
  }
}
</style>
