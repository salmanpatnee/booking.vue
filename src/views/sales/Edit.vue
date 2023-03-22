<script setup>
import { onMounted, ref, inject, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
import { useToast } from "vue-toastification";
import moment from "moment";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";
import { Modal } from "bootstrap";

// Data
const sale = ref({
  data: null,
  isLoading: true,
});
const route = useRoute();
const router = useRouter();
const toast = ref(useToast());
const customers = ref([]);
const products = ref([]);
const baseEndpoint = "/api/sales";
const swal = inject("$swal");
const barcodeInput = ref(null);
let modal = null;
let modalID = "paymentModal";
let shouldSubmit = true;

const form = ref(
  new Form({
    id: "",
    account_id: "",
    date: moment().format("YYYY-MM-DD"),
    discount_amount: 0,
    shipping_charges: parseFloat(0.0).toFixed(2),
    amount: 120,
    sale_details: [],
    quantity: [],
    unit_cost: [],
    payment_method_id: null,
    status: "ordered",
    paid: null,
    due: null,
    return_amount: null,
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

const handleChoosePaymentMethod = (paymentMethod) => {
  form.value.payment_method_id = paymentMethod;

  let discountRateKey = null;

  if (paymentMethod == 1) {
    discountRateKey = "discount_rate_cash";
  } else if (paymentMethod == 2) {
    discountRateKey = "discount_rate_card";
  }

  form.value.sale_details.forEach((sD) => {
    sD.discount_rate = sD[discountRateKey];
    sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
  });
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

const handlePriceSelect = (saleDetail) => {
  console.log({ saleDetail });

  if (saleDetail.discount_rate) {
    const percentageOfPrice = (100 - saleDetail.discount_rate) / 100;
    saleDetail.price = saleDetail.original_price * percentageOfPrice;
  } else {
    saleDetail.price = parseFloat(saleDetail.original_price);
  }
  console.log({ saleDetail });
};

const handleProductSelect = (selectedOption) => {
  selectedProduct.value = selectedOption;

  const product = selectedOption;

  /* Check whether product already selected */
  const productExist = form.value.sale_details.findIndex((sD) => {
    return sD.product_id === product.id;
  });

  if (productExist !== -1) {
    alert("This product is already selected");
    setTimeout(() => {
      selectedProduct.value = null;
    }, 300);
    return;
  }

  const obj = {
    product_id: product.id,
    product_name: product.name,
    original_price: product.default_selling_price,
    price:
      product.default_selling_price *
      ((100 - product.discount_rate_cash) / 100),
    quantity: 1,
    stock: product.stock,
    discount_rate: product.discount_rate_cash,
    product: product,

    discount_rate_cash: product.discount_rate_cash,
    discount_rate_card: product.discount_rate_card,
    discount_rate_shipment: product.discount_rate_shipment,
  };

  form.value.sale_details.push(obj);
  setTimeout(() => {
    selectedProduct.value = null;
  }, 300);
};

const handleRemoveItem = ($event, productId) => {
  const saleDetails = form.value["sale_details"].filter(
    (pD) => pD.product_id !== productId
  );
  form.value["sale_details"] = saleDetails;
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

const handleBarcodeScan = (barcode) => {
  shouldSubmit = false;

  if (barcode.length) {
    // loading(true);
    searchProductsWithBarcode(barcode);

    barcodeInput.value.value = "";
  }
};

const handleAddToCart = async (product) => {
  
  
  let productInCart =
    form.value.sale_details.length &&
    form.value.sale_details.find((item) => {
      return item.product_id === product.id;
    });
  

  
  if (productInCart) {
    if (productInCart.quantity + 1 > product.stock) return false;

    productInCart.quantity++;
    
  } else {
    product.quantity = 1;
    product.original_price = product.default_selling_price;
    product.price = product.original_price;
    product.product = {};
    product.product.default_selling_price = product.price;
    product.product.default_selling_price_old = product.default_selling_price_old;
    product.product_name = product.name;
    product.product.name = product.name;
    product.product.stock = product.stock;
    product.product.discount_rate_cash = product.discount_rate_cash;
    product.product.discount_rate_card = product.discount_rate_card;
    product.product.discount_rate_shipment = product.discount_rate_shipment;
    product.product.barcode = product.barcode;
    
    
    /*
    if (product.discount_rate_cash) {
      let x = (
        (product.default_selling_price * product.discount_rate_cash) /
        100
      ).toFixed(2);
      product.price = product.default_selling_price - x;
    } else {
      product.price = product.default_selling_price;
    }
    */
    product.product_id = product.id;
    product.discount_rate = product.discount_rate_cash;
    // console.log({product});
    // return;
    // delete product.id;
    form.value.sale_details.push(product);
  }
};

const searchProductsWithBarcode = debounce(async (query) => {
  let url = `/api/products?`;
  url += `for=sales.create&`;
  url += `barcode=${query}`;

  try {
    const response = await axios.get(url);
    if (response.data.data) {
      // products.value = response.data.data;
      // console.log("Now what?", products.value);
      handleAddToCart(response.data.data);
    } else {
      alert("No product found");
    }
  } catch (ex) {
    console.log(ex);
  }
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

const handleSubmit = () => {
  console.log(shouldSubmit);
  if (!shouldSubmit) {
    shouldSubmit = true;
    return;
  }
  update();
};

const update = async () => {
  form.value
    .patch(`${baseEndpoint}/${form.value.id}`)
    .then((response) => {
      if (response.data.status == "success") {
        swal
          .fire({
            title: "Success!",
            text: "Do You Want To Print ?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Yes!",
          })
          .then((result) => {
            if (result.isConfirmed) {
              let routeData = router.resolve({
                name: "sales.invoice",
                params: { id: form.value.id },
              });
              window.open(routeData.href, "_blank");
            }
          });

        // toast.value.success(response.data.message);
        // router.push({
        // name: "sales.show",
        // params: { id: response.data.data.id },
        // });
      }
    })
    .catch((error) => console.log(error));
};

const grossAmount = computed(() => {
  return form.value.sale_details.map((sale_detail) => {
    return sale_detail.price * sale_detail.quantity;
  });
});

const grossAmountTotal = computed(() => {
  return grossAmount.value.reduce((a, b) => a + b, 0);
});

const netAmount = computed(() => {
  return grossAmountTotal.value - form.value.discount_amount;
});

const displayDueAmount = computed(() => {
  if (form.value.paid && form.value.paid < displayNetTotal.value) {
    return displayNetTotal.value - form.value.paid;
  }
  return null;
});

const displayChangeAmount = computed(() => {
  if (form.value.paid && form.value.paid > displayNetTotal.value) {
    form.value.return_amount = form.value.paid - displayNetTotal.value;
    return form.value.return_amount;
  }
  return null;
});

// watch(
//   () => grossAmountTotal.value,
//   (discount_rate, prevCount) => {
//     form.value.gross_amount = grossAmountTotal;
//     form.value.net_amount = grossAmountTotal.value - form.value.discount_rate;
//     calculateDiscount();
//   }
// );

const validateQuantity = (available_quantity, quantity) => {
  console.log(available_quantity, quantity);
};

const getSale = async () => {
  sale.value.isLoading = true;
  const response = await axios.get(`${baseEndpoint}/${route.params.id}`);
  sale.value.data = response.data.data;
  sale.value.isLoading = false;
  selectedCustomer.value = sale.value.data.account;
  form.value.account_id = selectedCustomer.value.id;
  form.value.id = sale.value.data.id;
  form.value.date = sale.value.data.date;
  form.value.shipping_charges = sale.value.data.shipping_charges;
  form.value.discount_amount = sale.value.data.discount_amount;

  const saleDetails = sale.value.data.sale_details;
  saleDetails.forEach((sD) => {
    console.log(sD);
    sD.product_name = sD.product.name;
    sD.stock = sD.product.stock;
    sD.discount_rate_cash = sD.product.discount_rate_cash;
    sD.discount_rate_card = sD.product.discount_rate_card;
  });
  form.value.sale_details = saleDetails;
};

const displaySubTotal = computed(() => {
  let subTotal = 0;
  form.value.sale_details &&
    form.value.sale_details.forEach(
      (item) =>
        (subTotal += parseInt(item.quantity) * parseFloat(item.original_price))
    );
  subTotal = parseFloat(subTotal).toFixed(2);
  form.value.subtotal = subTotal;
  return subTotal;
});

const displayDiscountedPrice = (price, discountRate = 0) => {
  let discountedPrice = 0;
  discountedPrice = price - (price * discountRate) / 100;
  return parseFloat(discountedPrice).toFixed(2);
};

const displayTotalDiscount = computed(() => {
  let totalDiscount = 0;
  form.value.sale_details &&
    form.value.sale_details.forEach((item) => {
      console.log(item.quantity, item.original_price);
      const amount = parseInt(item.quantity) * parseFloat(item.original_price);
      totalDiscount += amount * (item.discount_rate / 100);
      // return (totalDiscount +=
      //    -
      //   displayDiscountedPrice(item.original_price, item.discount_rate_cash) *
      //     item.quantity);
    });

  totalDiscount = parseFloat(totalDiscount).toFixed(2);
  form.value.discount_amount = totalDiscount;
  return totalDiscount;
});

const displayNetTotal = computed(() => {
  if (!displaySubTotal.value) return 0.0;
  let total = 0;

  total =
    parseFloat(displaySubTotal.value) -
    parseFloat(displayTotalDiscount.value) +
    parseFloat(form.value.shipping_charges);
  form.value.grand_total = total.toFixed(2);
  return total.toFixed(2);
});

const handlePayment = () => {
  console.log("handlePayment");
  form.value.payment_method_id = null;
  modal.show();
};

// Hooks
onMounted(async () => {
  await getCustomers();
  await getSale();

  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <div v-if="sale.isLoading">Loading...</div>
  <form @submit.prevent="handleSubmit" v-else>
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Edit Sale</h1>
        <router-link class="btn btn-primary" :to="{ name: 'products.index' }">
          All Sale
        </router-link>
      </template>
      <div class="row">
        <div class="col mb-3">
          <label class="form-label" for="account_id">Customer:</label>
          <input
            type="text"
            class="form-control"
            v-model="sale.data.account.name"
            id="account_id"
            readonly
          />
          <HasError :form="form" field="account_id" />
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="id">Invoice No:</label>
            <input
              type="text"
              readonly
              class="form-control"
              v-model="form.id"
              id="id"
            />
            <HasError :form="form" field="id" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="date">Sale Date:</label>
            <input
              type="date"
              readonly
              class="form-control"
              v-model="form.date"
              id="date"
            />
            <HasError :form="form" field="date" />
          </div>
        </div>
        <!-- <div class="col">
          <div class="mb-3">
            <label class="form-label" for="payment_method_id"
              >Payment Method:</label
            >
            <select
              id="payment_method_id"
              class="form-select"
              v-model.number="form.payment_method_id"
              @change="handlePaymentMethodChange"
            >
              <option value="1">Cash</option>
              <option value="2">Bank</option>
            </select>
          </div>
        </div> -->
      </div>
    </Panel>

    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Products</h1>
      </template>
      <div class="row mb-5">
        <div class="col" style="margin-top: 1.9em;">
          <div class="input-group mb-3">
            <span class="input-group-text bg-primary text-light">
              <i class="fa fa-qrcode" aria-hidden="true"></i>
            </span>
            <input
              type="search"
              autofocus
              ref="barcodeInput"
              @change.enter.prevent="handleBarcodeScan($event.target.value)"
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
            for-route="sales.create"
            v-model="selectedProduct"
            @update:modelValue="handleProductSelect"
          />
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="bg-primary text-light">
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Dis%</th>
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
                  <option :value="saleDetail.product.default_selling_price_old">
                    OLD - {{ saleDetail.product.default_selling_price_old }}
                  </option>
                </select>
                <!-- <input
                  type="number"
                  class="form-control w-auto"
                  v-model="saleDetail.price"
                  step=".01"
                /> -->
              </td>
              <td>
                <input
                  type="number"
                  @input="
                    validateQuantity(saleDetail.available_quantity, $event)
                  "
                  class="form-control w-auto error"
                  v-model="saleDetail.quantity"
                  :max="saleDetail.available_quantity"
                />
                <small>Only {{ saleDetail.stock }} Pc(s) available</small>
              </td>
              <td>{{ saleDetail.discount_rate }}</td>
              <td>
                {{
                  saleDetail.price * saleDetail.quantity
                    ? (saleDetail.price * saleDetail.quantity).toFixed(2)
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
    </Panel>

    <!--
    <Panel>
      <div class="row justify-content-end">
        <div class="col-12">
          <div class="row g-3 mb-2 justify-content-end align-items-center">
            <div class="col-auto">
              <label for="subtotal" class="col-form-label fw-bold"
                >Subtotal:</label
              >
            </div>
            <div class="col-4">
              <input
                type="text"
                readonly
                v-model="displaySubTotal"
                id="subtotal"
                class="form-control text-end px-3"
              />
            </div>
          </div>
          <div class="row g-3 mb-2 justify-content-end align-items-center">
            <div class="col-auto">
              <label for="total-discount" class="col-form-label fw-bold"
                >Total Discount:</label
              >
            </div>
            <div class="col-4">
              <input
                type="text"
                readonly
                v-model="displayTotalDiscount"
                id="total-discount"
                class="form-control text-end px-3"
              />
            </div>
          </div>

          <div class="row g-3 mb-2 justify-content-end align-items-center">
            <div class="col-auto">
              <label for="shipping-cost" class="col-form-label fw-bold"
                >Shipping Cost:</label
              >
            </div>
            <div class="col-4">
              <input
                type="text"
                v-model.number="form.shipping_charges"
                id="shipping-cost"
                class="form-control text-end px-3"
              />
            </div>
          </div>

          <div class="row g-3 mb-2 justify-content-end align-items-center">
            <div class="col-auto">
              <label for="grand-total" class="col-form-label fw-bold"
                >Grand Total:</label
              >
            </div>
            <div class="col-4">
              <input
                type="text"
                v-model="displayNetTotal"
                readonly
                id="grand-total"
                class="form-control text-end px-3"
              />
            </div>
          </div>
        </div>
      </div>
    </Panel>
    -->

    <Panel class="text-end">
      <button
        @click.prevent="handlePayment" type="button"
        class="btn btn-primary rounded-0 btn-lg me-3"
      >
        <i class="fa fa-money"></i>
        Proceed to Payment
      </button>

      <!-- <button class="btn btn-success btn-lg me-3">
            <i class="fa fa-money"></i>
            Full Paid
        </button> -->

      <!-- <Button :form="form" class="btn btn-primary btn-lg"
        ><i class="fa fa-save"></i> Save Sale</Button
      > -->
    </Panel>
  </form>

  <Teleport to="body">
    <VueModal :id="modalID" class="modal-lg" @onSubmit="update">
      <template #title>
        <h3 class="m-0 text-light fw-bold">Payment</h3>
      </template>
      <h2 class="text-center mb-3 fw-bold">Choose a Payment Method</h2>
      <hr />
      <div class="row text-center mb-4">
        <div class="col">
          <img
            src="/img/money.png"
            class="w-25 mb-2 clickable"
            :class="{ choosen: form.payment_method_id == 1 }"
            @click="handleChoosePaymentMethod(1)"
          />
          <h3>Cash</h3>
        </div>
        <div class="col">
          <img
            src="/img/credit.png"
            class="w-25 mb-2 clickable"
            :class="{ choosen: form.payment_method_id == 2 }"
            @click="handleChoosePaymentMethod(2)"
          />
          <h3>Credit/Debit Card</h3>
        </div>
      </div>
      <hr class="my-4" />
      <div class="row justify-content-end">
        <div class="col-6 pe-4" style="border-right: 1px solid #ccc;">
          <div class="mb-3 d-flex justify-content-between mb-3">
            <label class="form-label me-2" for="date"><b>Subtotal:</b></label
            ><b>{{ displaySubTotal }}</b>
          </div>

          <div class="mb-3 d-flex justify-content-between mb-3">
            <label class="form-label me-2" for="date"
              ><b>Total Discount:</b></label
            ><b>{{ displayTotalDiscount }}</b>
          </div>
          <div class="mb-3 d-flex justify-content-between mb-3">
            <label class="form-label me-2" for="date"
              ><b>Shipping Cost:</b></label
            ><b
              ><input
                type="text"
                v-model.number="form.shipping_charges"
                id="shipping-cost"
                class="form-control text-end px-3"
            /></b>
          </div>
          <hr />
          <div class="fs-4 mb-3 d-flex justify-content-between mb-3">
            <label class="form-label me-2" for="date"><b>Grand Total:</b></label
            ><b>{{ displayNetTotal }}</b>
          </div>
        </div>
        <div class="col-6 ps-5">
          <div class="mb-3 d-flex justify-content-between mb-3">
            <label class="form-label me-2" for="paid"><b>Pay:</b></label
            ><b
              ><input
                type="number"
                v-model.number="form.paid"
                id="paid"
                class="form-control text-end px-3"
                step="0.01"
            /></b>
          </div>
          <div class="mb-3 d-flex justify-content-between mb-3">
            <label class="form-label me-2" for="due"><b>Due:</b></label
            ><b
              ><input
                type="number"
                readonly
                v-model.number="displayDueAmount"
                id="shipping-cost"
                class="form-control text-end px-3"
                step="0.01"
            /></b>
          </div>
          <div class="mb-3 d-flex justify-content-between mb-5">
            <label class="form-label me-2" for="change"><b>Change:</b></label
            ><b
              ><input
                type="number"
                v-model.number="displayChangeAmount"
                id="shipping-cost"
                class="form-control text-end px-3"
                step="0.01"
            /></b>
          </div>
          <button :disabled="form.payment_method_id === null" class="btn btn-lg w-100 btn-primary rounded-0 text-uppercase">
            <i class="fa fa-lock"></i> Pay
          </button>
        </div>
      </div>
      <!-- <template #footer>
      <Button :form="form" class="btn btn-primary">Save</Button>
    </template> -->
    </VueModal>
  </Teleport>
</template>

<style scoped>
.choosen {
  filter: grayscale(1);
}
</style>
