<script setup>
    const props = defineProps({
        accounts: Array,
        sortColumn: Object
    })
    
    const columns = [
        { path: '#', label: "#" },
        { path: 'name', label: "Title", sortable: false },
        { path: 'action', label: "Action" },
    ];
    
    </script>
    
    <template>
        <Table :columns="columns" :data="accounts">
            <template #action="{id}">
                <button @click="$emit('onView', id)" class="btn btn-sm btn-info me-1">
                    <i class="fa fa-eye"></i>
                </button>
            </template>
        </Table>
    </template>