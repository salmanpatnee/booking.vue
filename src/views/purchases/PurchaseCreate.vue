<script setup>
import Form from "vform";
import moment from "moment";
import { useFlash } from "@@/composables/useFlash";
import { onMounted, ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";
import supplierService from "@@/services/SupplierService.js";
import purchaseService from "@@/services/PurchaseService.js";
import purchaseOrderService from "@@/services/PurchaseOrderService.js";

// Data
const route = useRoute();
const router = useRouter();
let editMode = ref(false);
const isLoaded = ref(false);
const { flash } = useFlash();
const suppliers = ref([]);
const selectedSupplier = ref(null);
const selectedProduct = ref(null);

const form = ref(
  new Form({
    id: "",
    account_id: 1,
    payment_method_id: 2,
    reference_number: "",
    discount_type: "",
    discount_rate: 0,
    discount_amount: 0,
    tax_amount: 0,
    date: moment().format("YYYY-MM-DD"),
    amount: null,
    purchase_details: [],
    quantity: [],
    unit_cost: [],
    status: "ordered",
    payment_status: "",
    net_amount: 0.0,
    gross_amount: 0.0,
    paid_amount: 0.0,
    created_by: 1,
    box_qty: null,
  })
);

// Methods

const handleAmountChange = (index) => {
  const purchaseDetail = form.value.purchase_details[index];

  setUnitCost(index, purchaseDetail.amount, purchaseDetail.quantity);
};

const handleChange = (index, $event) => {
  const item = form.value.purchase_details[index];

  // let quantity = 0;

  // if (item.units_in_box && item.quantity_boxes)
  //   quantity += item.units_in_box * item.quantity_boxes;
  // if (item.units_in_strip && item.quantity_strips)
  //   quantity += item.units_in_strip * item.quantity_strips;
  // if (item.quantity_units) quantity += item.quantity_units;

  // form.value.purchase_details[index].quantity = quantity;

  /* set price */
  setUnitCost(index, item.amount, $event.target.value);
};

const handleProductSelect = (selectedOption) => {
  selectedProduct.value = selectedOption;

  const product = selectedOption;
  /* Check whether product already selected */
  const productExist = form.value.purchase_details.findIndex((sD) => {
    return sD.product_id === product.id;
  });

  if (productExist !== -1) {
    alert("This product is already selected");
    setTimeout(() => {
      selectedProduct.value = null;
    }, 300);
    return;
  }

  console.log(product);

  const obj = {
    product_id: product.id,
    product_name: product.name,
    price: product.default_purchase_price,
    default_selling_price: product.default_selling_price,
    // default_box_sale_price: product.default_box_sale_price,
    // quantity: 1,
    stock: product.quantity,
    // expiry_date: moment().add(1, "M").format("YYYY-MM-DD"),
    units_in_box: product.uom_of_boxes,
    units_in_strip: product.uom_of_strips,
    quantity_boxes: null,
    quantity_strips: null,
    quantity_units: null,
    units_in_box: null,
    units_in_strip: null,
    quantity: 0,
  };

  form.value.purchase_details.push(obj);
  setTimeout(() => {
    selectedProduct.value = null;
  }, 300);
};

const handleBoxSalePriceChange = (index) => {
  if (form.value.purchase_details[index].sale_price != "") {
    form.value.purchase_details[index].total_sale_price =
      form.value.purchase_details[index].sale_price *
      form.value.purchase_details[index].quantity;
    form.value.purchaseDetails[index].units_in_box =
      form.value.purchase_details[index].quantity;
    form.value.purchase_details[index].box_sale_price =
      form.value.purchase_details[index].sale_price /
      form.value.purchase_details[index].quantity;
  }
};

const handleRemoveItem = ($event, productId) => {
  const purchaseDetails = form.value["purchase_details"].filter(
    (pD) => pD.product_id !== productId
  );
  form.value["purchase_details"] = purchaseDetails;
};

const handleTotalPriceChange = (index) => {
  if (form.value.purchase_details[index].total_sale_price != "") {
    form.value.purchase_details[index].sale_price =
      form.value.purchase_details[index].total_sale_price /
      form.value.purchase_details[index].quantity;
  }
};

const setUnitCost = (index, amount, quantity) => {
  if (amount && quantity)
    form.value.purchase_details[index].price = amount / quantity;
};

const store = async () => {
  try {
    const { data: response } = await form.value.post(
      purchaseService.apiEndpoint
    );

    if (response.status == "success") {
      flash(response.message);
      router.push({ name: "purchases.index" });
    }
  } catch (error) {
    flash(error.response.data.message, "error");
    console.log(error);
  }
};

const update = async () => {
  try {
    const { data: response } = await form.value.patch(
      `${purchaseService.apiEndpoint}/${form.value.id}`
    );

    if (response.status == "success") {
      flash(response.message);
      router.push({ name: "purchases.index" });
    }
  } catch (error) {
    console.log(error);
  }
};

const grossAmount = computed(() => {
  return form.value.purchase_details.map((purchase_detail) => {
    return purchase_detail.amount;
  });
});

const grossAmountTotal = computed(() => {
  return grossAmount.value.reduce((a, b) => a + b, 0);
});

const netAmount = computed(
  () =>
    grossAmountTotal.value - form.value.discount_amount + form.value.tax_amount
);

const dueAmount = computed(() => netAmount.value - form.value.paid_amount);

// const calculateDiscount = () => {
//   let type = form.value.discount_type;

//   if (type !== "") {
//     if (type === "fixed") {
//       form.value.discount_amount = form.value.discount_rate;
//     } else {
//       form.value.discount_amount =
//         (grossAmountTotal.value * form.value.discount_rate) / 100;
//     }
//   } else {
//     form.value.discount_rate = form.value.discount_amount = 0;
//   }
// };

// watch(
//   () => form.value.discount_rate,
//   (discount_rate, prevCount) => {
//     calculateDiscount();
//   }
// );

watch(
  () => grossAmountTotal.value,
  (discount_rate, prevCount) => {
    form.value.gross_amount = grossAmountTotal;
    form.value.net_amount =
      grossAmountTotal.value - form.value.discount_rate + form.value.tax_amount;
    // calculateDiscount();
  }
);

const handleFullPaid = () => (form.value.paid_amount = netAmount.value);

const displayQty = computed(() => {
  return form.value.purchase_details.map((item) => {
    return (
      item.units_in_box * item.quantity_boxes +
      item.units_in_strip * item.quantity_strips +
      item.quantity_units
    );
  });
});
const displayUnitCost = (amount, qty) => {
  return amount > 0 && qty > 0 ? (amount / qty).toFixed(2) : 0;
};
</script>

<template>
  <form @submit.prevent="editMode ? update() : store()">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">
          {{ editMode ? "Edit" : "Add" }} Purchase
        </h1>
        <router-link class="btn btn-primary" :to="{ name: 'purchases.index' }">
          All Purchase
        </router-link>
      </template>
      <div class="row">
        <!-- <div class="col mb-3">
          <FormAjaxSelect
            name="supplier"
            slug="suppliers"
            label="Select Supplier"
            v-model="selectedSupplier"
            @update:modelValue="handleAjaxSelect"
          />
          <HasError :form="form" field="account_id" />
        </div> -->
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="reference_number"
              ><b>Invoice No:</b></label
            >
            <input
              type="text"
              class="form-control"
              v-model="form.reference_number"
              id="reference_number"
              required
            />
            <HasError :form="form" field="reference_number" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="date"><b>Purchase Date:</b></label>
            <input
              type="date"
              class="form-control"
              v-model="form.date"
              id="date"
            />
            <HasError :form="form" field="date" />
          </div>
        </div>
        <!-- <div class="col">
          <div class="mb-3">
            <label class="form-label" for="status"
              ><b>Purchase Status:</b></label
            >
            <select id="status" v-model="form.status" class="form-select">
              <option value="draft">Draft</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div> -->
      </div>
    </Panel>

    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Products</h1>
      </template>
      <div class="row">
        <div class="col mb-3">
          <FormAjaxSelect
            name="product"
            label="Select Product"
            slug="products"
            forRoute="purchases.create"
            v-model="selectedProduct"
            @update:modelValue="handleProductSelect"
          />
          <HasError :form="form" field="purchase_details" />
        </div>
      </div>

      <div class="table-responsive">
        <table
          class="card-1 mb-0 table table-bordered table-hover table-striped"
        >
          <thead class="bg-primary text-light">
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Total Cost</th>
              <!-- <th>Qty</th> -->
              <th>Total Qty</th>
              <th>Unit Cost</th>
              <th>Retai Price</th>
              <!-- <th>Profit %</th>
              <th>Expiry Date</th> -->
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(purchaseDetail, i) in form.purchase_details">
              <td>{{ i + 1 }}</td>
              <td class="text-center">
                {{ purchaseDetail.product_name }}
                <small>Current stock: {{ purchaseDetail.stock }} Pc(s)</small>
              </td>
              <td>
                <input
                  type="number"
                  class="form-control"
                  v-model="purchaseDetail.amount"
                  step=".01"
                  min="0"
                  ref="amount"
                  @input="handleAmountChange(i)"
                  required
                />
                <HasError
                  :form="form"
                  :field="`purchase_details.${i}.amount`"
                />
              </td>
              <!-- <td>
                <div class="d-flex align-items-center mb-1">
                  <label class="form-label mb-0 me-1"
                    ><b>Box&nbsp;&nbsp;</b></label
                  >
                  <div class="col p-1">
                    <input
                      type="number"
                      min="1"
                      v-model="purchaseDetail.quantity_boxes"
                      class="form-control"
                      @input="handleChange(i, $event)"
                    />
                  </div>
                  <div class="col p-1">
                    <input
                      class="form-control"
                      readonly
                      v-model="purchaseDetail.units_in_box"
                      type="number"
                    />
                  </div>
                </div>

                <div class="d-flex align-items-center mb-1">
                  <label class="form-label mb-0 me-1"><b>Strip</b></label>
                  <div class="col p-1">
                    <input
                      v-model="purchaseDetail.quantity_strips"
                      type="number"
                      min="1"
                      class="form-control"
                      @input="handleChange(i, $event)"
                    />
                  </div>
                  <div class="col p-1">
                    <input
                      class="form-control"
                      readonly
                      v-model="purchaseDetail.units_in_strip"
                      type="number"
                    />
                  </div>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <label class="form-label mb-0 me-1"
                    ><b>Pc&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b></label
                  >
                  <div class="col p-1">
                    <input
                      v-model="purchaseDetail.quantity_units"
                      type="number"
                      min="1"
                      class="form-control"
                      @input="handleChange(i, $event)"
                    />
                  </div>
                  <div class="col p-1">
                    <input
                      class="form-control"
                      readonly
                      value="1"
                      type="number"
                      placeholder="Price"
                      step=".01"
                    />
                  </div>
                </div>
              </td> -->
              <td>
                <input
                  :id="`purchase-details-${i}-quantity`"
                  type="number"
                  @input="handleChange(i, $event)"
                  class="form-control"
                  v-model="purchaseDetail.quantity"
                  min="1"
                />
                <!-- v-model="displayQty[i]" -->
              </td>
              <td>
                <!-- {{ displayUnitCost(purchaseDetail.amount, displayQty[i]) }} -->
                {{
                  purchaseDetail.price
                    ? parseFloat(purchaseDetail.price).toFixed(2)
                    : null
                }}
              </td>

              <td class="text-center">
                <input
                  :id="`purchase-details-${i}-sale_price`"
                  type="number"
                  class="form-control"
                  v-model="purchaseDetail.sale_price"
                  @input="handleBoxSalePriceChange(i)"
                  :min="purchaseDetail.price.toFixed(2)"
                  step="any"
                />

                <!-- <div class="d-flex flex-column gap-2">
                  <div class="d-flex gap-2 align-items-center">
                    <label class="form-label mb-0">Box</label>
                    <input
                      v-model="purchaseDetail.box_sale_price"
                      type="number"
                      class="form-control"
                      step=".01"
                      required
                      :placeholder="purchaseDetail.default_box_sale_price"
                      :min="
                        purchaseDetail.amount && purchaseDetail.quantity_boxes
                          ? (
                              purchaseDetail.amount /
                              purchaseDetail.quantity_boxes
                            ).toFixed(2)
                          : null
                      "
                      @input="handleBoxSalePriceChange(i)"
                    />
                  </div>

                  <div class="d-flex flex-column">
                    <div class="d-flex gap-2 align-items-center">
                      <label class="form-label mb-0">Unit</label>
                      <input
                        v-model="purchaseDetail.sale_price"
                        type="number"
                        class="form-control"
                        readonly
                        step=".01"
                        required
                        :min="
                          purchaseDetail.price
                            ? purchaseDetail.price.toFixed(2)
                            : null
                        "
                      />
                    </div>
                    <small
                      >Previous Unit Price:
                      {{ purchaseDetail.default_selling_price }}</small
                    >
                    <HasError
                      :form="form"
                      :field="`purchase_details.${i}.sale_price`"
                    />
                  </div>
                  <div class="d-flex gap-2 align-items-center">
                    <label class="form-label mb-0">Total</label>
                    <input
                      v-model="purchaseDetail.total_sale_price"
                      type="number"
                      class="form-control"
                      step=".01"
                      required
                      :min="purchaseDetail.amount"
                      @input="handleTotalPriceChange(i)"
                      readonly="true"
                    />
                  </div>
                </div> -->
              </td>

              <!-- <td>
                {{
                  (
                    ((purchaseDetail.sale_price -
                      displayUnitCost(purchaseDetail.amount, displayQty[i])) /
                      purchaseDetail.sale_price) *
                    100
                  ).toFixed(2)
                }}
              </td>
              <td>
                <input
                  type="date"
                  class="form-control"
                  v-model="purchaseDetail.expiry_date"
                  :min="moment().add(1, 'M').format('YYYY-MM-DD')"
                />
              </td> -->
              <td class="text-center">
                <button
                  type="button"
                  class="btn btn-sm btn-danger"
                  @click="handleRemoveItem($event, purchaseDetail.product_id)"
                >
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>

    <!-- <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Discount</h1>
      </template>
      <div class="row">
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="discount_type"
              ><b>Discount Type:</b></label
            >
            <select
              @change="calculateDiscount"
              class="form-select"
              v-model="form.discount_type"
              id="discount_type"
            >
              <option value="">None</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
            <HasError :form="form" field="discount_type" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="discount_rate"
              ><b>Discount Rate:</b></label
            >
            <input
              type="number"
              class="form-control"
              v-model="form.discount_rate"
              id="discount_rate"
              step=".01"
              min="0"
            />
            <HasError :form="form" field="discount_rate" />
          </div>
        </div>
        <div class="align-items-center col d-flex justify-content-end text-end">
          <label> <b>Discount:</b>(-) {{ form.discount_amount }} </label>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="tax_amount"
              ><b>Tax Amount:</b></label
            >
            <input
              type="number"
              class="form-control"
              v-model="form.tax_amount"
              id="tax_amount"
              step=".01"
              min="0"
            />
            <HasError :form="form" field="tax_amount" />
          </div>
        </div>
        <div class="col"></div>
        <div class="align-items-center col d-flex justify-content-end text-end">
          <label> <b>Tax:</b>(+) {{ form.tax_amount }} </label>
        </div>
      </div>
    </Panel> -->

    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Add Payment</h1>
      </template>
      <div class="row">
        <div class="col">
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <label class="form-label" for="amount_paid"><b>Amount:</b></label>
              <input
                type="number"
                class="form-control form-control-lg"
                id="amount_paid"
                v-model="form.paid_amount"
                step="any"
                min="0"
                :max="netAmount"
              />
            </div>
            <div class="col-auto mt-5">
              <button
                @click.prevent="handleFullPaid"
                :disabled="!netAmount"
                class="btn btn-primary btn-lg"
              >
                Full Paid
              </button>
            </div>
          </div>
        </div>
        <div class="col"></div>
        <!-- <div class="col">
          <div class="mb-3">
            <label class="form-label" for="payment_method_id"
              ><b>Payment Method:</b></label
            >
            <select id="payment_method_id" class="form-select">
              <option value="1">Cash</option>
              <option value="2">Bank</option>
            </select>
          </div>
        </div> -->
      </div>
      <div class="row mt-4">
        <div class="col-4"></div>
        <div class="col-4"></div>
        <div class="col-4">
          <div
            class="mb-3 d-flex justify-content-between mb-3 border-bottom pb-2"
          >
            <label class="form-label me-2" for="date"><b>Total</b></label>
            <b>{{ grossAmountTotal.toFixed(2) }}</b>
          </div>

          <div
            v-if="form.discount_amount"
            class="border-bottom d-flex justify-content-between mb-3 pb-2"
          >
            <label class="form-label me-2" for="date"><b>Discount</b></label>
            <b>(-) {{ form.discount_amount }}</b>
          </div>
          <div
            v-if="form.tax_amount"
            class="border-bottom d-flex justify-content-between mb-3 pb-2"
          >
            <label class="form-label me-2" for="date"><b>Tax</b></label>
            <b>(+) {{ form.tax_amount }}</b>
          </div>
          <div
            v-if="netAmount"
            class="mb-3 d-flex justify-content-between mb-3 border-bottom pb-2"
          >
            <label class="form-label me-2" for="date"><b>Net Total</b></label>
            <b>{{ netAmount.toFixed(2) }}</b>
          </div>

          <div
            class="mb-3 d-flex justify-content-between mb-3 border-bottom pb-2"
          >
            <label class="form-label me-2" for="date"><b>Paid</b></label>
            <b class="text-success" v-text="form.paid_amount.toFixed(2)"></b>
          </div>

          <div class="mb-3 d-flex justify-content-between mb-3">
            <label class="form-label me-2" for="date"><b>Due</b></label>
            <b class="text-danger">{{ dueAmount.toFixed(2) }}</b>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="text-end">
          <Button :form="form" class="btn btn-lg btn-primary">Save</Button>
        </div>
      </template>
    </Panel>
  </form>
</template>
<style scoped>
.readonly {
  pointer-events: none;
}
</style>
