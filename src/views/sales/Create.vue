<script setup>
import { onMounted, ref, inject, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
import { useToast } from "vue-toastification";
import moment from "moment";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";

// Data
const route = useRoute();
const router = useRouter();
const toast = ref(useToast());
const customers = ref([]);
const products = ref([]);
const editMode = ref(false);
const baseEndpoint = "/api/sales";
const swal = inject("$swal");

const form = ref(
  new Form({
    id: "",
    account_id: "",
    reference_number: "",
    discount_type: "",
    discount_rate: 0,
    discount_amount: 0,
    date: moment().format("YYYY-MM-DD"),
    amount: 120,
    sale_details: [],
    quantity: [],
    unit_cost: [],
    payment_method_id: 1,
    status: "ordered",
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

  console.log('Selected Product:', product);

  const obj = {
    product_id: product.id,
    product_name: product.name,
    price: product.default_selling_price,
    quantity: 1,
    available_quantity: product.quantity,
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

const store = async () => {
  await form.value
    .post(baseEndpoint)
    .then((response) => {
      if (response.data.status == "success") {
        toast.value.success(response.data.message);
        router.push({
          name: "sales.show",
          params: { id: response.data.data.id },
        });
      }
    })
    .catch((error) => console.log(error));
};

const update = async () => {
  form.value
    .patch(`${baseEndpoint}/${form.value.id}`)
    .then((response) => {
      if (response.data.status == "success") {
        toast.value.success(response.data.message);
        router.push({
          name: "sales.show",
          params: { id: response.data.data.id },
        });
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

const calculateDiscount = () => {
  let type = form.value.discount_type;

  if (type !== "") {
    if (type === "fixed") {
      form.value.discount_amount = form.value.discount_rate;
    } else {
      form.value.discount_amount =
        (grossAmountTotal.value * form.value.discount_rate) / 100;
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

watch(
  () => grossAmountTotal.value,
  (discount_rate, prevCount) => {
    form.value.gross_amount = grossAmountTotal;
    form.value.net_amount = grossAmountTotal.value - form.value.discount_rate;
    calculateDiscount();
  }
);

const validateQuantity = (available_quantity, quantity) => {
  console.log(available_quantity, quantity);
}

// Hooks
onMounted(() => {
  getCustomers();
  if (route.params.id) {
    editMode.value = true;
    getProduct(route.params.id);
  }
});
</script>

<template>
  <form @submit.prevent="editMode ? update() : store()">
    <div class="card border-primary">
      <div class="card-header">
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h3 mb-0 text-middle">
            {{ editMode ? "Edit" : "Add" }} Sale
          </h1>
          <router-link class="btn btn-primary" :to="{ name: 'products.index' }">
            All Sale
          </router-link>
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col mb-3">
            <FormAjaxSelect name="customer" slug="customers" label="Select Customer" v-model="selectedCustomer"
              @update:modelValue="handleAjaxSelect" />

            <HasError :form="form" field="customer" />
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="reference_number">Invoice No:</label>
              <input type="text" class="form-control" v-model="form.reference_number" id="reference_number" />
              <HasError :form="form" field="reference_number" />
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date">Sale Date:</label>
              <input type="date" class="form-control" v-model="form.date" id="date" />
              <HasError :form="form" field="date" />
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="payment_method_id">Payment Method:</label>
              <select id="payment_method_id" class="form-select" v-model="form.payment_method_id">
                <option value="1">Cash</option>
                <option value="2">Bank</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer text-muted">
        <!-- <Button :form="form" class="btn btn-primary">Save</Button> -->
      </div>
    </div>

    <div class="card border-primary">
      <div class="card-header">
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h3 mb-0 text-middle">Products</h1>
        </div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col mb-3">
            <FormAjaxSelect name="product" label="Select Product" slug="products" v-model="selectedProduct"
              @update:modelValue="handleProductSelect" />

            <!-- <v-select
              @search="getProducts"
              @input="selectProduct"
              :options="products"
              label="name"
            >
            </v-select> -->
          </div>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead class="bg-primary text-light">
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Amount</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(saleDetail, i) in form.sale_details">
                <td>{{ i + 1 }}</td>
                <td>{{ saleDetail.product_name }}</td>
                <td>
                  <input type="number" class="form-control w-auto" v-model="saleDetail.price" step=".01" />
                </td>
                <td>
                  <input type="number" @input="validateQuantity(saleDetail.available_quantity, $event)"
                    class="form-control w-auto error" v-model="saleDetail.quantity"
                    :max="saleDetail.available_quantity" />
                  <small>Only {{saleDetail.available_quantity}} Pc(s) available</small>
                </td>
                <td>
                  {{
                  saleDetail.price * saleDetail.quantity
                  ? saleDetail.price * saleDetail.quantity
                  : 0
                  }}
                </td>
                <td class="text-center">
                  <button type="button" class="btn btn-sm btn-danger"
                    @click="handleRemoveItem($event, saleDetail.product_id)">
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer text-muted"></div>
    </div>

    <div class="card border-primary">
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
              <select @change="calculateDiscount" class="form-select" v-model="form.discount_type" id="discount_type">
                <option value="">None</option>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
              <HasError :form="form" field="discount_type" />
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="discount_rate">Discount Amount:</label>
              <input type="number" class="form-control" v-model="form.discount_rate" id="discount_rate" step=".01" />
              <HasError :form="form" field="discount_rate" />
            </div>
          </div>
          <div class="align-items-center col d-flex justify-content-end text-end">
            <label> <b>Discount:</b>(-) {{ form.discount_amount }} </label>
          </div>
        </div>
      </div>
      <div class="card-footer text-muted">
        <!-- <Button :form="form" class="btn btn-primary">Save</Button> -->
      </div>
    </div>

    <Panel>
      <div class="row mt-4">
        <div class="col-4"></div>
        <div class="col-4"></div>
        <div class="col-4">
          <div class="mb-3 d-flex justify-content-between mb-3 border-bottom pb-2">
            <label class="form-label me-2" for="date">Total</label>
            <b>{{ grossAmountTotal }}</b>
          </div>

          <div v-if="form.discount_amount" class="border-bottom d-flex justify-content-between mb-3 pb-2">
            <label class="form-label me-2" for="date">Discount</label>
            <b>(-) {{ form.discount_amount }}</b>
          </div>
          <div v-if="netAmount" class="mb-3 d-flex justify-content-between mb-3 border-bottom pb-2">
            <label class="form-label me-2" for="date">Net Total</label>
            <b>{{ netAmount }}</b>
          </div>

          <!-- <div class="mb-3 d-flex justify-content-between mb-3 border-bottom pb-2">
            <label class="form-label  me-2" for="date">Paid</label>
            <b class="text-success" v-text="form.paid_amount"></b>
          </div> -->

          <!-- <div class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date">Due</label>
                        <b class="text-danger">{{dueAmount}}</b>
                    </div> -->
        </div>
      </div>
    </Panel>

    <div class="card border-primary">
      <div class="card-footer text-muted text-end">
        <Button :form="form" class="btn btn-primary">Save</Button>
      </div>
    </div>
  </form>
</template>
