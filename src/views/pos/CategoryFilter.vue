<script setup>

defineProps({
    data: {
        type: Object, 
        required: true
    }, 
    currentCategoryId: {
        type: Number, 
    }
})

const emit = defineEmits(["handleClick"]);
</script>

<template>
   
  <div class="pos__data">
    <app-loader v-if="data.loading" />
    <div v-else>
      <button
        class="btn w-75 mb-2"
        :class="category_id == 'category_id' ? 'btn-dark' : 'btn-primary'" 
        @click.prevent="$emit('handleClick')"
      >
        All
      </button>
      <button
        v-for="category in data.data"
        :key="category.id"
        class="btn w-75 mb-2"
        :class="category.id == currentCategoryId ? 'btn-dark' : 'btn-primary'"
        @click.prevent="$emit('handleClick', category)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.pos__data {
    height: 100vh;
    overflow-y: auto;
}
</style>
