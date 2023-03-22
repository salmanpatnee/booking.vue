<script setup>
</script>
    
<template>
    <div class="card">
        <div v-if="$slots.header" class="card-header">
            <div class="d-flex align-items-center justify-content-between">
                <slot name="header" />
            </div>
        </div>
        <div class="card-body">
            <slot />
        </div>
        <div v-if="$slots.footer" class="card-footer text-muted">
            <slot name="footer" />
        </div>
    </div>
</template>
    