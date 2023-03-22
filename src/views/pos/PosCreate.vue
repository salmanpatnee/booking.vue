<script setup>
// import http from "@@/services/HttpService";
import categoryService from "@@/services/CategoryService";
import productService from "@@/services/ProductService";
import CategoryFilter from "./CategoryFilter.vue";
import ProductSearch from "./ProductSearch.vue";
import ProductList from "./ProductList.vue";
import axios from "axios";
import {
  onKeyStroke,
  onStartTyping,
  useMagicKeys,
  whenever,
} from "@vueuse/core";
import { useToast } from "vue-toastification";
import { Modal } from "bootstrap";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";
import moment from "moment";
import { useFlash } from "@@/composables/useFlash";
import Form from "vform";
import { onMounted, ref, watch, inject, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import "vue-select/dist/vue-select.css";
import { useCan } from "@@/composables/useCan";

// Data
// const openingDay = ref({
//   isLoading: false,
//   data: {}
// });

const { can } = useCan();
const isProcessing = ref(false);
const swal = inject("$swal");
const baseEndpoint = "/api/sales";
let modal = null;
// let registerModal = null;
let modalID = "customersModal";
// let registerModalId = "registerModal";
const searchProductInput = ref(null);
const barcodeInput = ref(null);
const { flash } = useFlash();
const router = useRouter();

const search = ref("");
const category_id = ref("");
const selectedCustomer = ref(null);
const toast = ref(useToast());

const categories = ref({
  loading: false,
  data: [],
});

const products = ref({
  loading: false,
  data: [],
});

const cashRegisterForm = ref(
  new Form({
    cash_in_hand: null,
    date: moment().format("YYYY-MM-DD"),
  })
);
const form = ref(
  new Form({
    account_id: null,
    payment_method_id: 1,
    status: "ordered",
    sale_details: [],
    subtotal: 0.0,
    discount_amount: 0.0,
    shipping_charges: 0.0,
    grand_total: 0.0,
    date: moment().format("YYYY-MM-DD"),
    is_deliverable: false,
    shipping_address: "",
  })
);

const customerForm = ref(
  new Form({
    id: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    balance: 0.0,
    account_type: "customer",
    for: "pos",
  })
);

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

const getProducts = debounce(async (page = 1) => {
  const params = {
    search: search.value,
    category: category_id.value,
    for: "sales.create",
  };
  products.value.loading = true;
  const { data: response } = await productService.getProducts(params);
  products.value.data = response.data;
  products.value.loading = false;
}, 350);

const getProductsByCategory = (category) => {
  search.value = "";
  category ? (category_id.value = category.id) : (category_id.value = "");
  getProducts();
};

const addCustomer = () => {
  customerForm.value
    .post(`api/sales/customers`)
    .then((response) => {
      if (response.data.status == "success") {
        selectedCustomer.value = response.data.data;
        form.value.account_id = selectedCustomer.value.id;
        modal.hide();
      }
    })
    .catch((error) => {
      flash(error.response.data.message, "error");
    });
};

watch(
  () => search.value,
  (newTerm, prevTerm) => {
    category_id.value = "";
    getProducts();
  }
);
watch(
  () => category_id.value,
  (newTerm, prevTerm) => {
    getProducts();
  }
);

const displayDiscountedPrice = (price, discountRate) => {
  let discountedPrice = 0;
  discountedPrice = price - (price * discountRate) / 100;
  return parseFloat(discountedPrice).toFixed(2);
};

const displayTotalDiscount = computed(() => {
  let totalDiscount = 0;
  form.value.sale_details &&
    form.value.sale_details.forEach((item) => {
      return (totalDiscount +=
        parseInt(item.quantity) * parseFloat(item.original_price) -
        displayDiscountedPrice(item.original_price, item.discount_rate_cash) *
          item.quantity);
    });

  totalDiscount = parseFloat(totalDiscount).toFixed(2);
  form.value.discount_amount = totalDiscount;
  return totalDiscount;
});

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

// Methods

const handleSelectedCustomer = () => {
  form.value.account_id = selectedCustomer.value.id;
};

const handleShipmentChange = () => {
  let discountRateKey = null;
  if (form.value.is_deliverable) {
    console.log(true);
    discountRateKey = "discount_rate_shipment";
  } else {
    console.log(false);
    discountRateKey = "discount_rate_cash";
  }

  form.value.sale_details.forEach((sD) => {
    console.log(sD[discountRateKey]);
    sD.discount_rate = sD[discountRateKey];
    console.log(sD[discountRateKey] / 100);
    sD.price = sD["original_price"] * ((100 - sD[discountRateKey]) / 100);
  });
};

const getCategories = async (page = 1) => {
  // const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const params = `?for=sales.create`;
  categories.value.loading = true;
  const { data: response } = await categoryService.getCategories(params);
  categories.value.data = response.data;
  categories.value.loading = false;
};

const handleAddToCart = async (product) => {
  let productInCart =
    form.value.sale_details.length &&
    form.value.sale_details.find((item) => {
      return item.id === product.id;
    });

  if (productInCart) {
    if (productInCart.quantity + 1 > product.stock) return false;

    productInCart.quantity++;
  } else {
    product.quantity = 1;
    product.original_price = product.default_selling_price;
    if (product.discount_rate_cash) {
      let x = (
        (product.default_selling_price * product.discount_rate_cash) /
        100
      ).toFixed(2);
      product.price = product.default_selling_price - x;
    } else {
      product.price = product.default_selling_price;
    }
    product.product_id = product.id;
    product.discount_rate = product.discount_rate_cash;
    // delete product.id;
    form.value.sale_details.push(product);
  }
};

const handleUpdatePrice = (item) => {
  if (item.discount_rate_cash) {
    let x = (
      (parseFloat(item.original_price) * item.discount_rate_cash) /
      100
    ).toFixed(2);
    item.price = parseFloat(item.original_price) - x;
  } else {
    item.price = parseFloat(item.original_price);
  }
};

const handleRemoveProduct = (item) => {
  form.value.sale_details = form.value.sale_details.filter(
    (product) => product.id !== item.id
  );
};

const store = async () => {
  isProcessing.value = true;
  if (form.value.sale_details.length < 1) {
    flash("Cart is empty", "error");
    isProcessing.value = false;
    return;
  }

  if (!form.value.account_id) {
    flash("Customer information is required.", "error");
    isProcessing.value = false;
    return;
  }

  await form.value
    .post(baseEndpoint)
    .then(async (response) => {
      if (response.data.status == "success") {
        isProcessing.value = false;
        form.value.reset();
        selectedCustomer.value = "";

        swal
          .fire({
            title: "Success!",
            text: "Do You Want To Print ?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Yes!",
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              let routeData = router.resolve({
                name: "sales.proceed.invoice",
                params: { id: response.data.data.id },
              });
              window.open(routeData.href, "_blank");
            }
          });
        await getProducts();
      }
    })
    .catch((error) => {
      isProcessing.value = false;
      console.log(error);
      flash("Something went wrong", "error");
    });
};

// onKeyStroke("Enter", store);
onStartTyping(() => {
  searchProductInput.value.focus();
});

const showCustomerModal = () => {
  customerForm.value.reset();
  modal.show();
};

// const showRegisterModal = () => {
//   registerModal.show();
// };

const { shift_c } = useMagicKeys();
whenever(shift_c, showCustomerModal);

const searchProducts = debounce(async (query) => {
  let url = `/api/products?`;
  url += `for=sales.create&`;
  url += `barcode=${query}`;

  try {
    const response = await axios.get(url);
    if (response.data.data) {
      handleAddToCart(response.data.data);
    } else {
      alert("No product found");
    }
  } catch (error) {
    flash(error.response.data.message, "error");
  }
}, 350);

const handleBarcodeScan = (barcode) => {
  if (barcode.length) {
    console.log(barcode.length);
    // loading(true);
    searchProducts(barcode);
    console.log({ barcodeInput });
    barcodeInput.value.value = "";
  }
};

// const checkDayOpening = async () => {
//   try {
//     const {data} = await http.get(`/api/cash-registers/me`);
//     if(data.data.id){
//       openingDay.value.isLoading = true;
//       openingDay.value.data = data.data;
//     }

//   } catch (error) {
//     openingDay.value.isLoading = false;
//     // console.log("ERROR:" + {error});
//     // router.push({name: 'sales.index'})
//   }
// };
const handleCashRegister = async () => {
  await cashRegisterForm.value
    .post(`/api/cash-registers`)
    .then((response) => {
      if (response.data.status == "success") {
        openingDay.value.isLoading = true;
        flash(response.data.message);
        cashRegisterForm.value.reset();
        openingDay.data = response.data.data;
      }
    })
    .catch((error) => {
      openingDay.value.isLoading = false;
    });
};

const handleSubmit = async () => {
  await store();
};

// Hooks
onMounted(async () => {
  barcodeInput.value.focus();
  // await checkDayOpening();

  document.getElementById("sidebar").classList.add("collapsed");
  await getCategories();
  await getProducts();
  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
  // registerModal = new Modal(document.getElementById(registerModalId), {
  //   keyboard: false,
  // });
  // selectedCustomer.value = {
  //   id: 2,
  //   name: "Walk-in Customer",
  // };
});
</script>

<template>
  <div>
    <form action="" method="post" @submit.prevent="handleSubmit">
      <Panel>
        <div class="row">
          <div class="col-6">
            <div class="row g-0">
              <div class="col-4">
                <category-filter
                  :data="categories"
                  :current-category-id="category_id"
                  @handleClick="getProductsByCategory"
                />
              </div>
              <div class="col-8 ps-3">
                <div class="row">
                  <div class="col">
                    <product-search v-model="search" />
                  </div>
                </div>
                <div class="row">
                  <div class="col mt-3">
                    <product-list
                      :data="products"
                      :cartProducts="form.sale_details"
                      @handleClick="handleAddToCart"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="row d-flex align-items-baseline">
              <div class="col">
                <div class="input-group mb-3">
                  <span class="input-group-text bg-primary text-light">
                    <i class="fa fa-qrcode" aria-hidden="true"></i>
                  </span>
                  <input
                    type="search"
                    ref="barcodeInput"
                    @change.enter.prevent="
                      handleBarcodeScan($event.target.value)
                    "
                    class="form-control form-control-lg"
                    placeholder="Barcode Scan"
                  />
                </div>
              </div>
              <!-- OR
          <div class="col">
            <div class="input-group mb-3">
              <span class="input-group-text bg-primary text-light">
                <i class="fa fa-keyboard-o" aria-hidden="true"></i>
              </span>
              <input
                type="search"
                class="form-control form-control-lg"
                placeholder="Manual Input"
              />
            </div>
          </div> -->
            </div>
            <div class="d-flex g-0 align-items-end mb-3">
              <div class="col">
                <FormAjaxSelect
                  ref="customerInput"
                  name="customer"
                  slug="customers"
                  label="Select Customer"
                  v-model="selectedCustomer"
                  @update:modelValue="handleSelectedCustomer"
                  @add-new-customer="showCustomerModal"
                />
              </div>

              <div class="col-auto">
                <button
                  type="button"
                  class="btn-primary btn rounded-0"
                  @click="showCustomerModal"
                >
                  <i class="fa fa-plus"></i>
                </button>
              </div>
            </div>

            <div class="table-response">
              <table class="table table-bordered">
                <thead class="bg-primary text-bg-dark">
                  <tr>
                    <th>Product</th>
                    <!-- <th>Stock</th> -->
                    <th class="w-25">Quantity</th>
                    <th>Price</th>
                    <!-- <th>Dis%</th> -->
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody v-if="form.sale_details.length">
                  <tr v-for="(item, index) in form.sale_details">
                    <td class="text-center">
                      {{ item.name }} <br /><small
                        >{{ item.stock }} Pc(s)</small
                      >
                    </td>
                    <!-- <td>{{ item.stock }}</td> -->
                    <td class="w-25">
                      <input
                        :class="`form-control pos-quantity ${
                          item.quantity > item.stock ? 'invalid' : ''
                        }`"
                        type="number"
                        min="1"
                        :max="item.stock"
                        v-model="item.quantity"
                        :id="`product-${index}-quantity`"
                      />
                      <div class="invalid-feedback">
                        Please quantity can not be greater than
                        {{ item.stock }}.
                      </div>

                      <HasError
                        :form="form"
                        :field="`sale_details.${index}.quantity`"
                      />
                    </td>
                    <td>
                      <select
                        @change="handleUpdatePrice(item)"
                        class="form-select"
                        v-model="item.original_price"
                      >
                        <option :value="item.default_selling_price">
                          {{ item.default_selling_price.toFixed(2) }}
                        </option>
                        <option :value="item.default_selling_price_old">
                          OLD - {{ item.default_selling_price_old.toFixed(2) }}
                        </option>
                      </select>
                    </td>
                    <!-- <td>{{ item.discount_rate_cash }}</td> -->
                    <td>
                      {{ (item.original_price * item.quantity).toFixed(2) }}
                      <!-- {{
                      (
                        displayDiscountedPrice(
                          item.original_price,
                          item.discount_rate_cash
                        ) * item.quantity
                      ).toFixed(2)
                    }} -->
                    </td>
                    <td>
                      <button
                        @click="handleRemoveProduct(item)"
                        type="button"
                        class="btn btn-sm btn-danger"
                      >
                        <i class="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="row justify-content-end">
              <div class="col-12">
                <div
                  class="row g-3 mb-2 justify-content-end align-items-center"
                >
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
                <div
                  class="row g-3 mb-2 justify-content-end align-items-center"
                >
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

                <div
                  class="row g-3 mb-2 justify-content-end align-items-center"
                >
                  <div class="col-auto">
                    <label for="shipping-cost" class="col-form-label fw-bold"
                      >Delivery Charges:</label
                    >
                  </div>
                  <div class="col-4">
                    <input
                      type="number"
                      min="0"
                      v-model="form.shipping_charges"
                      id="shipping-cost"
                      class="form-control text-end px-3"
                      step="0.01"
                    />
                  </div>
                </div>

                <div
                  class="row g-3 mb-2 justify-content-end align-items-center"
                >
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

                <div
                  class="row g-3 mb-2 justify-content-end align-items-center"
                >
                  <div class="col-auto">
                    <label class="form-check form-check-inline">
                      <span class="form-check-label fw-bold">
                        Is Deliverable
                      </span>
                      <input
                        @change="handleShipmentChange"
                        class="form-check-input"
                        v-model="form.is_deliverable"
                        type="checkbox"
                        value="1"
                      />
                    </label>
                    <div>
                      <!-- <label for="shipping_address" class="col-form-label fw-bold"
                    >Devilery Address:</label
                  > -->
                    </div>
                  </div>
                </div>

                <div
                  v-if="form.is_deliverable"
                  class="row g-3 mb-2 justify-content-end align-items-center"
                >
                  <!-- <div class="col-auto">
                  <label for="shipping_address" class="col-form-label fw-bold"
                    >Shipping Address:</label
                  >
                </div> -->
                  <div class="col-auto">
                    <textarea
                      :required="form.is_deliverable"
                      id="shipping_address"
                      v-model="form.shipping_address"
                      class="form-control px-3"
                      placeholder="Shipping Address"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white fixed-bottom p-3 pos-bottom-bar shadow-sm">
          <div class="container">
            <div class="row">
              <div class="col-8 d-flex">
                <h2 class="d-flex align-items-center mx-2">
                  <small>Net Total:</small>
                  <span class="fw-bold mx-2">{{ displayNetTotal }}</span>
                </h2>
                <!-- <h2 class="d-flex align-items-center mx-2">
              <small>Due:</small>
              <span class="fw-bold mx-2">{{ displayNetTotal }}</span>
            </h2> -->
              </div>
              <div class="col-4 text-end">
                <button
                  type="submit"
                  :disabled="isProcessing || !form.sale_details.length"
                  class="btn btn-primary btn-lg mx-4 fw-bold text-uppercase shadow-lg"
                >
                  {{ isProcessing ? "Saving sale.." : "Save Sale!" }}
                </button>

                <!-- <button
                type="button"
                class="btn btn-secondary btn-lg fw-bold text-uppercase shadow-lg"
              >
                Draft
              </button> -->
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </form>
  </div>
  <!-- v-if="openingDay.isLoading"
  <div v-else>
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">
          Cash Register
        </h1>
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
  </div> -->
  <!-- <VueModal
    :id="registerModalId"
    class="modal-lg"
    @onSubmit="handleRegisterClose"
  >
    <template #title>
      <h3 class="m-0 text-light fw-bold">
        Register ({{ moment().format("dddd, MMMM Do YYYY") }})
      </h3>
    </template>
    <div class="mb-3 table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Payment Method</th>
            <th>Sell</th>
            <th>Expense</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cash in Hand:</td>
            <td>20,000.00</td>
            <td>--</td>
          </tr>
          <tr>
            <td>Cash Payment:</td>
            <td>5,000.00</td>
            <td>--</td>
          </tr>
          <tr>
            <td>Card Payment:</td>
            <td>7,000.00</td>
            <td>--</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mb-3 table-responsive">
      <table class="table">
        <tbody>
          <tr class="bg-success text-light fw-bold">
            <th>Total Sales</th>
            <td>20,000.00</td>
          </tr>
          <tr class="fw-bold">
            <th>Total Return</th>
            <td class="text-danger">20,000.00</td>
          </tr>
          <tr class="fw-bold">
            <th>Total Expense</th>
            <td>20,000.00</td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <Button :form="form" class="btn btn-primary">Close Register</Button>
    </template>
  </VueModal> -->

  <VueModal :id="modalID" @onSubmit="addCustomer">
    <template #title> Add Customer </template>
    <div class="mb-3">
      <label class="form-label" for="name">Name:</label>
      <input
        v-model="customerForm.name"
        type="text"
        class="form-control"
        id="name"
      />
      <HasError :form="customerForm" field="name" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="phone">Phone:</label>
      <input
        v-model="customerForm.phone"
        type="tel"
        class="form-control"
        id="phone"
      />
      <HasError :form="customerForm" field="phone" />
    </div>

    <div class="mb-3">
      <label class="form-label" for="email">Email:</label>
      <input
        v-model="customerForm.email"
        type="email"
        class="form-control"
        id="email"
      />
      <HasError :form="form" field="email" />
    </div>

    <!-- <div class="mb-3">
      <label class="form-label" for="company">Company:</label>
      <input
        v-model="customerForm.company"
        type="text"
        class="form-control"
        id="company"
      />
      <HasError :form="customerForm" field="company" />
    </div> -->
    <template #footer>
      <Button :form="customerForm" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
<style scoped>
span.form-check-label {
  font-size: 16px;
  margin-left: 0.5em;
}
.form-check-input {
  width: 1.5em;
  height: 1.5em;
  margin-top: 0.1em;
}
.content {
  padding: 1rem 1rem 1.5rem;
}
.sidebar.js-sidebar.collapsed .pos-bottom-bar {
  margin-left: 0px;
  /* z-index: -1; */
}
nav#sidebar {
  z-index: 10000;
}
footer.footer {
  display: none;
}
.content {
  padding: 1rem 1rem 1.5rem;
}
.clickable {
  cursor: pointer;
}
</style>
