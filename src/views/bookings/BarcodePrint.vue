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

const settings = ref({
  data: [],
  isLoading: true,
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
  await getBookingItem();
  document.body.classList.add("sale-print");
  isLoaded.value = true;
});
</script>

<template>
  <div id="printable" v-if="isLoaded && !settings.isLoading">
    <table
      align="center"
      style="border-spacing: 0in 0in; overflow: hidden !important;"
    >
      <img
        @load="handleImageLoad"
        src="/img/pharma-logo-black.png"
        style="display: none;"
      />
      <!-- create a new row -->
      <tr>
        <!-- <columns column-count="4" column-gap="0"> -->
        <td align="center" valign="center">
          <div
            style="
              overflow: hidden !important;
              display: flex;
              flex-wrap: wrap;
              align-content: center;
              width: 2in;
              height: 1.25in;
              justify-content: center;
            "
          >
            <div>
              <b style="display: block !important; font-size: 20px;">{{ settings.data[0].value }}</b>

              <span style="display: block !important; font-size: 15px;">
                Issue <b>{{ item.issue }}</b>
              </span>
              <span style="display: block !important; font-size: 15px;">
                Status <b>{{ item.status }}</b>
              </span>
              <span style="display: block !important; font-size: 15px;">
                Date <b><AppDate :timestamp="item.date" /></b>
              </span>
              <span style="display: block !important; font-size: 15px;">
                # <b>{{ item.reference_id }}</b>
              </span>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<style type="text/css" scoped>
body {
  margin: 10px;
  font-family: Courier, monospace;
}
td {
  border: 1px dotted #ccc;
}
.main {
  background: white;
}
@media print {
  table {
    page-break-after: always;
  }

  @page {
    size: 8.5in 11in;

    /*width: 8.5in !important;*/
    /*height:11in !important ;*/
    margin-top: 0.5in !important;
    margin-bottom: 0.5in !important;
    margin-left: 0.25in !important;
    margin-right: 0.25in !important;
  }
}
</style>
