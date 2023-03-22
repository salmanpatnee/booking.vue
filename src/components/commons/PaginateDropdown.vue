<script setup>
import { ref } from "vue";

defineProps({
  pageSize: {
    type: Array,
    default: [10, 25, 50, 100],
  },
  label: {
    type: String,
    default: "Show",
  },
  modelValue: String,
});

let emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <label class="d-inline-block me-2 fw-bold">
    {{ label }}
  </label>
  <select
    @change="emit('update:modelValue', $event.target.value)"
    :value="modelValue"
    class="form-select w-auto"
  >
    <option
      v-for="size in pageSize"
      :key="size"
      :value="size"
      v-text="size"
    ></option>
  </select>
</template>
