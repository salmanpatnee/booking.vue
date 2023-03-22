<script setup>
import Form from "vform";
import { useRouter } from "vue-router";
import { onMounted, ref, inject, watch } from "vue";
import { useFlash } from "@@/composables/useFlash";
import productDiscountService from "@@/services/ProductDiscountService";
import productService from "@@/services/ProductService";
import categoryService from "@@/services/CategoryService";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const products = ref([]);
const categories = ref("[]");
const category_id = ref("");
const checked = ref([]);
const paginate = ref(20);
const search = ref("");
const { flash, confirmAtts } = useFlash();
const sortColumn = ref({ path: "created_at", order: "asc" });
const router = useRouter();
const isLoading = ref(true);
const form = ref(
  new Form({
    products: [],
  })
);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getProductDiscounts();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    category_id.value = "";
    getProductDiscounts();
  }
);

// Methods
const getCategories = async (page = 1) => {
  // const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const params = `?for=sales.create`;
  const { data: response } = await categoryService.getCategories(params);
  categories.value = response.data;
};
const getProductDiscounts = async (page = 1) => {
  isLoading.value = true;
  const { order, path } = sortColumn.value;
  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}&sortOrder=${order}&orderBy=${path}`;
  const { data: response } = await productDiscountService.getProductDiscounts(
    params
  );
  products.value = response.data;
  form.value.products = response.data.data;
  isLoading.value = false;
};

const handleChange = async () => {
  if (category_id.value === "") {
    getProductDiscounts();
  } else {
    const params = `?for=products.discount&category=${category_id.value}`;
    const { data: response } = await productService.getProductsByCategory(
      params
    );
    form.value.products = response.data;
    // products.value = response.data;
  }
};

const handleCheckAll = (e) => {
  if (e.target.value === "on") {
    products.value.map((product) => {
      checked.value.push(product.id);
    });
  }
};

const store = async () => {
  try {
    const { data: response } = await form.value.post(
      productDiscountService.apiEndpoint
    );

    if (response.status == "success") {
      // getExpenseTypes();
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

// Hooks
onMounted(() => {
  getCategories();
  getProductDiscounts();
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Discounts</h1>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <select
          class="form-select"
          @change="handleChange"
          v-model="category_id"
        >
          <option value="">Select Category</option>
          <option
            v-for="category in categories"
            :value="category.id"
            :key="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <!-- <label class="d-inline-block me-2 fw-bold">
                    Show
                </label>
                <PaginateDropdown v-model="paginate" /> -->
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <Search label="Search" v-model="search" />
      </div>
    </div>
    <form @submit.prevent="store">
      <div class="table-responsive mt-4" v-if="!isLoading">
        <table
          class="card-1 mb-0 table table-bordered table-hover table-striped"
        >
          <thead class="bg-primary text-bg-dark">
            <tr clas="border-bottom">
              <th>
                <input
                  @click="handleCheckAll"
                  type="checkbox"
                  class="form-check-input"
                />
              </th>
              <th>Product</th>
              <th>Discount % (Cash)</th>
              <th>Discount % (Card)</th>
              <th>Discount % (Delivery)</th>
              <th>Lock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in form.products" :key="product.id">
              <td>
                <input
                  v-model="checked"
                  type="checkbox"
                  class="form-check-input"
                  :value="product.id"
                />
              </td>
              <td>
                <input
                  type="text"
                  class="form-control"
                  readonly
                  v-model="product.name"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="form-control"
                  v-model="product.discount_rate_cash"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="form-control"
                  v-model="product.discount_rate_card"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="form-control"
                  v-model="product.discount_rate_shipment"
                />
              </td>
              <td><input type="checkbox" v-model="product.is_locked" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center">
        <h3>Loading...</h3>
      </div>
      <div class="row">
        <div class="col mt-3 text-end" v-if="can('discount-edit')">
          <!-- <Button type="button" :form="form" class="btn btn-primary">Save</Button> -->

          <button type="button" @click="store" class="btn btn-primary">
            Save
          </button>
        </div>
      </div>
    </form>
    <template #footer v-if="!isLoading">
      <Pagination
        :data="products"
        @pagination-change-page="getProductDiscounts"
      />
      <div class="text-center">
        <small>
          Showing {{ products.from }} to {{ products.to }} of
          {{ products.total }}
        </small>
      </div>
    </template>
  </Panel>
</template>
