<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

// Data
const baseEndpoint = "/api/booking-items";
const item = ref({});
const route = useRoute();
let isLoaded = ref(false);
let imageLoaded = 0;

// Methods
const getBookingItem = async () => {
  const response = await axios.get(
    `${baseEndpoint}/${route.params.id}?for=print`
  );
  item.value = response.data.data;
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

// Hooks
onMounted(async () => {
  await getBookingItem();
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
          <h1
            style="font-family: monospace; font-weight: 900; font-size: 22px;"
          >
            <storng>iCrack</storng>
          </h1>
        </div>
    
        <div align="center">
          <p style="margin-bottom:5px; margin-top: 0;"><b>Issue:</b> {{ item.issue }}</p>
        </div>
        <div align="center">
          <p style="margin-bottom:5px; margin-top: 0; text-transform: capitalize;"><b>Status:</b> {{ item.status }}</p>
        </div>
        <div align="center">
          <p style="margin-bottom:5px; margin-top: 0;"><b>Date:</b> <AppDate :timestamp="item.date"/></p>
        </div>
        <div align="center">
          <small style="margin-bottom:5px; margin-top: 0;"><b>Barcode:</b> {{item.reference_id}}</small>
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
