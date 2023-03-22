<script setup>
import { useCan } from "@@/composables/useCan";

const { can } = useCan();

    const props = defineProps({
        brands: Array,
        sortColumn: Object
    })
    
    const columns = [
        { path: '#', label: "#" },
        { path: 'name', label: "Name", sortable: true },
        { path: 'products_count', label: "Products Count", sortable: false },
        { path: '', label: "Action" },
    ];
    
    </script>
    
    <template>
        <Table :columns="columns" :data="brands" :sortColumn="sortColumn" @onSort="$emit('onSort', sortColumn)">
            <template #action="{id}">
                <button v-if="can('brand-edit')" @click="$emit('onEdit', id)" class="btn btn-sm btn-info me-1">
                    <i class="fa fa-edit"></i>
                </button>
                <button v-if="can('brand-delete')" @click="$emit('onDelete', id)" class="btn btn-sm btn-danger">
                    <i class="fa fa-trash"></i>
                </button>
            </template>
    
        </Table>
    </template>