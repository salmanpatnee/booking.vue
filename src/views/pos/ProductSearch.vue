<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="input-group mb-3">
    <span class="input-group-text bg-primary text-light">
      <i class="fa fa-search" aria-hidden="true"></i>
    </span>
    <input
      type="search"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control form-control-lg"
      placeholder="Search Products"
    />
  </div>
</template>
