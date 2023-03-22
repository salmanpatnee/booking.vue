<script setup>
import purchaseReturnService from "@@/services/PurchaseReturnService";
import moment from "moment";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

// Data
const purchaseReturn = ref({});
const route = useRoute();
let isLoaded = ref(false);
let imageLoaded = 0;

// Methods
const getPurchaseReturn = async () => {
  const { data: response } = await purchaseReturnService.getPurchaseReturn(
    route.params.id
  );
  purchaseReturn.value = response.data;
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
  await getPurchaseReturn();
  document.body.classList.add("purchase-print");
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
            <span
              class="badge bg-success"
              style="background-color: rgba(28, 187, 140, 1) !important;"
              ><strong>Billing From</strong></span
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
            <h2 class="fw-bold">Purchase Return</h2>
            <p class="mb-0">Invoice No: {{ purchaseReturn.id }}</p>
            <p>
              Billing Date: {{ moment(purchaseReturn.date).format("DD MMMM YYYY") }}
            </p>
            <span class="badge bg-success"><strong>Billing To</strong></span>
            <h3 class="fw-bold mt-2">{{ purchaseReturn.purchase.account.name }}</h3>
          </div>
        </div>
        <hr />
        <div class="table-responsive mt-4">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th style="font-weight: bold;">#</th>
                <th style="font-weight: bold;">Product</th>
                <th style="font-weight: bold;">Qty</th>
                <th style="font-weight: bold;">Price</th>
                <th style="font-weight: bold;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(purchase_details, i) in purchaseReturn.purchase_return_details">
                <td>{{ i + 1 }}</td>
                <td>{{ purchase_details.product.name }}</td>
                <td>{{ purchase_details.quantity_return }}</td>
                <td>{{ purchase_details.price }}</td>
                <td>{{ purchase_details.price * purchase_details.quantity_return }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="row mt-5">
          <div class="col-7"></div>
          <div class="col">
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                ><b>Total Amount</b></label
              >
              <b>{{ purchaseReturn.purchase_return_amount }}</b>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  </div>
</template>
