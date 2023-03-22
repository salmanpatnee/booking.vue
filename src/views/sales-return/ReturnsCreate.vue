<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Form from "vform";
// import { useToast } from "vue-toastification";
import { useFlash } from "@@/composables/useFlash";
import moment from "moment";

// Data
const route = useRoute();
const router = useRouter();
// const toast = ref(useToast());
const { flash } = useFlash();
const sale = ref({});
const isLoaded = ref(false);
const baseEndpoint = "/api/sales";

let invoiceId = ref("");

const searchInvoice = () => {
  router.push({ name: "sales.return", params: { id: invoiceId.value } });
};

const form = ref(
  new Form({
    id: "",
    sale_id: "",
    account_id: "",
    account_id: "",
    date: moment().format("YYYY-MM-DD"),
    sales_return_details: [],
  })
);

// Methods

const store = () => {
  try {
    form.value
    .post(`/api/sales-returns`)
    .then((response) => {
      if (response.data.status == "success") {
        flash(response.data.message)
        // toast.value.success();
        router.push({ name: "sales.return.index" });
      }
    })
    .catch((error) => {
      flash(error.response.data.message, "error")
    }); 
  } catch (error) {
    flash(error.response.data.message, "error")
  }
 
};

const getSale = async (id) => {


  const response = await axios.get(`${baseEndpoint}/${id}?for=sales-returns.create`);
  sale.value = response.data.data;
};

const populateForm = () => {
  form.value.sale_id = sale.value.id;
  form.value.account_id = sale.value.account_id;
  form.value.account_id = sale.value.account_id;
  const salesReturnDetails = [];
  sale.value.sale_details.forEach((saleDetail) => {
    console.log(saleDetail);
    salesReturnDetails.push({
      sale_detail_id: saleDetail.id,
      product: saleDetail.product,
      product_id: saleDetail.product_id,
      price: saleDetail.price.toFixed(2),
      quantity_return: 0,
      quantity_before_return: saleDetail.quantity,
      remaining_quantity: saleDetail.remaining_quantity,
    });
  });
  form.value.sales_return_details = salesReturnDetails;
};

const displaySubTotal = computed(() => {
  let subTotal = 0;

  form.value.sales_return_details &&
    form.value.sales_return_details.forEach((item) => {
      subTotal += parseInt(item.quantity_return) * parseFloat(item.price);
    });

  subTotal = parseFloat(subTotal).toFixed(2);
  form.value.subtotal = subTotal;
  return subTotal;
});

// Hooks
onMounted(async () => {
  if (route.params.id) {
    await getSale(route.params.id);
    populateForm();
    isLoaded.value = true;
  }
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Sale Return</h1>
      <router-link class="btn btn-primary" :to="{ name: 'sales.return.index' }">
        All Sales Return
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
              :value="sale.id"
              readonly
            />
            <HasError :form="form" field="id" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="account_id">Customer Name:</label>
            <input
              type="text"
              class="form-control"
              id="account_id"
              :value="sale.account.name"
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
              readonly
              class="form-control"
              id="date"
              v-model="form.date"
            />
            <HasError :form="form" field="date" />
          </div>
        </div>
      </div>
    </div>
  </Panel>

  <form v-if="isLoaded" @submit.prevent="store()">
    <Panel>
      <div class="table-responsive">
        <table class="table">
          <thead class="bg-primary text-light">
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Unit Price</th>
              <th>Sold Qty</th>
              <th>Remaining Qty</th>
              <th>Return Qty</th>
              <th class="text-end">Return Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(sale_return_detail, index) in form.sales_return_details"
              :key="sale_return_detail.sale_detail_id"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ sale_return_detail.product.name }}</td>
              <td>{{ sale_return_detail.price }}</td>
              <td>{{ sale_return_detail.quantity_before_return }}</td>
              <td>{{sale_return_detail.remaining_quantity}}</td>
              <td>
                <input
                  type="number"
                  required
                  class="form-control w-auto"
                  v-model="sale_return_detail.quantity_return"
                  placeholder="0"
                  :max="sale_return_detail.remaining_quantity"
                />
              </td>
              <td class="text-end">
                {{
                  sale_return_detail.quantity_return * sale_return_detail.price
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="row g-3 mb-2 justify-content-end align-items-center">
          <div class="col-auto">
            <label for="subtotal" class="col-form-label fw-bold"
              >Subtotal:</label
            >
          </div>
          <div class="col-4">
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
          <div class="col-auto">
            <label for="subtotal" class="col-form-label fw-bold"
              >Net Total:</label
            >
          </div>
          <div class="col-4">
            <input
              type="text"
              v-model="displaySubTotal"
              readonly=""
              id="subtotal"
              class="form-control text-end px-3"
            />
          </div>
        </div>

        <div class="align-items-end d-flex row mt-5">
          <div class="col text-end">
            <Button
              :disabled="form.subtotal == '0.00'"
              :form="form"
              class="btn btn-lg text-uppercase btn-primary"
              ><i class="fa fa-refresh" aria-hidden="true"></i> Return</Button
            >
          </div>
        </div>
      </template>
    </Panel>
  </form>
</template>
