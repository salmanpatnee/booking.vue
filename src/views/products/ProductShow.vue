<script setup>
import { useRoute } from "vue-router";
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import productService from "@@/services/ProductService";

// Data
const route = useRoute();
const product = ref({});
let isLoaded = ref(false);

// Methods

const getProduct = async (id) => {
  const { data: response } = await productService.getProduct(route.params.id);
  product.value = response.data;
};

const profitMarginDisplay = computed(() => {
  const { default_selling_price, default_purchase_price } = product.value;
  if (default_selling_price < 1 || default_purchase_price < 1) return null;
  return (
    (
      ((default_selling_price - default_purchase_price) /
        default_selling_price) *
      100
    ).toFixed(2) + "%"
  );
});

// Hooks
onMounted(async () => {
  await getProduct();
  isLoaded.value = true;
});
</script>

<template>
  <div v-if="isLoaded">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">
          {{ product.name }}
        </h1>
        <router-link class="btn btn-primary" :to="{ name: 'products.index' }">
          All Products
        </router-link>
      </template>
      <div class="row">
        <div class="col">
          <dl class="row">
            <dt class="col-sm-5">Category</dt>
            <dd class="col-sm-7">
              {{ product.category.name }}
            </dd>
          </dl>
        </div>
        <div class="col">
          <dl class="row">
            <dt class="col-sm-5">Brand</dt>
            <dd class="col-sm-7" v-if="product.brand">
              {{ product.brand.name }}
            </dd>
          </dl>
        </div>
        <div class="col">
          <dl class="row">
            <dt class="col-sm-5">Alert quantity</dt>
            <dd class="col-sm-7">{{ product.quantity_threshold }}</dd>
          </dl>
        </div>
        <!-- <div class="col">
          <dl class="row">
            <dt class="col-sm-5">Expires in</dt>
            <dd class="col-sm-7">12.00 Months</dd>
          </dl>
        </div> -->
      </div>
      <div class="row">
        <div class="col">
          <dl class="row">
            <dt class="col-sm-5">UOM of Boxes</dt>
            <dd class="col-sm-7">
              {{ product.uom_of_boxes }}
            </dd>
          </dl>
        </div>
        <div class="col">
          <dl class="row">
            <dt class="col-sm-5">UOM of Strip</dt>
            <dd class="col-sm-7">
              {{ product.uom_of_strips }}
            </dd>
          </dl>
        </div>
        <div class="col">
         
        </div>
        
      </div>
      <hr />
      <div class="row mt-4">
        <div class="table-responsive">
          <table class="table table-bordered table-hover table-striped">
            <thead class="bg-primary text-light">
              <tr>
                <th width="25%">Default Purchase Price</th>
                <th width="25%">Default Selling Price</th>
                <th width="25%">VAT</th>
                <th width="25%">Profit Margin(%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ product.default_purchase_price.toFixed(2) }}</td>
                <td>{{ product.default_selling_price }}</td>
                <td>{{ product.vat_amount }}</td>
                <td>{{ profitMarginDisplay }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Panel>

    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Stock Details</h1>
      </template>
      <div class="table-responsive">
        <table class="table table-bordered table-hover table-striped">
          <thead class="bg-primary text-light">
            <tr>
              <th>Location</th>
              <th>Unit Cost</th>
              <th>Current Stock</th>
              <th>Current Stock Value</th>
              <th>Total Unit Sold</th>
              <th>Total Unit Transfered</th>
              <th>Total Unit Adjusted</th>
              <th>Expired At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in product.product_inventory_entries"
              :key="entry.id"
            >
              <td>{{ entry.location.name }}</td>
              <td>{{ entry.purchased_price.toFixed(2) }}</td>
              <td>{{ entry.available_quantity }}</td>
              <td>
                {{
                  (entry.purchased_price * entry.available_quantity).toFixed(2)
                }}
              </td>
              <td>{{ entry.sold_quantity }}</td>
              <td>{{ entry.transferred_quantity }}</td>
              <td>{{ entry.adjusted_quantity }}</td>
              <td>{{ entry.expiry_date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>

    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Purchase History</h1>
      </template>
      <div v-if="product.purchase_details.length" class="table-responsive">
        <table class="table table-bordered table-hover table-striped">
          <thead class="bg-primary text-light">
            <tr>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Supplier</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="purchase_detail in product.purchase_details"
              :key="purchase_detail.id"
            >
              <td>
                {{
                  moment(purchase_detail.purchase.date).format("DD MMMM YYYY")
                }}
              </td>
              <td>
                <router-link
                  :to="{
                    name: 'purchases.show',
                    params: { id: purchase_detail.purchase.id },
                  }"
                >
                  {{ purchase_detail.purchase.id }}
                </router-link>
              </td>
              <td>{{ purchase_detail.purchase.account.name }}</td>
              <td>{{ purchase_detail.quantity }}</td>
              <td>{{ purchase_detail.price.toFixed(2) }}</td>
              <td>{{ purchase_detail.amount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p class="text-center alert alert-info">No purchases yet.</p>
      </div>
    </Panel>

    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Sale History</h1>
      </template>
      <div v-if="product.sale_details.length" class="table-responsive">
        <table class="table table-bordered table-hover table-striped">
          <thead class="bg-primary text-light">
            <tr>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale_detail in product.sale_details">
              <td>
                {{ moment(sale_detail.sale.date).format("DD MMMM YYYY") }}
              </td>
              <td>
                <router-link
                  :to="{
                    name: 'sales.show',
                    params: { id: sale_detail.sale.id },
                  }"
                >
                  {{ sale_detail.sale.id }}
                </router-link>
              </td>
              <td>{{ sale_detail.sale.account.name }}</td>
              <td>{{ sale_detail.quantity }}</td>
              <td>{{ sale_detail.price }}</td>
              <td>{{ sale_detail.amount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p class="text-center alert alert-info">No sales yet.</p>
      </div>
    </Panel>
  </div>
</template>
