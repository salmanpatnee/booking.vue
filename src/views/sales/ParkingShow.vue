<script setup>
import http from "@@/services/HttpService";
import { useAuthStore } from "@@/stores/authStore";
import { onMounted, ref, inject, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
import { useToast } from "vue-toastification";
import moment from "moment";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";
import { Modal } from "bootstrap";
import { useFlash } from "@@/composables/useFlash";

// Data
const authStore = useAuthStore();

const isLoaded = ref(false);
const { flash } = useFlash();
const sale = ref({
  data: null,
  isLoading: true,
});

const openingDay = ref({
  isOpen: false,
  data: {},
});

const route = useRoute();
const router = useRouter();
const toast = ref(useToast());
const customers = ref([]);
const products = ref([]);
const baseEndpoint = "/api/sales";
const swal = inject("$swal");
const barcodeInput = ref(null);
const productBarcodeInput = ref(null);

let discountRateKey = "discount_rate_cash";
let modal = null;
let modalID = "paymentModal";
let shouldSubmit = true;
const bankAccounts = ref([]);

// const isRegisterOpen = computed(() => {
//   return authStore.user.cash_registers.length;
// });

const handleShipment = () => {
  if (form.value.is_deliverable) {
    discountRateKey = "discount_rate_shipment";
  } else {
    discountRateKey = "discount_rate_cash";
  }

  form.value.sale_details.forEach((sD) => {
    console.log(sD[discountRateKey]);
    sD.discount_rate = sD[discountRateKey];
    console.log(sD[discountRateKey] / 100);
    sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
  });
};

const cashRegisterForm = ref(
  new Form({
    cash_in_hand: null,
    date: moment().format("YYYY-MM-DD"),
  })
);

const form = ref(
  new Form({
    id: "",
    account_id: "",
    date: moment().format("YYYY-MM-DD"),
    discount_amount: 0,
    // shipping_charges: parseFloat(0.0).toFixed(2),
    shipping_charges: 0.0,
    amount: 120,
    sale_details: [],
    quantity: [],
    unit_cost: [],
    payment_method_id: null,
    bank_account_id: "",
    status: "ordered",
    paid_amount: null,
    due: null,
    returned_amount: null,
    is_deliverable: false,
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

// const getCustomers = async () => {
//   const response = await axios.get("/api/accounts?type=customer");
//   customers.value = response.data.data;
// };

// const getProducts = async (search, loading) => {
//   if (search.length) {
//     loading(true);
//     searchProducts(loading, search);
//   }
// };

// const handleAjaxSelect = () => {
//   form.value.account_id = selectedCustomer.value.id;
// };

const handleChoosePaymentMethod = (paymentMethod) => {
  form.value.payment_method_id = paymentMethod;

  if (form.value.is_deliverable) discountRateKey = "discount_rate_shipment";
  else {
    if (paymentMethod == 1) {
      discountRateKey = "discount_rate_cash";
    } else if (paymentMethod == 2) {
      discountRateKey = "discount_rate_card";
    }
  }

  form.value.sale_details.forEach((sD) => {
    sD.discount_rate = sD[discountRateKey];
    sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
  });
};

// const handlePaymentMethodChange = ($event) => {
//   const selectedPaymentMethod = $event.target.value;

//   if (selectedPaymentMethod == 1) {
//     discountRateKey = "discount_rate_cash";
//   } else if (selectedPaymentMethod == 2) {
//     discountRateKey = "discount_rate_card";
//   }
//   form.value.sale_details.forEach((sD) => {
//     console.log(sD[discountRateKey]);
//     sD.discount_rate = sD[discountRateKey];
//     console.log(sD[discountRateKey] / 100);
//     sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
//   });
// };

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

  if (product.stock < 1) {
    flash("Product is out of stock", "error");
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
      product.default_selling_price * ((100 - product[discountRateKey]) / 100),
    quantity: 1,
    stock: product.stock,
    discount_rate: product[discountRateKey],
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

// const searchProducts = debounce((loading, search) => {
//   axios
//     .get("/api/products?search=" + search)
//     .then(({ data }) => {
//       products.value = data.data.data;
//       loading(false);
//     })
//     .catch((error) => console.log("Error: " + error));
// }, 350);

// const handleBarcodeScan = (barcode) => {
//   shouldSubmit = false;

//   if (barcode.length) {
//     // loading(true);
//     searchProductsWithBarcode(barcode);

//     barcodeInput.value.value = "";
//   }
// };

const handleBarcodeScan = async (barcode) => {
  if (barcode.length) {
    await getSale(barcode);
    barcodeInput.value = "";
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

    // console.log({product});
    // return;
    // delete product.id;

    const obj = {
      quantity: 1,
      original_price: product.default_selling_price,
      price:
        product.default_selling_price *
        ((100 - product[discountRateKey]) / 100),
      product_name: product.name,
      product_id: product.id,
      discount_rate: product[discountRateKey],
      stock: product.stock,
      product: product,
      discount_rate_cash: product.discount_rate_cash,
      discount_rate_card: product.discount_rate_card,
      discount_rate_shipment: product.discount_rate_shipment,
    };

    form.value.sale_details.push(obj);
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
  } catch (error) {
    flash(error.response.data.message, "error");
  }
}, 350);

// const selectProduct = (product) => {
//   axios
//     .get("/api/products/" + product.id)
//     .then(({ data }) => {
//       let product = data.data;
//       form.value.selected_products.push(product);
//       form.value.quantity.push(1);
//     })
//     .catch((error) => console.log("Error: " + error));
// };

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
              modal.hide();
              isLoaded.value = false;
              form.value.reset();
              sale.value = {};
              barcodeInput.value.focus();
            } else {
              modal.hide();
              isLoaded.value = false;
              sale.value = {};
              barcodeInput.value.focus();
            }
          });

        // toast.value.success(response.data.message);
        // router.push({
        // name: "sales.show",
        // params: { id: response.data.data.id },
        // });
      }
    })
    .catch((error) => {
      flash(error.response.data.message, "error");
    });
};

// const getAvailableStock = (initialQuantity, stock) => {
//   // if(initialQuantity) return  parseFloat(stock) + parseFloat(initialQuantity);
//   return stock;
// };

// const getAvailableStock = (() => {
//   // saleDetail.stock + saleDetail.initialQuantity
//   return 10;
// })

const grossAmount = computed(() => {
  return form.value.sale_details.map((sale_detail) => {
    return sale_detail.price * sale_detail.quantity;
  });
});

const grossAmountTotal = computed(() => {
  return grossAmount.value.reduce((a, b) => a + b, 0);
});

// const netAmount = computed(() => {
//   return grossAmountTotal.value - form.value.discount_amount;
// });

const displayNetTotal = computed(() => {
  if (!displaySubTotal.value) return 0.0;
  let total = 0;

  total =
    parseFloat(displaySubTotal.value) - parseFloat(displayTotalDiscount.value);
  if (form.value.shipping_charges)
    total += parseFloat(form.value.shipping_charges);

  form.value.grand_total = total.toFixed(2);
  return total.toFixed(2);
});

const displayDueAmount = computed(() => {
  if (
    form.value.paid_amount &&
    form.value.paid_amount < displayNetTotal.value
  ) {
    return (displayNetTotal.value - form.value.paid_amount).toFixed(2);
  }
  return null;
});

const displayChangeAmount = computed(() => {
  let netTotal = parseFloat(displayNetTotal.value);

  if (form.value.paid_amount && form.value.paid_amount > netTotal) {
    form.value.returned_amount = form.value.paid_amount - netTotal;
    return form.value.returned_amount.toFixed(2);
  }
  form.value.returned_amount = null;
  return;
});

// watch(
//   () => grossAmountTotal.value,
//   (discount_rate, prevCount) => {
//     form.value.gross_amount = grossAmountTotal;
//     form.value.net_amount = grossAmountTotal.value - form.value.discount_rate;
//     calculateDiscount();
//   }
// );

const validateQty = (input, stock) => {
  if (input.value > stock) {
    input.value = stock;
  }
};

// const getSale = async () => {
//   sale.value.isLoading = true;
//   const response = await axios.get(`${baseEndpoint}/${route.params.id}`);
//   sale.value.data = response.data.data;
//   sale.value.isLoading = false;
//   selectedCustomer.value = sale.value.data.account;
//   form.value.account_id = selectedCustomer.value.id;
//   form.value.id = sale.value.data.id;
//   form.value.date = sale.value.data.date;
//   form.value.shipping_charges = sale.value.data.shipping_charges;
//   form.value.discount_amount = sale.value.data.discount_amount;

//   const saleDetails = sale.value.data.sale_details;
//   saleDetails.forEach((sD) => {
//     console.log(sD);
//     sD.product_name = sD.product.name;
//     sD.stock = sD.product.stock;
//     sD.discount_rate_cash = sD.product.discount_rate_cash;
//     sD.discount_rate_card = sD.product.discount_rate_card;
//   });
//   form.value.sale_details = saleDetails;
// };

const getSale = async (id) => {
  try {
    const response = await axios.get(`/api/sales-ordered/${id}`);
    sale.value.data = response.data.data;

    console.log(sale.value.data.is_deliverable);

    sale.value.isLoading = false;
    selectedCustomer.value = sale.value.data.account;
    form.value.account_id = selectedCustomer.value.id;
    form.value.id = sale.value.data.id;
    form.value.date = sale.value.data.date;
    form.value.shipping_charges = sale.value.data.shipping_charges;
    form.value.discount_amount = sale.value.data.discount_amount;
    form.value.is_deliverable = sale.value.data.is_deliverable;
    form.value.shipping_address = sale.value.data.shipping_address;

    const saleDetails = sale.value.data.sale_details;

    saleDetails.forEach((sD) => {
      sD.product_name = sD.product.name;
      sD.stock = sD.product.stock;
      sD.discount_rate_cash = sD.product.discount_rate_cash;
      sD.discount_rate_card = sD.product.discount_rate_card;
      sD.discount_rate_shipment = sD.product.discount_rate_shipment;
      sD.initialQuantity = sD.quantity;
      if (form.value.is_deliverable) discountRateKey = "discount_rate_shipment";

      sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
    });

    form.value.sale_details = saleDetails;
    sale.value.isLoading = true;
    isLoaded.value = true;
    // productBarcodeInput.value.focus();
  } catch (error) {
    // console.log({ error });
    flash(error.response.data.message, "error");
    productBarcodeInput.value = "";
    // productBarcodeInput.value.focus();
    isLoaded.value = false;
  }
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

const handlePayment = () => {
  form.value.payment_method_id = null;
  // form.value.shipping_charges = 0.00;
  form.value.paid_amount = null;

  modal.show();
};

const handleBackToSearch = () => {
  isLoaded.value = false;
  sale.value = {};
  // barcodeInput.value.focus();
};

const handleProductScan = (barcode) => {
  shouldSubmit = false;
  if (barcode.length) {
    searchProductsWithBarcode(barcode);
    productBarcodeInput.value.value = "";
  }
};

const handleCashRegister = async () => {
  await cashRegisterForm.value
    .post(`/api/cash-registers`)
    .then((response) => {
      if (response.data.status == "success") {
        flash(response.data.message);
        authStore.user.cash_registers = response.data.data;
        cashRegisterForm.value.reset();
      }
    })
    .catch((error) => {
      flash(error.response.data.message, "error");
      authStore.user.cash_registers = null;
    });
};

// const checkDayOpening = async () => {
//   try {
//     const { data: response } = await http.get(`/api/cash-registers/me`);
//     if (response.data.id) {
//       openingDay.value.isOpen = true;
//     }
//   } catch (error) {
//     openingDay.value.isOpen = false;
//   }
// };

const getBankAccounts = async () => {
  const { data: response } = await http.get(`/api/bank-accounts`);
  bankAccounts.value = response.data;
};
// Hooks
onMounted(async () => {
  // await checkDayOpening();
  await getBankAccounts();
  if (barcodeInput.value) {
    barcodeInput.value.focus();
  }
  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <div v-if="authStore.isRegisterOpen">
    <div v-if="!isLoaded" class="h-100">
      <div class="row align-items-center h-100">
        <div class="col">
          <div class="input-group mb-3">
            <input
              type="text"
              ref="barcodeInput"
              class="form-control p-4 search-invoice-input"
              placeholder="Search Invoice"
              @change.enter.prevent="handleBarcodeScan($event.target.value)"
            />
            <div class="input-group-append">
              <span class="bg-primary input-group-text text-light h-100 p-4">
                <i class="fa fa-search fa-2x"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div v-if="sale.isLoading">Loading...</div> -->
    <form @submit.prevent="handleSubmit" v-else>
      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">Edit Sale</h1>
          <a @click.prevent="handleBackToSearch" class="btn btn-primary">
            <div class="fa fa-arrow-circle-left"></div>
            Back to Search
          </a>
        </template>
        <div class="row align-items-center">
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
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                @change="handleShipment"
                class="form-check-input"
                v-model="form.is_deliverable"
                type="checkbox"
                value="1"
              />
              <span class="form-check-label"> Is Deliverable </span>
            </label>
            <!-- <div class="mb-3">
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
          </div> -->
          </div>
        </div>
      </Panel>

      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">Products</h1>
        </template>
        <div class="row mb-5">
          <div class="col" style="margin-top: 1.9em">
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
                <!-- <th>Dis%</th> -->
                <th>Amount</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(saleDetail, i) in form.sale_details"
                :key="saleDetail.id"
              >
                <td>{{ i + 1 }}</td>
                <td>{{ saleDetail.product_name }}</td>
                <td>
                  <select
                    @change="handlePriceSelect(saleDetail)"
                    class="form-select"
                    v-model="saleDetail.original_price"
                  >
                    <option :value="saleDetail.product.default_selling_price">
                      {{ saleDetail.product.default_selling_price.toFixed(2) }}
                    </option>
                    <option
                      :value="saleDetail.product.default_selling_price_old"
                    >
                      OLD -
                      {{
                        saleDetail.product.default_selling_price_old.toFixed(2)
                      }}
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
                    :class="`form-control pos-quantity ${
                      saleDetail.quantity >
                      saleDetail.stock + saleDetail.initialQuantity
                        ? 'invalid'
                        : ''
                    }`"
                    type="number"
                    min="1"
                    :max="saleDetail.stock"
                    v-model="saleDetail.quantity"
                    :id="`product-${i}-quantity`"
                  />

                  <!-- <input
                    type="number"
                 
                    class="form-control w-auto error"
                    v-model="saleDetail.quantity"
                    :max="saleDetail.stock + saleDetail.quantity"
                    min="1"
                  /> -->
                  <HasError :form="form" :field="saleDetail.quantity" />
                  <small>Only {{ saleDetail.stock }} pc(s) available</small>
                  <!-- <small>{{saleDetail.stock  }} +{{saleDetail.initialQuantity}}</small> -->
                </td>
                <!-- <td>{{ saleDetail.discount_rate }}</td> -->
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
        <!-- <button v-if="form.is_deliverable" :disabled="!form.sale_details.length"
          @click.prevent="update"
          type="button"
          class="btn btn-primary rounded-0 btn-lg me-3"
        >
        {{form.is_deliverable  ? '' : '<i class="fa fa-money"></i>'}} 
          {{form.is_deliverable  ? 'Update' : 'Proceed to Payment'}}
        </button> -->

        <button
          :disabled="!form.sale_details.length"
          @click.prevent="handlePayment"
          type="button"
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
  </div>
  <div v-else>
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Cash Register</h1>
      </template>

      <div class="row">
        <div class="col-2"></div>
        <div class="col">
          <div class="row mb-4 align-items-end">
            <div class="col-8">
              <label for="cash_in_hand" class="form-label">Cash in Hand:</label>
              <input
                type="number"
                v-model="cashRegisterForm.cash_in_hand"
                class="form-control form-control-lg"
                id="cash_in_hand"
                required=""
              />
            </div>
            <div class="col-4">
              <button
                type="button"
                :disabled="!cashRegisterForm.cash_in_hand"
                @click.prevent="handleCashRegister"
                class="btn btn-primary"
              >
                Open Register
              </button>
            </div>
          </div>
        </div>
        <div class="col-2"></div>
      </div>
    </Panel>
  </div>
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
      <div class="col-6 pe-4" style="border-right: 1px solid #ccc">
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
            ><b>Delivery Charges:</b></label
          ><b
            ><input
              type="number"
              step="0.01"
              v-model.number="form.shipping_charges"
              id="shipping-cost"
              min="0"
              class="form-control px-3"
              :class="form.shipping_charges < 0 ? 'invalid' : ''"
          /></b>
        </div>
        <hr />
        <div class="fs-4 mb-3 d-flex justify-content-between mb-3">
          <label class="form-label me-2" for="date"><b>Grand Total:</b></label
          ><b>{{ displayNetTotal }}</b>
        </div>
      </div>
      <div class="col ps-5">
        <div
          class="mb-3 d-flex justify-content-between mb-3"
          v-if="form.payment_method_id === 2"
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
            >
              {{ bank.bank_name }}
            </option>
          </select>
        </div>
        <div class="mb-3 d-flex justify-content-between mb-3">
          <label class="form-label me-2" for="paid"><b>Pay:</b></label
          ><b
            ><input
              type="number"
              required
              v-model.number="form.paid_amount"
              :min="displayNetTotal"
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
              class="form-control text-end px-3"
              step="0.01"
          /></b>
        </div>
        <button
          :disabled="form.payment_method_id === null"
          class="btn btn-lg w-100 btn-primary rounded-0 text-uppercase"
        >
          <i class="fa fa-lock"></i> Pay
        </button>
      </div>
    </div>
    <!-- <template #footer>
      <Button :form="form" class="btn btn-primary">Save</Button>
    </template> -->
  </VueModal>
</template>

<style scoped>
.choosen {
  filter: grayscale(1);
}
.search-invoice-input {
  font-size: 26px;
  border-top-left-radius: 2rem;
  border-bottom-left-radius: 2rem;
}
.input-group-text {
  border-top-right-radius: 2rem;
  border-bottom-right-radius: 2rem;
}
span.form-check-label {
  font-size: 16px;
  margin-left: 0.5em;
}
.form-check-input {
  width: 1.5em;
  height: 1.5em;
  margin-top: 0.1em;
}
</style>
