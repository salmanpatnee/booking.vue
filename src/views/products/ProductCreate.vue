<script setup>
import Form from "vform";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { useFlash } from "@@/composables/useFlash";
import categoryService from "@@/services/CategoryService";
import brandService from "@@/services/BrandService";
import productService from "@@/services/ProductService";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";


// Data
const categories = ref([]);
const brands = ref([]);
const route = useRoute();
const router = useRouter();
const editMode = ref(false);
const { flash } = useFlash();
const isLoading = ref(true);
let shouldSubmit = true;
const selectedCategory = ref(null);
const selectedBrand = ref(null);

const form = ref(
  new Form({
    id: "",
    name: "",
    category_id: "",
    brand_id: "",
    barcode: "",
    description: "",
    // vat_amount: 0,
    quantity_threshold: 0,
    default_purchase_price: 0,
    default_selling_price: 0,
    uom_of_boxes: null,
    uom_of_strips: null, 
    discount_rate_cash: 10, 
    discount_rate_card: 7, 
    discount_rate_shipment: 5,
    is_active: true,
  })
);

// Methods

const handleCategorySelect = () => {
  form.value.category_id = selectedCategory.value.id;
};
const handleBrandSelect = () => {
  form.value.brand_id = selectedBrand.value.id;
};

const getCategories = async () => {
  const { data: response } = await categoryService.getCategories();
  categories.value = response.data;
};

const getBrands = async () => {
  const { data: response } = await brandService.getBrands();
  brands.value = response.data;
};

const getProduct = async (id) => {
  isLoading.value = true;
  const { data: response } = await productService.getProduct(id);
  form.value.fill(response.data);
  form.value.default_purchase_price = response.data.default_purchase_price.toFixed(2)
  form.value.default_selling_price = response.data.default_selling_price.toFixed(2)
  form.value.is_active = form.value.is_active ? true : false;
  isLoading.value = false;
};

const handleBarcodeScan = ($event) => {
  if(document.getElementById("product-form").checkValidity()) {
    shouldSubmit = false;
  }
};

const handleSubmit = () => {
  if (!shouldSubmit) {
    shouldSubmit = true;
    return;
  }
  editMode.value ? update() : store();
};

const store = async () => {
  try {
    const { data: response } = await form.value.post(
      productService.apiEndpoint
    );
    if (response.status == "success") {
      flash(response.message);
      router.push({ name: "products.index" });
    }
  } catch (error) {
    console.log(error);
  }
};

const update = async () => {
  try {
    const { data: response } = await form.value.patch(
      `${productService.apiEndpoint}/${form.value.id}`
    );
    if (response.status == "success") {
      flash(response.message);
      router.push({ name: "products.index" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Hooks
onMounted(() => {
  getCategories();
  getBrands();

  const { id } = route.params;

  if (id) {
    editMode.value = true;
    getProduct(id);
  } else {
    isLoading.value = false;
  }
});
</script>

<template>
  <form id="product-form" @submit.prevent="handleSubmit">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">
          {{ editMode ? "Edit" : "Add" }} Product
        </h1>
        <router-link class="btn btn-primary" :to="{ name: 'products.index' }">
          All Products
        </router-link>
      </template>
      <div v-if="!isLoading">
        <div class="row">
        <div class="col mb-4">
          <label class="form-label" for="barcode">Barcode:</label>
          <input
            v-model="form.barcode"
            type="text"
            class="form-control form-control-lg"
            id="barcode"
            required=""
            @change="handleBarcodeScan" autofocus
          />
          <HasError :form="form" field="barcode" />
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label class="form-label" for="name">Name:</label>
          <input
            v-model="form.name" name=""
            type="text"
            class="form-control form-control-lg"
            id="name" required
          />
          <HasError :form="form" field="name" />
        </div>
        <div class="col mb-3">
          <label class="form-label" for="quantity_threshold"
            >Alert Quantity:</label
          >
          <input
            v-model="form.quantity_threshold"
            type="number" min="0"
            class="form-control form-control-lg"
            id="quantity_threshold"
          />
          <HasError :form="form" field="quantity_threshold" />
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <FormAjaxSelect
            name="category" 
            slug="categories"
            label="Select Category"
            v-model="selectedCategory"
            @update:modelValue="handleCategorySelect"
          />
          <!-- <label class="form-label" for="category_id">Category:</label>
          <select required
            class="form-select form-select-lg"
            v-model="form.category_id"
            id="category_id"
          >
            <option value="">Select Category</option>
            <option
              v-for="category in categories"
              :value="category.id"
              v-text="category.name"
              :key="category.id"
            ></option>
          </select> -->
          <HasError :form="form" field="category_id" />
        </div>
        <div class="col mb-3">
          <FormAjaxSelect
            name="brand" 
            slug="brands"
            label="Select Brand"
            v-model="selectedBrand"
            @update:modelValue="handleBrandSelect"
          />
          <!-- <label class="form-label" for="brand_id">Brand:</label>
          <select
            class="form-select form-select-lg"
            v-model="form.brand_id"
            id="brand_id"
          >
            <option value="">Select Brand</option>
            <option
              v-for="brand in brands.data"
              :value="brand.id"
              v-text="brand.name"
              :key="brand.id"
            ></option>
          </select> -->
          <HasError :form="form" field="brand_id" />
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label class="form-label" for="uom_of_boxes">UOM of Box:</label>
          <input
            v-model="form.uom_of_boxes"
            type="number" min="1"
            class="form-control form-control-lg"
            id="uom_of_boxes"
          />
          <HasError :form="form" field="uom_of_boxes" />
        </div>
        <div class="col mb-3">
          <label class="form-label" for="uom_of_strips">UOM of Strip:</label>
          <input
            v-model="form.uom_of_strips"
            type="number"
            class="form-control form-control-lg"
            id="uom_of_strips" min="1"
          />
          <HasError :form="form" field="uom_of_strips" />
        </div>
      </div>
      <div class="row">
        <div class="col mb-3">
          <label class="form-label" for="default_purchase_price"
            >Default Purchase Price:</label
          >
          <input
            v-model="form.default_purchase_price"
            type="number"
            class="form-control form-control-lg"
            id="default_purchase_price" min="0"
            step=".01"
          />
          <HasError :form="form" field="default_purchase_price" />
        </div>
        <div class="col mb-3">
          <label class="form-label" for="default_selling_price"
            >Default Selling Price:</label
          >
          <input
            v-model="form.default_selling_price"
            type="number" :min="form.default_purchase_price"
            class="form-control form-control-lg"
            id="default_selling_price"
            step=".01"
          />
          <HasError :form="form" field="default_selling_price" />
        </div>
        <!-- <div class="col mb-3">
          <label class="form-label" for="vat_amount">VAT:</label>
          <input
            v-model="form.vat_amount"
            type="number"
            class="form-control form-control-lg"
            id="vat_amount"
          />
          <HasError :form="form" field="vat_amount" />
        </div> -->
      </div>

      <div class="row">
        <div class="col mb-3">
          <label class="form-label" for="discount_rate_cash"
            >Cash Discount Rate:</label
          >
          <input
            v-model="form.discount_rate_cash"
            type="number"
            class="form-control form-control-lg"
            id="discount_rate_cash" min="0"
            step=".01"
          />
          <HasError :form="form" field="discount_rate_cash" />
        </div>
        <div class="col mb-3">
          <label class="form-label" for="discount_rate_card"
            >Card Discount Rate:</label
          >
          <input
            v-model="form.discount_rate_card"
            type="number" 
            class="form-control form-control-lg"
            id="discount_rate_card"
            step=".01"
          />
          <HasError :form="form" field="discount_rate_card" />
        </div>
        <div class="col mb-3">
          <label class="form-label" for="discount_rate_shipment">Delivery Discount Rate:</label>
          <input
            v-model="form.discount_rate_shipment"
            type="number"
            class="form-control form-control-lg"
            id="discount_rate_shipment"
          />
          <HasError :form="form" field="discount_rate_shipment" />
        </div>
      </div>


      <div class="align-items-center d-flex row">
        <div class="col-8 mb-3">
          <label class="form-label" for="description">Description:</label>
          <textarea
            v-model="form.description"
            class="form-control form-control-lg"
            id="description"
          ></textarea>
          <HasError :form="form" field="description" />
        </div>
        <div class="col mb-3">
          <label class="form-check">
            <input
              v-model="form.is_active"
              class="form-check-input"
              type="checkbox"
              value=""
            />
            <span class="form-check-label"> Active </span>
          </label>
        </div>
      </div>
      </div>
      <div v-else class="text-center">
        <h4>Loading...</h4>
      </div>
     
      <template #footer v-if="!isLoading">
        <div class="text-end">
          <Button :form="form" class="btn btn-lg btn-primary">
            {{ editMode ? "Update Product" : "Add Product" }}
          </Button>
        </div>
      </template>
    </Panel>
  </form>
</template>
