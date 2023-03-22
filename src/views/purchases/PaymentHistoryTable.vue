<script setup>
    const props = defineProps({
        payments: Array,
        sortColumn: Object
    })
    
    const columns = [
        { path: '#', label: "#" },
        { path: 'date', label: "Date", sortable: false },
        { path: 'amount', label: "Amount", sortable: false },
        { path: '', label: "Payment Mode", content: "Cash" },
    ];
    
    </script>
    
    <template>
        <Table :columns="columns" :data="payments" :sortColumn="sortColumn" @onSort="$emit('onSort', sortColumn)">
            <template #action="{id}">
                <button @click="$emit('onEdit', id)" class="btn btn-sm btn-info me-1">
                    <i class="fa fa-edit"></i>
                </button>
                <button @click="$emit('onDelete', id)" class="btn btn-sm btn-danger">
                    <i class="fa fa-trash"></i>
                </button>
            </template>
    
        </Table>
    </template>