<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import purchaseService from "@@/services/PurchaseService";
import PaymentHistoryTable from "./PaymentHistoryTable.vue";
// import PurchasedProductsTable from './PurchasedProductsTable.vue';

// Data
const purchase = ref({});
const route = useRoute();
let isLoaded = ref(false);
let imageLoaded = 0;

// Methods
const getPurchase = async () => {
  const { data: response } = await purchaseService.getPurchase(route.params.id);
  purchase.value = response.data;
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

// Hooks
onMounted(async () => {
  await getPurchase();
  document.body.classList.add("purchase-print");
  isLoaded.value = true;
});

const totalDiscountDisplay = computed(() => {
  const { discount_amount } = purchase.value;
  return discount_amount === null
    ? "0.00"
    : parseFloat(discount_amount).toFixed(2);
});
const dueAmountDisplay = computed(() => {
  return purchase.value.net_amount - purchase.value.paid_amount;
});
</script>

<template>
  <div v-if="isLoaded">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">
          Purchase Details ( Invoice No. : {{ purchase.reference_number }})
        </h1>
        <router-link class="btn btn-primary" :to="{ name: 'purchases.index' }">
          All Purchase
        </router-link>
      </template>
      <div id="printable">
        <div class="text-center mb-3">
          <!-- <img src="/img/pharma-logo-black.png" /> -->
          <img @load="handleImageLoad" src="/img/pharma-logo-black.png" />
        </div>
        <div class="row">
          <div class="col-8">
            <span
              class="badge bg-success"
              style="background-color: rgba(28, 187, 140, 1) !important"
              >Billing From</span
            >
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
            <h2 class="fw-bold">Purchase</h2>
            <p class="mb-0">Invoice No: {{ purchase.reference_number }}</p>
            <p>
              Billing Date: {{ moment(purchase.date).format("DD MMMM YYYY") }}
            </p>
            <span class="badge bg-success">Billing To</span>
            <h3 class="fw-bold mt-2">{{ purchase.account.name }}</h3>
          </div>
        </div>
        <hr />
        <div class="table-responsive mt-4">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Total Cost</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(purchaseDetail, i) in purchase.purchase_details"
                :key="purchaseDetail.id"
              >
                <td>{{ i + 1 }}</td>
                <td>{{ purchaseDetail.product.name }}</td>
                <td>{{ purchaseDetail.amount }}</td>
                <td>{{ purchaseDetail.quantity }}</td>
                <td>{{ purchaseDetail.price.toFixed(2) }}</td>
                <td><AppDate :timestamp="purchaseDetail.expiry_date" /></td>
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
              <b>{{ purchase.gross_amount }}</b>
            </div>

            <div
              v-if="purchase.discount_type"
              class="mb-3 d-flex justify-content-between mb-3"
            >
              <label class="form-label me-2" for="date"
                ><b>Total Discount</b></label
              >
              <b>- {{ totalDiscountDisplay }}</b>
            </div>
            <hr />
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"><b>Net Total</b></label>
              <b>{{ purchase.net_amount }}</b>
            </div>
            <hr />
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"><b>Paid</b></label>
              <b>{{ purchase.paid_amount }}</b>
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"><b>Due</b></label>
              <b class="text-danger">{{ dueAmountDisplay }}</b>
            </div>
          </div>
        </div>
      </div>
      <!--printable-->
    </Panel>
  </div>
</template>

<style scoped>
@media print {
  .purchase-print .bg-success {
    background-color: rgba(28, 187, 140, 1) !important;
  }
}
</style>
