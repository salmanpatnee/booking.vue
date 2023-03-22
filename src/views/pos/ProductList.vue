<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true,
  }, 
  cartProducts: {
    type: Array,
  },
});
const emit = defineEmits(["handleClick"]);

const toggleProductAdded = (id) => {
  return props.cartProducts.filter(
    (product) => product.product_id === id
  ).length
    ? "active "
    : "";
};

</script>

<template>
  <app-loader v-if="data.loading" />
  <ul v-else class="list-group">
    <li
      v-for="item in data.data"
      :key="item.id"
      @click="item.stock && $emit('handleClick', item)"
      class="py-3 clickable text-uppercase fw-bold list-group-item list-group-item-action d-flex justify-content-between align-items-center" :class="toggleProductAdded(item.id)"
    >
      {{ item.name }}
      <div>
        <span class="badge bg-info w-50 d-inline me-3 p-2"
          >PKR {{ item.default_selling_price.toFixed(2) }}</span
        >
        <span
          class="badge w-50 d-inline p-2"
          :class="item.stock > 0 ? 'bg-success' : 'bg-danger'"
          >{{ item.stock }}</span
        >
      </div>
    </li>
  </ul>
</template>
