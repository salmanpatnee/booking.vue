<script setup>
defineProps({
    label: {
        type: String,
        default: 'Search'
    },
    modelValue: String
})

let emit = defineEmits(['update:modelValue'])

</script>

<template>

    <label class="d-inline-block me-2 fw-bold" for="search">
        {{label}}
    </label>
    <input type="search" @change="emit('update:modelValue', $event.target.value)" :value="modelValue"
        class="form-control" id="search">

</template>