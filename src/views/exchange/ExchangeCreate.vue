<script setup>
import http from "@@/services/HttpService";
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
import { useToast } from "vue-toastification";
import { useFlash } from "@@/composables/useFlash";
import moment from "moment";
import productExchangeService from "@@/services/ProductExchangeService";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";

const { flash } = useFlash();
const form = ref(
  new Form({
    id: "",
    sale_id: "",
    date: moment().format("YYYY-MM-DD"),
    sales_return_details: [],
    sale_details: [],
    payment_method_id: 1, 
    bank_account_id: ""
  })
);
const bankAccounts = ref([]);
const productBarcodeInput = ref(null);
const selectedProduct = ref(null);
let shouldSubmit = true;
// Data

const checked = ref([]);
const exchangeMode = ref(false);
const route = useRoute();
const router = useRouter();
const toast = ref(useToast());
const suppliers = ref([]);
const sale = ref({});
const products = ref([]);
const baseEndpoint = "/api/sales";
let isLoaded = ref(false);

const selectedSupplier = ref(null);

// const handleCheckbox = ($event, saleDetail) => {
//     const saleReturnDetail = {
//         product_id: saleDetail.product_id,
//         quantity_return: 0
//     };

//     form.value.sales_return_details.push(saleReturnDetail);

// }

const exchangeOrderDetails = computed(() => {
  return sale.value.sale_details
    .filter((item) => checked.value.includes(item.id))
    .map((item) => item);
});

// const exchangeGrossAmount = computed(() => {
//   return exchangeOrderDetails.value.map((sale_detail) => {
//     return sale_detail.price * sale_detail.quantity;
//   });
// });

const getBankAccounts = async () => {
  const { data: response } = await http.get(`/api/bank-accounts`);
  bankAccounts.value = response.data;
};

const exchangeGrossAmount = computed(() => {
  return form.value.sales_return_details
    .filter((sales_return_detail) => sales_return_detail.checked)
    .map((sale_detail) => {
      return sale_detail.price * sale_detail.quantity_return;
    });
});

const exchangeOrderTotal = computed(() => {
  return exchangeGrossAmount.value.reduce((a, b) => a + b, 0);
});

const grossAmount = computed(() => {
  return form.value.sale_details.map((sale_detail) => {
    return sale_detail.price * sale_detail.quantity;
  });
});

const grossAmountTotal = computed(() => {
  return grossAmount.value.reduce((a, b) => a + b, 0);
});

const netAmount = computed(
  () => (grossAmountTotal.value - exchangeOrderTotal.value).toFixed(2)
);

const dueAmount = computed(() => netAmount.value - form.value.paid_amount);

const handleProductSelect = (p) => {
  let productInCart =
    form.value.sale_details.length &&
    form.value.sale_details.find((item) => {
      return item.product_id === p.id;
    });

  if (productInCart) {
    if (productInCart.quantity + 1 > p.stock) return false;

    productInCart.quantity++;
  } else {
    p.quantity = 1;
    p.original_price = p.default_selling_price;
    p.price = p.original_price;
    p.product = {};
    p.product.default_selling_price = p.price;
    p.product.default_selling_price_old = p.default_selling_price_old;
    p.product_name = p.name;
    p.product.name = p.name;
    p.product.stock = p.stock;
    p.product.discount_rate_cash = p.discount_rate_cash;
    p.product.discount_rate_card = p.discount_rate_card;
    p.product.discount_rate_shipment = p.discount_rate_shipment;
    p.product.barcode = p.barcode;

    
  
    p.product_id = p.id;
    p.discount_rate = p.discount_rate_cash;
    form.value.sale_details.push(p);
    return;
  }


  // selectedProduct.value = selectedOption;

  // const product = selectedOption;

  // /* Check whether product already selected */
  // const productExist = form.value.sale_details.findIndex((sD) => {
  //   return sD.product_id === product.id;
  // });

  // const handleRemoveItem = ($event, productId) => {
  //   const saleDetails = form.value["sale_details"].filter(
  //     (pD) => pD.product_id !== productId
  //   );
  //   form.value["sale_details"] = saleDetails;
  // };

  // if (productExist !== -1) {
  //   alert("This product is already selected");
  //   setTimeout(() => {
  //     selectedProduct.value = null;
  //   }, 300);
  //   return;
  // }

  // console.log("Selected Product:", product);

  // const obj = {
  //   product_id: product.id,
  //   product_name: product.name,
  //   price: product.default_selling_price,
  //   quantity: 1,
  //   available_quantity: product.quantity,
  // };

  // form.value.sale_details.push(obj);
  // setTimeout(() => {
  //   selectedProduct.value = null;
  // }, 300);
};
// Methods

const handleRemoveItem = ($event, productId) => {

  const saleDetails = form.value["sale_details"].filter(
    (pD) => pD.product_id !== productId
  );
  form.value["sale_details"] = saleDetails;
};

const handlePrepareExchangeOrder = () => {
  const sales_return_details = form.value.sales_return_details.filter(
    (sales_return_detail) => sales_return_detail.checked
  );

  // console.log();
  // console.log(sales_return_details.value.length);
  // return;

  if (!sales_return_details.length) {
    flash("Select product for exchange", "error");
    exchangeMode.value = false;
    return false;
  }
  exchangeMode.value = true;
};

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

const handleFullPaid = () => (form.value.paid_amount = netAmount.value);

const populateForm = () => {
  form.value.sale_id = sale.value.id;
  //   form.value.account_id = sale.value.account_id;
  const salesReturnDetails = [];
  sale.value.sale_details.forEach((saleDetail) => {
    console.log(saleDetail);
    salesReturnDetails.push({
      checked: false,
      sale_detail_id: saleDetail.id,
      product: saleDetail.product,
      product_id: saleDetail.product_id,
      price: saleDetail.price,
      quantity: saleDetail.quantity,
      quantity_return: 0,
      quantity_before_return: saleDetail.quantity,
    });
  });
  form.value.sales_return_details = salesReturnDetails;
};

const store = async () => {
  try {
    form.value.sales_return_details = form.value.sales_return_details.filter(
      (sales_return_detail) => sales_return_detail.checked
    );
    const { data: response } = await form.value.post(
      productExchangeService.apiEndpoint
    );

    if (response.status == "success") {
      flash(response.message);
      router.push({
          name: "exchanges.index",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const searchProductsWithBarcode = debounce(async (query) => {
  let url = `/api/products?`;
  url += `for=sales.create&`;
  url += `&barcode=${query}`;

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      handleProductSelect(response.data.data);
      // response.data.data;
    } else {
      flash("No product found.", "error");
    }
  } catch (error) {
    console.log({error});
    // flash(error.response.data.message, "error");
  }
}, 350);

const handleProductScan = (barcode) => {
  shouldSubmit = false;
  if (barcode.length) {
    searchProductsWithBarcode(barcode);
    productBarcodeInput.value.value = "";
  }
};

const handleSubmit = () => {
  if (!shouldSubmit) {
    shouldSubmit = true;
    return;
  }
  store();
};

const handlePriceSelect = (saleDetail) => {
  if (saleDetail.discount_rate) {
    const percentageOfPrice = (100 - saleDetail.discount_rate) / 100;
    saleDetail.price = saleDetail.original_price * percentageOfPrice;
  } else {
    saleDetail.price = parseFloat(saleDetail.original_price);
  }
  console.log({ saleDetail });
};

const handlePaymentMethodChange = ($event) => {
  const selectedPaymentMethod = $event.target.value;
  let discountRateKey = null;
  if (selectedPaymentMethod == 1) {
    discountRateKey = "discount_rate_cash";
  } else if (selectedPaymentMethod == 2) {
    discountRateKey = "discount_rate_card";
  }
  form.value.sale_details.forEach((sD) => {
    console.log(sD[discountRateKey]);
    sD.discount_rate = sD[discountRateKey];
    console.log(sD[discountRateKey] / 100);
    sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
  });
};
// Hooks
onMounted(async () => {
  await getSale(route.params.id);
  populateForm();
  await getBankAccounts();
  isLoaded.value = true;
});
</script>

<template>
  <div v-if="isLoaded">
    <form @submit.prevent="handleSubmit">
      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">
            Exchange ( Invoice No. : {{ sale.id }})
          </h1>
        </template>
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
                <b><AppDate :timestamp="sale.date" /> </b>
              </p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Gross Total</label>
              <b>{{ sale.net_amount }}</b>
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Total Discount</label>
              <b>- {{ discount_amount ? sale.discount_amount : "0.00" }}</b>
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Shipping</label>
              <b>{{ shipping_charges ? sale.shipping_charges : "0.00" }}</b>
            </div>
            <hr />
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Net Total</label>
              <b>{{ sale.net_amount }}</b>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="text-end">
            <!-- <button class="btn btn-info btn-sm">
              <i class="fa fa-print"></i> &nbsp; Print Invoice
            </button> -->
          </div>
        </template>
      </Panel>

      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">Products</h1>
        </template>
        <div class="table-responsive">
          <table
            class="card-1 mb-0 table table-bordered table-hover table-striped"
          >
            <thead class="bg-primary text-light">
              <tr>
                <th></th>
                <th>#</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Sold Qty</th>
                <th>Exchnage Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(saleDetail, i) in form.sales_return_details"
                :key="saleDetail.sale_detail_id"
              >
                <td>
                  <label class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="saleDetail.checked"
                    />
                  </label>
                </td>
                <td>{{ i + 1 }}</td>
                <td>{{ saleDetail.product.name }}</td>
                <td>{{ saleDetail.price }}</td>
                <td>{{ saleDetail.quantity }}</td>
                <td>
                  <input
                    type="number"
                    :disabled="!saleDetail.checked"
                    class="form-control"
                    placeholder="0"
                    v-model="saleDetail.quantity_return"
                    :max="saleDetail.quantity"
                  />
                </td>
                <td>
                  {{
                    (saleDetail.price * saleDetail.quantity_return).toFixed(2)
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <template #footer>
          <div class="text-end">
            <button
              :disabled="exchangeGrossAmount.length === 0"
              @click="handlePrepareExchangeOrder"
              type="button"
              class="btn btn-lg btn-primary"
            >
              <i class="fa fa-refresh"></i> &nbsp; Exchange
            </button>
          </div>
        </template>
      </Panel>

      <Panel v-if="exchangeMode">
        <template #header>
          <h1 class="h3 mb-0 text-middle">Exchange Order</h1>
        </template>
        <!-- <div class="table-responsive">
                <table class="card-1 mb-0 table table-bordered table-hover table-striped">
                    <thead class="bg-primary text-light">
                        <tr>
                            <th>Product Name</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(saleDetail, i) in exchangeOrderDetails">

                            <td>{{ saleDetail.product.name }}</td>
                            <td>{{ saleDetail.price }}</td>
                            <td>{{ saleDetail.quantity }} </td>
                            <td>{{ saleDetail.amount }}</td>
                        </tr>
                    </tbody>
                </table>
            </div> -->
        <div class="row mb-3">
          <div class="col" style="margin-top: 1.9em;">
            <div class="input-group mb-3">
              <span class="input-group-text bg-primary text-light">
                <i class="fa fa-qrcode" aria-hidden="true"></i>
              </span>
              <input
                type="search"
                autofocus
                ref="productBarcodeInput"
                @change.enter.prevent="handleProductScan($event.target.value)"
                class="form-control form-control-lg"
                placeholder="Barcode Scan"
              />
            </div>
          </div>
          <div class="col">
            <FormAjaxSelect
              name="product"
              label="Select Product"
              slug="products"
              v-model="selectedProduct"
              @update:modelValue="handleProductSelect"
            />
          </div>
        </div>
        <div class="table-responsive" v-if="form.sales_return_details.length">
          <table class="table">
            <thead class="bg-primary text-light">
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Discount %</th>
                <th>Amount</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(saleDetail, i) in form.sale_details">
                <td>{{ i + 1 }}</td>
                <td>{{ saleDetail.product_name }}</td>
                <td>
                  <select
                    @change="handlePriceSelect(saleDetail)"
                    class="form-select"
                    v-model="saleDetail.original_price"
                  >
                    <option :value="saleDetail.product.default_selling_price">
                      {{ saleDetail.product.default_selling_price }}
                    </option>
                    <option
                      :value="saleDetail.product.default_selling_price_old"
                    >
                      OLD - {{ saleDetail.product.default_selling_price_old }}
                    </option>
                  </select>
                  <!-- <input
                    type="number"
                    class="form-control w-auto"
                    v-model="saleDetail.price"
                  /> -->
                </td>
                <td>
                  <input
                    type="number"
                    @input="
                      validateQuantity(saleDetail.product.stock, $event)
                    "
                    class="form-control w-auto error"
                    v-model="saleDetail.quantity"
                    :max="saleDetail.product.stock"
                  />
                  <small
                    >Only {{ saleDetail.product.stock }} Pc(s)
                    available</small
                  >
                </td>
                <td>{{saleDetail.discount_rate}}</td>
                <td>
                  {{
                    saleDetail.price * saleDetail.quantity
                      ? saleDetail.price * saleDetail.quantity
                      : 0
                  }}
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    @click="handleRemoveItem($event, saleDetail.product_id)"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr />

        <div class="row">
          <div class="col">
            <!-- <div class="row g-3 align-items-center">
                            <div class="col-auto">
                                <label class="form-label" for="amount_paid"><b>Amount:</b></label>
                                <input type="number" class="form-control form-control-lg" id="amount_paid"
                                    v-model="form.paid_amount" />
                            </div>
                            <div class="col-auto">
                                <button @click.prevent="handleFullPaid" :disabled="!netAmount"
                                    class="btn btn-primary btn-lg">Full Paid</button>
                            </div>
                        </div> -->
          </div>
          <div class="col"></div>
          <div class="col">
            
            <div class="mb-3" v-if="netAmount != '0' && form.sale_details.length">
              <label class="form-label" for="payment_method_id"
                ><b>Payment Method:</b></label
              >
              <select id="payment_method_id" class="form-select"  v-model.number="form.payment_method_id" @change="handlePaymentMethodChange">
                <option value="1">Cash</option>
                <option value="2">Bank</option>
              </select>
            </div>
            <div
          class="mb-3 d-flex justify-content-between mb-3"
          v-if="form.payment_method_id === 2 && form.sale_details.length"
        >
          <!-- <label class="form-label me-2" for="paid">&nbsp;</label
          > -->
         
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
              >{{ bank.bank_name }}</option
            >
          </select>
        </div>
          </div>
        </div>

        <div class="row mt-2">
          <div class="col"></div>
          <div class="col"></div>
          <div class="col">
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">Total</label>
              <b>{{ grossAmountTotal }}</b>
            </div>

            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                >Exchange Discount</label
              >
              <b>(-){{ exchangeOrderTotal }}</b>
            </div>
            <!-- <div class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date">Discount</label>
                        <b>{{discount_amount ? sale.discount_amount : '0.00'}}</b>
                    </div> -->
            <!-- <div class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date">Shipping</label>
                        <b>{{shipping_charges ? sale.shipping_charges : '0.00'}}</b>
                    </div> -->
            <hr />
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date">{{
                netAmount < 0 ? "Credit Amount" : "Balance"
              }}</label>
              <b>{{ netAmount }}.00</b>
            </div>
            <!-- <div v-if="netAmount > 0" class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date">Remaining</label>
                        <b>{{dueAmount}}</b>
                    </div> -->
          </div>
        </div>
        <template #footer>
          <div class="text-end">
            <button class="btn btn-primary btn-lg" type="submit">Submit</button>
          </div>
        </template>
      </Panel>
    </form>
  </div>
</template>
