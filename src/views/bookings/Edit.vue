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

const route = useRoute();
const router = useRouter();
const toast = ref(useToast());
const customers = ref({
  isLoading: false,
  data: [],
});
const employees = ref({
  isLoading: false,
  data: [],
});
const products = ref([]);
const baseEndpoint = "/api/sales";
const swal = inject("$swal");
const barcodeInput = ref(null);
const productBarcodeInput = ref(null);

let discountRateKey = "discount_rate_cash";
let modal = null;
let modalID = "customersModal";
let shouldSubmit = true;
const bankAccounts = ref([]);

// const isRegisterOpen = computed(() => {
//   return authStore.user.cash_registers.length;
// });

const getEmployees = async (page = 1) => {
  // const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const params = `?for=sales.create`;
  employees.value.loading = true;
  const { data: response } = await axios.get(`/api/employees`);
  employees.value.data = response.data;
  employees.value.loading = false;
};

const getBooking = async () => {
  sale.value.isLoading = true;
  const { id } = route.params;
  const { data: response } = await http.get(`/api/bookings/${id}`);
  sale.value.data = response.data;
  form.value.fill(response.data);
  form.value.employee_id = response.data.employee.id;
  form.value.status = response.data.status;
  //   console.log({ response });

  sale.value.isLoading = false;
};

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

const form = ref(
  new Form({
    id: "",
    account_id: "",
    employee_id: "",
    date: moment().format("YYYY-MM-DD"),
    device_name: null,
    model_no: null,
    imei: null,
    charges: null,
    issue: null,
    // status: "inprogress",
  })
);

const selectedProduct = ref(null);
const selectedCustomer = ref(null);

const customerForm = ref(
  new Form({
    id: "",
    name: "",
    email: "",
    phone: "",
    trader: "",
    balance: 0.0,
    account_type: "customer",
    for: "pos",
  })
);

// Methods

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

const handleSubmit = async () => {
  try {
    const { data: response } = await form.value.post(`/api/bookings`);

    if (response.status == "success") {
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
              name: "bookings.proceed.invoice",
              params: { id: response.data.id },
            });
            window.open(routeData.href, "_blank");
          }
        });
    }
  } catch (error) {
    console.log(error);
  }
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

const validateQty = (input, stock) => {
  if (input.value > stock) {
    input.value = stock;
  }
};

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

const handleProductScan = (barcode) => {
  shouldSubmit = false;
  if (barcode.length) {
    searchProductsWithBarcode(barcode);
    productBarcodeInput.value.value = "";
  }
};

const handleSelectedCustomer = () => {
  form.value.account_id = selectedCustomer.value.id;
};

const showCustomerModal = () => {
  customerForm.value.reset();
  modal.show();
};

// Hooks
onMounted(async () => {
  await getEmployees();
  await getBooking();

  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <div v-if="!sale.isLoading">
    <form @submit.prevent="handleSubmit">
      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">
            Booking ID: ({{ sale.data.booking_id }})
          </h1>
        </template>
        <div class="row">
          <div class="col">
            <p><b>Customer:</b> {{ sale.data.account.name }}</p>
          </div>
          <div class="col">
            <p><b>Date Receive:</b> <AppDate :timestamp="sale.data.date" /></p>
          </div>
          <div class="col">
            <p>
              <b>Status:</b>
              <span class="badge bg-info">{{ sale.data.status }}</span>
            </p>
          </div>
        </div>

        <div class="mt-3">
          <h3>Issue Description</h3>
          <div class="row mt-4">
            <div class="col">
              <div class="mb-3">
                <label class="form-label" for="device_name"
                  ><b>Device Name:</b></label
                >
                <input
                  type="text"
                  class="form-control"
                  v-model="form.device_name"
                  id="device_name"
                  placeholder="Samsung"
                  required
                />
                <HasError :form="form" field="device_name" />
              </div>
            </div>
            <div class="col">
              <div class="mb-3">
                <label class="form-label" for="model_no"
                  ><b>Model No:</b></label
                >
                <input
                  type="text"
                  class="form-control"
                  v-model="form.model_no"
                  id="model_no"
                  placeholder="A32"
                  required
                />
                <HasError :form="form" field="model_no" />
              </div>
            </div>
            <div class="col">
              <div class="mb-3">
                <label class="form-label" for="imei"><b>IMEI:</b></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.imei"
                  id="imei"
                  placeholder="789654123963"
                  required
                  maxlength="15"
                />
                <HasError :form="form" field="imei" />
              </div>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-4">
              <label class="form-label" for="charges"><b>Charges:</b></label>
              <input
                type="number"
                class="form-control"
                v-model="form.charges"
                placeholder="500"
                id="charges"
                required
              />
              <HasError :form="form" field="charges" />
            </div>
            <div class="col-4">
              <label class="form-label" for="charges"
                ><b>Employee / Technician:</b></label
              >
              <select class="form-control" v-model="form.employee_id" required>
                <option value="">--Select--</option>
                <option
                  :value="employee.id"
                  v-for="employee in employees.data"
                  :key="employee.id"
                >
                  {{ employee.name }}
                </option>
              </select>
              <HasError :form="form" field="employee_id" />
            </div>
            <div class="col-4">
                <label class="form-label" for="status"
                  ><b>Status:</b></label
                >
              <select
                class="form-control"
                v-model="form.status" id="status"
              >
                <option value="">--Filter by Status--</option>
                <option value="in progress">In Progress</option>
                <option value="repaired">Repaired</option>
                <option value="complete">Complete</option>
                <option value="can not be repaired">Can't Repaired</option>
                <option value="customer collected CBR"
                  >Customer Collected CBR</option
                >
                <option value="customer collected payment pending">
                  Payment Pending
                </option>
                <option value="shop property">Shop Property</option>
                <option value="awaiting customer response"
                  >Awaiting Response</option
                >
                <option value="awaiting parts">Awaiting Parts</option>
              </select>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-8">
            <label class="form-label" for="imei"><b>Issue:</b></label>
            <textarea
              v-model="form.issue"
              id="issue"
              class="form-control w-100"
              placeholder="Display panel"
              required
            ></textarea>

            <HasError :form="form" field="issue" />
          </div>
        </div>
        <template #footer>
          <div class="text-end">
            <Button :form="form" class="btn btn-lg btn-primary">Save</Button>
          </div>
        </template>
      </Panel>
    </form>
  </div>
  <div class="text-center" v-else>
    <h2>Loading..</h2>
  </div>

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

    <div class="mb-3">
      <label class="form-label" for="trader">Trader:</label>
      <input
        v-model="customerForm.trader"
        type="text"
        class="form-control"
        id="trader"
      />
      <HasError :form="customerForm" field="trader" />
    </div>
    <template #footer>
      <Button :form="customerForm" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
