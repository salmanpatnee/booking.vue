<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import axios from "axios";

// Data
const baseEndpoint = "/api/invoices";
const invoice = ref({});
const route = useRoute();
let isLoaded = ref(false);
let imageLoaded = 0;

const displayVatAmount = computed(() => {
  if (invoice.value.value != "") {
    return (invoice.value.total * invoice.value.vat) / 100;
  }
  return false;
});
// Methods
const getInvoice = async () => {
  const response = await axios.get(`${baseEndpoint}/${route.params.id}`);
  invoice.value = response.data.data;
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

onMounted(async () => {
  await getSettings();
  await getInvoice();
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
                      <h1>{{ settings.data[0].value }}</h1>
                      <div style="width:400px; margin:0 auto;">
                        <p>
                        {{ settings.data[1].value }}
                      </p>
                      <p>{{ settings.data[2].value }}</p>
                      </div>
                      
                    </div>
                    <!-- <pre>{{ invoice }}</pre> -->
                    <div class="row mb-4">
                      <div class="col-6 text-start">
                        <div class="text-muted">
                          Bill to:
                          <strong> {{ invoice.client_name }} </strong>
                        </div>
                        <div class="text-muted">
                          Phone:
                          <strong> {{ invoice.phone }} </strong>
                        </div>
                      </div>
                      <div class="col-6 text-end">
                        <div class="text-muted">
                          Invoice No:
                          <strong>{{ invoice.invoice_no }}</strong>
                        </div>
                        <div class="text-muted">
                          Date:
                          <strong><AppDate :timestamp="invoice.date" /></strong>
                        </div>
                      </div>
                    </div>
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Qty</th>
                          <th>VAT</th>
                          <th>Subtotal</th>
                          <th>Net Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in invoice.invoice_items"
                          :key="item.id"
                        >
                          <td>{{ item.item }}</td>
                          <td>{{ item.amount }}</td>
                          <td>{{ item.qty }}</td>
                          <td>{{ item.vat }}%</td>
                          <td>{{ item.sub_total }}</td>
                          <td>{{ item.net_total }}</td>
                          <!-- <td>{{ $filters.currencyPound(invoice.total) }}</td> -->
                        </tr>
                        <tr>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                        </tr>
                        <tr>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th style="text-align: right;">Subtotal</th>
                          <th style="text-align: right;">{{ $filters.currencyPound(invoice.total) }}</th>
                        </tr>
                        <tr v-if="invoice.tax_amount">
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th style="text-align: right;">Tax</th>
                          <th style="text-align: right;">{{ $filters.currencyPound(invoice.tax_amount) }}</th>
                        </tr>
                        <tr>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th>&nbsp;</th>
                          <th style="text-align: right;">Net Total</th>
                          <th style="text-align: right;">{{ $filters.currencyPound(invoice.net_total) }}</th>
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
