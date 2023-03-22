<script setup>
    import { useRoute, useRouter } from 'vue-router';
    import { onMounted, ref } from 'vue'
    import supplierService from '@@/services/SupplierService'
    import SupplierLedgerTable from './SupplierLedgerTable.vue'
    import { useCan } from "@@/composables/useCan";

    // Data
    const { can } = useCan();
    const ledger = ref([]);
    const route = useRoute()
    const router = useRouter()
    let isloaded = ref(false)
    const sortColumn = ref({ path: 'created_at', order: 'asc' });

    // Methods
    const getLedger = async () => {
        const { order, path } = sortColumn.value;
        const params = `?sortOrder=${order}&orderBy=${path}`;
        const {data: response} = await supplierService.getLedger(route.params.id, params);
        ledger.value = response;
        isloaded.value = true;
    };

    const handleSort = sortColumn => {
        sortColumn.value = sortColumn;
        getLedger();
    }
    // Hooks
    onMounted(() => getLedger());
    
    </script>
            
    <template v-if="isLoaded">
        <Panel>
            <template #header>
                <h1 class="h3 mb-0 text-middle">Ledger</h1>
                <router-link v-if="can('supplier-view')" class="btn btn-primary" :to="{ name: 'suppliers.index' }">
                All Suppliers
            </router-link>
            </template>
            
            <SupplierLedgerTable 
                :ledgerData="ledger" 
                :sortColumn="sortColumn"  
                @onSort="handleSort"
            />
        </Panel>
    </template>
    