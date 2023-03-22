<script setup>
import { onMounted, ref, inject, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
import { useToast } from "vue-toastification";
import moment from "moment";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const route = useRoute();
const router = useRouter();
const toast = ref(useToast());
const suppliers = ref([]);
const sale = ref({});
const products = ref([]);
const baseEndpoint = "/api/sales";
let isLoaded = ref(false);

const selectedSupplier = ref(null);

// Methods

const debounce = (fn, delay) => {
  let timeout;

  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const getSuppliers = async () => {
  const response = await axios.get("/api/accounts?type=supplier");
  suppliers.value = response.data.data;
};

const getProducts = async (search, loading) => {
  if (search.length) {
    loading(true);
    searchProducts(loading, search);
  }
};

const handleAjaxSelect = () => {
  form.value.account_id = selectedSupplier.value.id;
};

const searchProducts = debounce((loading, search) => {
  axios
    .get("/api/products?search=" + search)
    .then(({ data }) => {
      products.value = data.data.data;
      loading(false);
    })
    .catch((error) => console.log("Error: " + error));
}, 350);

const selectProduct = (product) => {
  axios
    .get("/api/products/" + product.id)
    .then(({ data }) => {
      let product = data.data;
      form.value.selected_products.push(product);
      form.value.quantity.push(1);
    })
    .catch((error) => console.log("Error: " + error));
};

const getSale = async (id) => {
  const response = await axios.get(`${baseEndpoint}/${id}`);
  sale.value = response.data.data;
};

const calculateDiscount = () => {
  let type = form.value.discount_type;

  if (type !== "") {
    if (type === "fixed") {
      form.value.discount_amount = form.value.discount_rate;
    } else {
      form.value.discount_amount =
        (form.value.amount * form.value.discount_rate) / 100;
    }
  } else {
    form.value.discount_rate = form.value.discount_amount = 0;
  }
};

const handlePrintInvoice = () => {
  router.push({
    name: "sales.print",
    params: { id: route.params.id },
  });
};
// Hooks
onMounted(async () => {
  await getSale(route.params.id);

  isLoaded.value = true;
});
</script>

<template>
  <div v-if="isLoaded">
    <div class="card border-primary">
      <div class="card-header">
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h3 mb-0 text-middle">
            Sale Details ( Invoice No. : {{ sale.id }})
            <span
              class="text-capitalize badge"
              :class="
                ({ 'bg-warning': sale.status === 'draft' },
                { 'bg-info': sale.status === 'ordered' },
                {
                  'bg-success':
                    sale.status === 'completed' || sale.status === 'final',
                },
                { 'bg-danger': sale.status === 'returned' })
              "
              >{{ sale.status }}</span
            >
          </h1>
          <router-link v-if="can('pos-manage')" class="btn btn-primary" :to="{ name: 'sales.index' }">
            All Sales
          </router-link>
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col mb-3">
            <label class="form-label" for="date">Invoice No:</label>
            <p>
              <b>#{{ sale.id }}</b>
            </p>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date">Customer Name:</label>
              <p>
                <b>{{ sale.account.name }}</b>
              </p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date">Sale Date:</label>
              <p>
                <b>{{ moment(sale.date).format("DD MMMM YYYY") }}</b>
              </p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Gross Total</label>
              <b>{{ sale.gross_amount }}</b>
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Total Discount</label>
              <b>{{
                sale.discount_amount ? "- " + sale.discount_amount : "0.00"
              }}</b>
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Delivery Charges</label>
              <b>{{
                sale.shipping_charges ? sale.shipping_charges : "0.00"
              }}</b>
            </div>
            <hr />
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Net Total</label>
              <b>{{ sale.net_amount }}</b>
            </div>
            <!-- <hr>
                        <div class="mb-3 d-flex justify-content-between mb-3">
                            <label class="form-label  me-2" for="date">Paid</label>
                            <b>0.00</b>
                        </div>
                        <div class="mb-3 d-flex justify-content-between mb-3">
                            <label class="form-label  me-2" for="date">Due</label>
                            <b>0.00</b>
                        </div> -->
          </div>
        </div>
      </div>
      <div class="card-footer text-muted text-end">
        <router-link
          :to="{ name: 'sales.print' }"
          target="_blank"
          class="btn btn-info btn-sm"
          ><i class="fa fa-print"></i> &nbsp; Print Invoice</router-link
        >
        <!-- <button @click="handlePrintInvoice" >
          
        </button> -->
      </div>
    </div>

    <div class="card border-primary">
      <div class="card-header">
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h3 mb-0 text-middle">Products</h1>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead class="bg-primary text-light">
              <tr>
                <th class="text-center">#</th>
                <th class="text-center">Product Name</th>
                <th class="text-center">Price</th>
                <th class="text-center">Dis%</th>
                <th class="text-center">Discounted Price</th>
                <th class="text-center">Qty</th>
                <th class="text-center">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(saleDetail, i) in sale.sale_details"
                :key="saleDetail.id"
              >
                <td align="center">{{ i + 1 }}</td>
                <td align="center">
                  <router-link
                    :to="{
                      name: 'products.show',
                      params: { id: saleDetail.product.id },
                    }"
                  >
                    {{ saleDetail.product.name }}
                  </router-link>
                </td>
                <td align="center">{{ saleDetail.original_price.toFixed(2) }}</td>
                <td align="center">{{ saleDetail.discount_rate }}</td>
                <td align="center">{{ saleDetail.price.toFixed(2) }}</td>
                <td align="center">{{ saleDetail.quantity }}</td>
                <td align="center">{{ saleDetail.amount.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer text-muted"></div>
    </div>
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Sale Returns</h1>
      </template>
      <div v-if="sale.sales_returns.length" class="table-responsive">
        <table class="table table-bordered table-hover table-striped">
          <thead class="bg-primary text-light">
            <tr>
            <th>Date</th>
            <th>Invoice No</th>
            <th>Amount Before Return</th>
            <th>Amount After Return</th>
            <th>Retun Amount</th>
          </tr>
          </thead>
          
          <tbody>
            <tr v-for="sales_return in sale.sales_returns">
                  <td><AppDate :timestamp="sales_return.date" />
              </td>
           <td>
                <router-link
                  :to="{
                    name: 'sales.return.show',
                    params: { id: sales_return.id },
                  }"
                >
                  {{ sales_return.id }}
                </router-link>
              </td>
             <td>{{ sales_return.sale_amount_before_return }}</td>
              <td>{{ sales_return.sale_amount_after_return }}</td>
              <td>{{ sales_return.sale_return_amount }}</td>
            </tr>
          </tbody>
          
        </table>
      </div>
      <div v-else>
        <p class="text-center alert alert-info">No sales return.</p>
      </div>
    </Panel>
    <!--
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Sales Return</h1>
      </template>
      <div class="table-responsive">
        <table class="table table-bordered table-hover table-striped">
          <thead class="bg-primary text-bg-dark">
            <tr>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Amount Before Return</th>
              <th>Amount After Return</th>
              <th>Retun Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr></tr>
            <tr></tr>
            <tr></tr>
            <tr></tr>
            <tr></tr>
            <tr></tr>
          </tbody>
        </table>
      </div>
      <hr/>
      <Panel>
        <template #header>
          <h2 class="h4 mb-0 text-middle">Products</h2>
        </template>
      </Panel>
    </Panel>
    -->
  </div>

  <!-- <div class="card border-primary">
        <div class="card-header">
            <div class="d-flex align-items-center justify-content-between">
                <h1 class="h3 mb-0 text-middle">Discount</h1>
            </div>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col">
                    <div class="mb-3">
                        <label class="form-label" for="discount_type">Discount Type:</label>
                        <p>
                            <b>
                                {{ sale.discount_type ? discount_type : 'Not applied' }}
                            </b>
                        </p>
                    </div>
                </div>
                <div class="col">
                    <div class="mb-3">
                        <label class="form-label" for="discount_rate">Discount Amount:</label>
                        <p><b>{{ sale.discount_amount }}</b></p>
                    </div>
                </div>
                <div class="align-items-center col d-flex justify-content-end text-end">
                    <label> <b>Discount:</b>(-) {{ form.discount_amount }} </label>
                </div>
            </div>
        </div>
        <div class="card-footer text-muted">
           
    </div>
    </div> -->
</template>
