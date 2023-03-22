<script setup>
import Form from "vform";
import moment from "moment";
import { computed, ref } from "vue";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";
import { useFlash } from "@@/composables/useFlash";

const { flash } = useFlash();
const selectedProduct = ref(null);

const form = ref(
  new Form({
    product_id: "",
    date: moment().format("YYYY-MM-DD"),
    name: "",
    available_quantity: null,
    physical_count: null,
    default_purchase_price: null,
    default_selling_price: null,
    // reason: null, 
    quantity_threshold: null,
    uom_of_boxes: null,
    uom_of_strips: null,
  })
);

const adjustedQuantity = computed(() => {
  if (form.value.physical_count === null) return;
  return (
    parseFloat(form.value.physical_count) -
    parseFloat(form.value.available_quantity)
  );
});

const handleProductSelect = (selectedOption) => {
  form.value.product_id = selectedOption.id;
  form.value.name = selectedOption.name;
  form.value.available_quantity = selectedOption.quantity;
  form.value.default_purchase_price = selectedOption.default_purchase_price;
  form.value.default_selling_price = selectedOption.default_selling_price;
  form.value.uom_of_boxes = selectedOption.uom_of_boxes;
  form.value.uom_of_strips = selectedOption.uom_of_strips;
  form.value.physical_count = null;
  form.value.quantity_threshold = selectedOption.quantity_threshold
};

const store = async () => {
  try {
    const { data: response } = await form.value.post(`/api/adjustment-entries`);

    if (response.status == "success") {
      flash(response.message);
      form.value.reset();
    }
  } catch (error) {
    flash(error.response.data.message, "error")
  }
};
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Stock Management</h1>
    </template>
    <div class="row mb-3">
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
    <div class="row">
      <div class="col">
        <Panel>
          <template #header>
            <h2 class="h4 mb-0 text-middle">Product Info</h2>
          </template>
          <div class="row mb-3">
            <label for="name" class="col-sm-4 col-form-label fw-bold"
              >Product Name</label
            >
            <div class="col-sm-8">
              <input
                v-model="form.name"
                type="text"
                readonly
                class="form-control form-control-lg"
                id="name"
              />
            </div>
          </div>
          <div class="row mb-3">
            <label
              for="available_quantity"
              class="col-sm-4 col-form-label fw-bold"
              >Current Stock:</label
            >
            <div class="col-sm-8">
              <input
                v-model="form.available_quantity"
                type="number"
                readonly
                class="form-control form-control-lg"
                id="available_quantity"
              />
            </div>
          </div>
         
          <!-- <div class="row mb-3">
            <label for="uom" class="col-sm-4 col-form-label fw-bold"
              >UOM of Stips:</label
            >
            <div class="col-sm-8">
              <input
                v-model="form.uom_of_strips"
                type="text"
                readonly
                class="form-control form-control-lg"
                id="uom_of_strips"
              />
            </div>
          </div> -->
        </Panel>
      </div>
      <div class="col">
        <Panel>
          <template #header>
            <h2 class="h4 mb-0 text-middle">Stock & Price Adjustment</h2>
          </template>
          <form @submit.prevent="store">
            <div class="row mb-3">
              <label
                for="available_quantity"
                class="col-sm-4 col-form-label fw-bold"
                >Current Stock:</label
              >
              <div class="col-sm-8">
                <input
                  v-model="form.available_quantity"
                  type="text"
                  readonly
                  class="form-control form-control-lg"
                  id="available_quantity"
                />
              </div>
            </div>
            <div class="row mb-3">
              <label
                for="physical_count"
                class="col-sm-4 col-form-label fw-bold"
                >Physical Count:</label
              >
              <div class="col-sm-8">
                <input
                  v-model="form.physical_count"
                  type="number"
                  class="form-control form-control-lg"
                  id="physical_count"
                />
              </div>
            </div>
            <div class="row mb-3">
            <label for="uom" class="col-sm-4 col-form-label fw-bold"
              >UOM of Box:</label
            >
            <div class="col-sm-8">
              <input
                v-model="form.uom_of_boxes"
                type="number" min="1"
                class="form-control form-control-lg"
                id="uom_of_boxes"
              />
            </div>
          </div>
            <div class="row mb-3" v-if="adjustedQuantity">
              <label
                for="physical_count"
                class="col-sm-4 col-form-label fw-bold"
                >Total Adjusted:</label
              >
              <div class="col-sm-8">
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text text-light" :class="adjustedQuantity > 0 ? 'bg-primary' : 'bg-danger'">{{adjustedQuantity > 0 ? "+" : "-"}}</span>
                  </div>
                  <input
                    type="text"
                    class="form-control"
                   v-model="adjustedQuantity"
                  />
                </div>
                <!-- <input
                  v-model="adjustedQuantity"
                  type="number"
                  readonly
                  class="form-control form-control-lg"
                  id="physical_count"
                /> -->
              </div>
            </div>
            <div class="row mb-3">
              <label for="default_purchase_price" class="col-sm-4 col-form-label fw-bold"
                >Unit Cost:</label
              >
              <div class="col-sm-8">
                <input
                  v-model="form.default_purchase_price"
                  type="number"
                  class="form-control form-control-lg"
                  id="default_purchase_price" step="0.01"
                />
              </div>
            </div>
            <div class="row mb-3">
              <label for="default_selling_price" class="col-sm-4 col-form-label fw-bold"
                >Unit Price:</label
              >
              <div class="col-sm-8">
                <input
                  v-model="form.default_selling_price"
                  type="number"
                  class="form-control form-control-lg"
                  id="default_selling_price" step="0.01"
                />
              </div>
            </div>
            <div class="row mb-3">
              <label
                for="quantity_threshold"
                class="col-sm-4 col-form-label fw-bold"
                >Alert Qty:</label
              >
              <div class="col-sm-8">
                <input
                  v-model="form.quantity_threshold"
                  type="number"
                  class="form-control form-control-lg"
                  id="quantity_threshold"
                />
              </div>
            </div>
            <!--
            <div class="row mb-3">
              <label for="reason" class="col-sm-4 col-form-label fw-bold"
                >Reason:</label
              >
              <div class="col-sm-8">
                <textarea
                  v-model="form.reason"
                  class="form-control form-control-lg"
                  id="reason"
                  placeholder="Optional"
                ></textarea>
              </div>
            </div>
            -->
            <div class="text-end">
              <button class="btn btn-lg btn-primary">
                Update Stock
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  </Panel>
</template>
