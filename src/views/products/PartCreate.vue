<script setup>
import Form from "vform";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { useFlash } from "@@/composables/useFlash";
import categoryService from "@@/services/CategoryService";
import partService from "@@/services/PartService";
import "vue-select/dist/vue-select.css";
import FormAjaxSelect from "@@/components/commons/FormAjaxSelect.vue";

// Data
const categories = ref([]);
const route = useRoute();
const router = useRouter();
const editMode = ref(false);
const { flash } = useFlash();
const isLoading = ref(true);
let shouldSubmit = true;
const selectedCategory = ref(null);

const form = ref(
  new Form({
    id: "",
    name: "",
    code: "",
    category_id: "",
    cost: null,
    price: null,
    // quantity: 0,
  })
);

// Methods

const handleCategorySelect = () => {
  form.value.category_id = selectedCategory.value.id;
};

const getCategories = async () => {
  const { data: response } = await categoryService.getCategories();
  categories.value = response.data;
};

const getProduct = async (id) => {
  isLoading.value = true;
  const { data: response } = await partService.getPart(id);
  form.value.fill(response.data);
  console.log(response.data.cost);

  form.value.cost =
    response.data.cost.toFixed(2);
  form.value.price =
    response.data.price.toFixed(2);
  selectedCategory.value = response.data.category;
  
  isLoading.value = false;
};

const handleBarcodeScan = ($event) => {
  if (document.getElementById("product-form").checkValidity()) {
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
      partService.apiEndpoint
    );
    if (response.status == "success") {
      flash(response.message);
      router.push({ name: "parts.index" });
    }
  } catch (error) {
    console.log(error);
  }
};

const update = async () => {
  try {
    const { data: response } = await form.value.patch(
      `${partService.apiEndpoint}/${form.value.id}`
    );
    if (response.status == "success") {
      flash(response.message);
      router.push({ name: "parts.index" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Hooks
onMounted(() => {
  getCategories();

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
        <!-- <div class="row">
          <div class="col mb-4">
            <label class="form-label" for="barcode">Barcode:</label>
            <input
              v-model="form.barcode"
              type="text"
              class="form-control form-control-lg"
              id="barcode"
              required=""
              @change="handleBarcodeScan"
              autofocus
            />
            <HasError :form="form" field="barcode" />
          </div>
        </div> -->
        <div class="row">
          <div class="col mb-3">
            <label class="form-label" for="name">Name:</label>
            <input
              v-model="form.name"
              name=""
              type="text"
              class="form-control form-control-lg"
              id="name"
              required
            />
            <HasError :form="form" field="name" />
          </div>
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
        </div>

        <div class="row">
          <div class="col mb-3">
            <label class="form-label" for="cost"
              >Unit Cost:</label
            >
            <input
              v-model="form.cost"
              type="number"
              class="form-control form-control-lg"
              id="cost"
              min="0"
              step=".01"
            />
            <HasError :form="form" field="cost" />
          </div>
          <div class="col mb-3">
            <label class="form-label" for="price"
              >Unit Price:</label
            >
            <input
              v-model="form.price"
              type="number"
              :min="form.cost"
              class="form-control form-control-lg"
              id="price"
              step=".01"
            />
            <HasError :form="form" field="price" />
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
            <label class="form-label" for="code"
              >Code:</label
            >
            <input
              v-model="form.code"
              type="text"
              class="form-control form-control-lg"
              id="code"
            />
            <HasError :form="form" field="code" />
          </div>
          <div class="col mb-3">
            <!-- <label class="form-label" for="quantity"
              >Quantity:</label
            >
            <input
              v-model="form.quantity"
              type="number"
              :min="form.quantity"
              class="form-control form-control-lg"
              id="quantity"
            />
            <HasError :form="form" field="quantity" /> -->
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
