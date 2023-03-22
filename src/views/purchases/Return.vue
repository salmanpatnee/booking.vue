<script setup>
import http from "@@/services/HttpService";
import { onMounted, ref, inject, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
import { useToast } from "vue-toastification";
import moment from "moment";
import "vue-select/dist/vue-select.css";
import purchaseService from "@@/services/PurchaseService";

// Data
const route = useRoute();
const router = useRouter();
const toast = ref(useToast());
const customers = ref([]);
const purchase = ref({});
const products = ref([]);
const isLoaded = ref(false);
const baseEndpoint = "/api/purchases";
const swal = inject("$swal");
const bankAccounts = ref([]);

let invoiceId = ref("");

const searchInvoice = () => {
  router.push({ name: "purchases.return", params: { id: invoiceId.value } });
};

const form = ref(
  new Form({
    id: "",
    purchase_id: "",
    account_id: "",
    date: moment().format("YYYY-MM-DD"),
    purchase_return_details: [],
    received_amount: null,
    payment_method_id: 1,
    bank_account_id: "",
    // discount_type: "",
    // discount_rate: 0,
    // discount_amount: 0,
    // amount: 120,
    // sale_details: [],
    // quantity: [],
    // unit_cost: [],
  })
);

const selectedProduct = ref(null);
const selectedCustomer = ref(null);

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

const getCustomers = async () => {
  const response = await axios.get("/api/accounts?type=customer");
  customers.value = response.data.data;
};

const getProducts = async (search, loading) => {
  if (search.length) {
    loading(true);
    searchProducts(loading, search);
  }
};

const handleAjaxSelect = () => {
  form.value.account_id = selectedCustomer.value.id;
};

const handleProductSelect = () => {
  const product = selectedProduct.value;

  /* Check whether product already selected */
  const productExist = form.value.sale_details.findIndex((sD) => {
    return sD.product_id === product.id;
  });

  if (productExist !== -1) {
    alert("This product is already selected");
    return;
  }

  const obj = {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    quantity: 1,
  };
  form.value.sale_details.push(obj);
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

const getBankAccounts = async () => {
  const { data: response } = await http.get(`/api/bank-accounts`);
  bankAccounts.value = response.data;
};

const store = () => {
  form.value
    .post(`/api/purchase-returns`)
    .then((response) => {
      if (response.data.status == "success") {
        toast.value.success(response.data.message);
        router.push({ name: "purchases.return.index" });
      }
    })
    .catch((error) => console.log(error));
};

const update = async () => {
  form.value
    .patch(baseEndpoint + form.value.id)
    .then((response) => {
      if (response.data.status == "success") {
        toast.value.success(response.data.message);
        router.push({ name: "products.index" });
      }
    })
    .catch((error) => console.log(error));
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

watch(
  () => form.value.discount_rate,
  (discount_rate, prevCount) => {
    calculateDiscount();
  }
);

const getPurchase = async () => {
  const { data: response } = await purchaseService.getPurchase(route.params.id);
  purchase.value = response.data;
};

const populateForm = () => {
  form.value.purchase_id = purchase.value.id;
  form.value.account_id = purchase.value.account_id;
  const purchaseReturnDetails = [];
  purchase.value.purchase_details.forEach((purchaseDetail) => {
    purchaseReturnDetails.push({
      purchase_detail_id: purchaseDetail.id,
      product: purchaseDetail.product,
      product_id: purchaseDetail.product_id,
      price: purchaseDetail.price,
      quantity_return: 0,
      quantity_before_return: purchaseDetail.quantity,
      amount: 0,
    });
  });
  form.value.purchase_return_details = purchaseReturnDetails;
};

const totalQty = computed(() => {
  
  let totalQty = 0;

  form.value.purchase_return_details &&
    form.value.purchase_return_details.forEach((item) => {
      totalQty += item.quantity_return;
    });

  return parseInt(totalQty);
})

const displaySubTotal = computed(() => {
  let subTotal = 0;

  form.value.purchase_return_details &&
    form.value.purchase_return_details.forEach((item) => {
      subTotal += parseInt(item.quantity_return) * parseFloat(item.price);
    });

  subTotal = parseFloat(subTotal).toFixed(2);
  form.value.subtotal = subTotal;
  return subTotal;
});

const handlePaymentMethodChange = ($event) => {
  const selectedPaymentMethod = $event.target.value;
  let discountRateKey = null;
  if (selectedPaymentMethod == 1) {
    discountRateKey = "discount_rate_cash";
  } else if (selectedPaymentMethod == 2) {
    discountRateKey = "discount_rate_card";
  }
  // form.value.sale_details.forEach((sD) => {
  //   console.log(sD[discountRateKey]);
  //   sD.discount_rate = sD[discountRateKey];
  //   console.log(sD[discountRateKey] / 100);
  //   sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
  // });
};
// Hooks
onMounted(async () => {
  await getPurchase();
  await getBankAccounts();
  populateForm();
  isLoaded.value = true;
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Purchase Return</h1>
      <router-link class="btn btn-primary" :to="{ name: 'purchases.index' }">
        All Purchase Return
      </router-link>
    </template>
    <div v-if="!isLoaded">
      <div class="input-group mb-3">
        <input
          type="search"
          v-model="invoiceId"
          class="form-control form-control-lg"
          placeholder="Invoice No"
        />
        <button
          @click.prevent="searchInvoice"
          class="btn btn-primary"
          type="button"
          id="button-addon2"
        >
          Search Invoice
        </button>
      </div>
    </div>
    <div v-else>
      <div class="row">
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="invoice_number">Invoice No:</label>
            <input
              type="text"
              class="form-control"
              id="invoice_number"
              v-model="form.purchase_id"
              readonly
            />
            <HasError :form="form" field="invoice_number" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="account_id">Supplier Name:</label>
            <input
              type="text"
              class="form-control"
              id="account_id"
              v-model="purchase.account.name"
              readonly
            />
            <HasError :form="form" field="account_id" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="date">Date:</label>
            <input
              type="date"
              class="form-control"
              id="date"
              v-model="form.date"
              readonly
            />
            <HasError :form="form" field="date" />
          </div>
        </div>
      </div>
    </div>
  </Panel>

  <form v-if="isLoaded" @submit.prevent="store">
    <Panel>
      <div class="table-responsive">
        <table class="table">
          <thead class="bg-primary text-light">
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Unit Price</th>
              <th>Purchase Qty</th>
              <th>Return Qty</th>
              <th class="text-end">Return Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(
                purchase_return_detail, index
              ) in form.purchase_return_details"
              :key="purchase_return_detail.sale_detail_id"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ purchase_return_detail.product.name }}</td>
              <td>{{ purchase_return_detail.price.toFixed(2) }}</td>
              <td>{{ purchase_return_detail.quantity_before_return }}</td>
              <td>
                <input
                  type="number"
                  class="form-control w-auto"
                  v-model="purchase_return_detail.quantity_return"
                  placeholder="0"
                  :max="purchase_return_detail.quantity_before_return"
                  min="0"
                />
              </td>
              <td class="text-end">
                {{
                  (purchase_return_detail.amount = (
                    purchase_return_detail.quantity_return *
                    purchase_return_detail.price
                  ).toFixed(2))
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="row">
          <div class="col">
            <!-- <div class="mb-3 pe-6">
              <label class="form-label fw-bold" for="payment_method_id"
                >Payment Method:</label
              >
              <select
                id="payment_method_id"
                class="form-select form-select-lg"
                v-model.number="form.payment_method_id"
                @change="handlePaymentMethodChange"
              >
                <option value="1">Cash</option>
                <option value="2">Bank</option>
              </select>
              <select
                v-model="form.bank_account_id"
                class="form-control form-select px-3"
                :required="form.payment_method_id === 2"
              >
                <option value="">Select Bank</option>
                <option
                  v-for="bank in bankAccounts"
                  :key="bank.id"
                  :value="bank.id"
                >
                  {{ bank.bank_name }}
                </option>
              </select>
            </div> -->
          </div>
          <div class="col">
            <div class="row g-3 mb-2 justify-content-end align-items-center">
              <div class="col-6">
                <label for="subtotal" class="col-form-label fw-bold"
                  >Subtotal:</label
                >
              </div>
              <div class="col-6">
                <input
                  type="text"
                  v-model="displaySubTotal"
                  readonly=""
                  id="subtotal"
                  class="form-control text-end px-3"
                />
              </div>
            </div>
            <div class="row g-3 mb-2 justify-content-end align-items-center">
              <div class="col-6">
                <label for="subtotal" class="col-form-label fw-bold"
                  >Net Total:</label
                >
              </div>
              <div class="col-6">
                <input
                  type="text"
                  v-model="displaySubTotal"
                  readonly=""
                  id="subtotal"
                  class="form-control text-end px-3"
                />
              </div>
            </div>
            <hr />
            <div class="row g-3 mb-2 justify-content-end align-items-center">
              <div class="col-6">
                <label for="received_amount" class="col-form-label fw-bold"
                  >Amount Receive:</label
                >
              </div>
              <div class="col-6">
                <input
                  type="number"
                  required
                  step="0.01"
                  :max="displaySubTotal" min="0"
                  v-model="form.received_amount"
                  id="received_amount"
                  class="form-control text-end px-3"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="align-items-end d-flex row mt-5">
          <div class="col text-end">
            <Button  :form="form" class="btn btn-lg text-uppercase btn-primary" :disabled="totalQty ? false : true"
              ><i class="fa fa-refresh" aria-hidden="true"></i> Return</Button
            >
          </div>
        </div>
      </template>
    </Panel>
  </form>
</template>
