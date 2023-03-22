<script setup>

defineProps({
    id: {
        type: String,
        required: true
    }, 
    class: {
        type: String, 
        default: ""
    }
})
</script>

<template>
    <div class="modal fade" :id="id" tabindex="-1" :aria-labelledby="id + 'Label'" aria-hidden="true" ref="input">
        <div class="modal-dialog" :class="class">
            <div class="modal-content">
                <div class="bg-primary modal-header">
                    <h5 v-if="$slots.title" class="fw-bold modal-title text-light" :id="id + 'Label'">
                        <slot name="title" />
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <form @submit.prevent="$emit('onSubmit')">
                    <div class="modal-body">
                        <slot></slot>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <slot name="footer" />
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>