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
const response = await axios.get(`${baseEndpoint}/${route.params.id}`);
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
  // window.onafterprint = window.close;
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
        
        <Panel>
            <div class="text-center mb-3">
        <!-- <img src="/img/pharma-logo-black.png" /> -->
        <img @load="handleImageLoad" src="/img/pharma-logo-black.png" />
      </div>
      <div class="row">
        <div class="col-8">
          <span class="badge bg-success" style="background-color: rgba(28, 187, 140, 1) !important"><strong>Billing From</strong></span>
          <address>
            <h3 class="fw-bold mt-2">Pharma Square</h3>
            Plot # 118/1, Block A, Alamgeer Society Model Colony Malir
            Karachi.<br />
            <abbr><b>Mobile:</b></abbr
            >03000742762 <br />
            <abbr><b>Email:</b></abbr>
            info@pharmasquare.com.pk <br />
            <abbr><b>Website:</b></abbr>
            https://www.pharmasquare.com.pk/<br />
          </address>
        </div>
        <div class="col-4">
          <h2 class="fw-bold">Sale</h2>
          <p class="mb-0">Invoice No: {{ sale.id }}</p>
          <p>
            Billing Date: {{ moment(sale.date).format("DD MMMM YYYY") }}
          </p>
          <span class="badge bg-success"><strong>Billing To</strong></span>
          <h3 class="fw-bold mt-2">{{ sale.account.name }}</h3>
        </div>
      </div>
      <hr />
      <div class="table-responsive mt-4">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="font-weight: bold;">#</th>
              <th style="font-weight: bold;">Product</th>
              <th style="font-weight: bold;">Price</th>
              <th style="font-weight: bold;">Qty</th>
              <th style="font-weight: bold;">Discount %</th>
              <th style="font-weight: bold;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sale_details, i) in sale.sale_details">
              <td>{{ i + 1 }}</td>
              <td>{{ sale_details.product.name }}</td>
              <td>{{ sale_details.original_price }}</td>
              <td>{{ sale_details.quantity }}</td>
              <td>{{ sale_details.discount_rate }}</td>
              <td>{{ sale_details.amount }}</td>
            </tr>
          </tbody>
        </table>
     
      </div>
      <div class="row mt-5">
          <div class="col-7"></div>
          <div class="col">
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                ><b>Gross Amount</b></label
              >
              <b>{{ sale.gross_amount }}</b>
            </div>

            <div
              v-if="sale.discount_amount"
              class="mb-3 d-flex justify-content-between mb-3"
            >
              <label class="form-label me-2" for="date"
                ><b>Total Discount</b></label
              >
              <b>- {{ totalDiscountDisplay }}</b>
            </div>
            <div
              v-if="sale.shipping_charges"
              class="mb-3 d-flex justify-content-between mb-3"
            >
              <label class="form-label me-2" for="date"
                ><b>Delivery Charges</b></label
              >
              <b> {{ sale.shipping_charges }}</b>
            </div>
            <hr />
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"><b>Net Total</b></label>
              <b>{{ sale.net_amount }}</b>
            </div>
            <hr />
          </div>
        </div>
    </Panel>
    </div>
 
    

 
  </div>
</template>

<style scoped>
@media print {
  .purchase-print  .bg-success{
    background-color: rgba(28, 187, 140, 1) !important;
  }
}

</style>