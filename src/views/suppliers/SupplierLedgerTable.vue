<script setup>


const props = defineProps({
    ledgerData: Array,
    sortColumn: Object
})

const columns = [
    { path: '#', label: "#" },
    { path: 'date', label: "Date", sortable: true },
    { path: 'description', label: "Description", sortable: false },
    { path: 'debit', label: "Debit", sortable: false },
    { path: 'credit', label: "Credit", sortable: false },
    { path: 'balance', label: "Balance", sortable: false },
];

</script>
    
<template>
    <Table :columns="columns" :data="ledgerData" :sortColumn="sortColumn" @onSort="$emit('onSort', sortColumn)">
    </Table>
</template>