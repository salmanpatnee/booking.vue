<script setup>
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';

const props = defineProps({
    columns: Array,
    data: Array,
    sortColumn: Object
})
</script>

<template>
    <div class="table-responsive">
        <table class="card-1 mb-0 table table-bordered table-hover table-striped">
            <TableHeader 
                :columns="columns" 
                :sortColumn="sortColumn" 
                @click="$emit('onSort', sortColumn)"
            />
            <TableBody 
                :columns="columns"
                :data="data"
            >
                <template #action="{id}" >
                    <slot name="action" v-bind:id="id"></slot>
                    <slot name="footer"></slot>
                </template>
            </TableBody>
        </table>
    </div>
</template>