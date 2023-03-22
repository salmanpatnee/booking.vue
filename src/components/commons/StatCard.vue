<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  figure: {
    type: Number,
    default: 0.00,
  },
  type: {
    type: String,
    default: "success",
  },
});
</script>

<template>
  <div class="card">
    <div class="card-body text-center">
      <div class="row">
        <div class="col mt-0">
          <h5 class="card-title">{{ title }}</h5>
        </div>
      </div>
      <h1 :class="`mt-1 mb-0 text-${type}`">{{ figure }}</h1>
    </div>
  </div>
</template>
