<script setup>
import { useRoute } from "vue-router";
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import partService from "@@/services/PartService";

// Data
const route = useRoute();
const product = ref({});
let isLoaded = ref(false);

// Methods

const getPart = async (id) => {
  const { data: response } = await partService.getPart(route.params.id);
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
  await getPart();
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
        <router-link class="btn btn-primary" :to="{ name: 'parts.index' }">
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
            <dt class="col-sm-5">Code</dt>
            <dd class="col-sm-7">
              {{ product.code }}
            </dd>
          </dl>
        </div>
        <div class="col">
          <dl class="row">
            <dt class="col-sm-5">Quantity</dt>
            <dd class="col-sm-7">
              {{ product.quantity }}
            </dd>
          </dl>
        </div>
      </div>

      <hr />
      <div class="row mt-4">
        <div class="table-responsive">
          <table class="table table-bordered table-hover table-striped">
            <thead class="bg-primary text-light">
              <tr>
                <th width="25%">Cost</th>
                <th width="25%">Price</th>
                <!-- <th width="25%">Profit %</th> -->
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ product.cost }}</td>
                <td>{{ product.price }}</td>

                <!-- <td>{{ profitMarginDisplay }}</td> -->
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Panel>

  </div>
</template>
