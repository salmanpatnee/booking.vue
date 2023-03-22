<script setup>
import { onMounted, ref, watch } from "vue";
import inventoryService from "@@/services/InventoryService";

// Data
const inventories = ref([]);
const paginate = ref(10);
const search = ref("");

// Watcher
watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getInventories();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getInventories();
  }
);

// Methods
const getInventories = async (page = 1) => {
  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const { data: response } = await inventoryService.getInventories(params);
  inventories.value = response.data;
};

// Hooks
onMounted(async () => {
  await getInventories();
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Stock Report</h1>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <PaginateDropdown v-model="paginate" />
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <Search v-model="search" />
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Location</th>
            <th>Type</th>
            <th>Purchases Price</th>
            <th>In Qty</th>
            <th>Out Qty</th>
            <th>Transferred Qty</th>
            <th>Adjusted Qty</th>
            <th>Returned Qty</th>
            <th>Stock</th>
            <th>Purchased Amount</th>
            <th>Sold Amount</th>
            <th>Expiry Date</th>
            <!-- <th style="width: 130px">Action</th> -->
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(inventory, index) in inventories.data"
            :key="inventory.id"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ inventory.product.name }}</td>
            <td>{{ inventory.location.name }}</td>
            <td>
              {{
                inventory.reference_type ===
                "App\\Models\\ProductInventoryOutflow"
                  ? "Purchase"
                  : "Sale"
              }}
            </td>
            <td>{{ parseFloat(inventory.purchased_price).toFixed(2) }}</td>
            <td>{{ inventory.initial_quantity }}</td>
            <td>{{ inventory.sold_quantity }}</td>
            <td>{{ inventory.transferred_quantity }}</td>
            <td>{{ inventory.adjusted_quantity }}</td>
            <td>
              {{
                inventory.purchase_returned_quantity ||
                inventory.returned_quantity
              }}
            </td>
            <td>{{ inventory.available_quantity }}</td>
            <td>{{ inventory.purchased_amount }}</td>
            <td>{{ inventory.sold_amount }}</td>
            <td><AppDate :timestamp="inventory.expiry_date" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <div class="text-end">
        <Pagination
          :data="inventories"
          @pagination-change-page="getInventories"
        />
      </div>
    </template>
  </Panel>
</template>
