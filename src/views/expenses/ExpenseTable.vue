<script setup>
    const props = defineProps({
        expenses: Array,
        sortColumn: Object
    })
    
    const columns = [
        { path: '#', label: "#" },
        { path: 'expense_type', label: "Type", sortable: false },
        { path: 'amount', label: "Amount", sortable: true },
        { path: 'description', label: "Description", sortable: false },
        { path: 'date', label: "Date", sortable: true },
        { path: '', label: "Action" },
    ];
    
    </script>
    
    <template>
        <Table :columns="columns" :data="expenses" :sortColumn="sortColumn" @onSort="$emit('onSort', sortColumn)">
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