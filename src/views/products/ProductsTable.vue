<script setup>
import { useCan } from "@@/composables/useCan";

const { can } = useCan();
const props = defineProps({
  products: Array,
  sortColumn: Object,
});

const columns = [
  { path: "#", label: "#" },
  { path: "name", label: "Name", sortable: true },
  { path: "category", label: "Category", sortable: false },
  { path: "default_selling_price", label: "Price", sortable: false },
  { path: "quantity", label: "Qty", sortable: false },
  { path: "", label: "Action" },
];
</script>

<template>
  <Table
    :columns="columns"
    :data="products"
    :sortColumn="sortColumn"
    @onSort="$emit('onSort', sortColumn)"
  >
    <template #action="{ id }">
      <div class="text-center">
        <button
          @click.prevent="$emit('onShow', id)"
          class="btn btn-success btn-sm me-1 mb-1"
        >
          <i class="mr-1 fa fa-eye"></i>
        </button>
        <!-- <button
          
          @click.prevent="$emit('showProductStock', id)"
          class="btn btn-info btn-sm me-1 mb-1"
        >
          <i class="mr-1 fa fa-th-large"></i>
        </button> -->
        <button
          @click.prevent="$emit('onEdit', id)"
          class="btn btn-warning btn-sm me-1 mb-1"
        >
          <i class="mr-1 fa fa-pencil"></i>
        </button>
        <!-- <button v-if="can('product-delete')"
          @click.prevent="$emit('onDelete', id)"
          class="btn btn-danger btn-sm me-1 mb-1"
        >
          <i class="mr-1 fa fa-trash"></i>
        </button> -->
      </div>
    </template>
  </Table>
</template>
