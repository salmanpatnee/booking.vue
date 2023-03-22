<script setup>
const props = defineProps({
    purchases: Array,
    sortColumn: Object
})

const columns = [
    { path: '#', label: "#" },
    { path: 'date', label: "Date", sortable: true },
    { path: 'reference_number', label: "Reference No", sortable: false },
    { path: 'net_amount', label: "Amount", sortable: true },
    { path: 'action', label: "Action", sortable: false },
];

</script>
    
<template>
    <Table :columns="columns" :data="purchases"  >
        <template #action="{id}">
            <button class="btn btn-sm btn-info" @click.prevent="$emit('onShow', id)">
                <i class="mr-1 fa fa-eye"></i>
            </button>
        </template>

    </Table>
</template>