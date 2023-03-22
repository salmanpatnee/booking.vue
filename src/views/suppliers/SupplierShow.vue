<script setup>
import { useRoute, RouterLink, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue'
import supplierService from '@@/services/SupplierService'
import SupplierPurchasesTable from './SupplierPurchasesTable.vue'
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const supplier = ref([]);
const route = useRoute()
const router = useRouter()
let isloaded = ref(false)

// Methods
const getSupplier = async (id) => {
    const {data: response} = await supplierService.getSupplier(id);
    supplier.value = response.data;
    isloaded.value = true;
};
const handleShow = id => router.push({ name: 'purchases.show', params: { id: id } })

// Hooks
onMounted(() => {
    getSupplier(route.params.id);
});

</script>
        
<template v-if="isLoaded">
    <Panel>
        <template #header>
            <h1 class="h3 mb-0 text-middle">View Supplier</h1>
            <router-link v-if="can('supplier-view')" class="btn btn-primary" :to="{ name: 'suppliers.index' }">
                All Supplier
            </router-link>
        </template>

        <div class="row mb-5">
            <div class="col-12">
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                        <i class="fa fa-user-circle-o fa-4x" aria-hidden="true"></i>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h3 class="card-title font text-dark">{{ supplier.name }}
                            <small v-if="supplier.company">
                                ({{ supplier.company }})
                            </small>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-4">
                <div>
                    <h5 class="text-body align-items-center d-flex">
                        <i class="d-inline-block fa fa-2x fa-envelope me-2" aria-hidden="true"></i>
                        <strong>Email</strong>
                    </h5>
                    <p>{{ supplier.email ? supplier.email : '--' }}</p>
                </div>
                <hr>
                <div>
                    <h5 class="text-body align-items-center d-flex">
                        
                        <i class="d-inline-block fa fa-2x fa-balance-scale me-2" aria-hidden="true"></i>
                        <strong>Balance</strong>
                    </h5>
                    <p>{{ supplier.balance }}</p>
                </div>
            </div>
            <div class="col-4">
                <div>
                    <h5 class="text-body align-items-center d-flex">
                        <i class="d-inline-block fa fa-2x fa-phone me-2" aria-hidden="true"></i>
                        <strong>Phone</strong>
                    </h5>
                    <p>{{ supplier.phone ? supplier.phone : '---'  }}</p>
                </div>
                    <hr>
                <div>
                    <h5 class="text-body align-items-center d-flex">
                        <i class="d-inline-block fa fa-2x fa-money me-2" aria-hidden="true"></i>
                        <strong>Total Purchase Amount</strong>
                    </h5>
                    <p>{{ supplier.purchases_amount }}</p>
                </div>
            </div>
            <div class="col-4">
                <div>
                    <h5 class="text-body align-items-center d-flex">
                        <i class="d-inline-block fa fa-2x fa-building me-2" aria-hidden="true"></i>
                        <strong>Company</strong>
                    </h5>
                    <p>{{ supplier.company }}</p>
                </div>
               
            
                <hr>
                <div>
                    <h5 class="text-body align-items-center d-flex">
                        <i class="d-inline-block fa fa-2x fa-thumb-tack me-2" aria-hidden="true"></i>
                        <strong>Total Purchases </strong>
                    </h5>
                    <p>{{ supplier.purchases_count }}</p>
                </div>
            </div>
        </div>
    </Panel>

    <Panel>
        <template #header>
            <h1 class="h3 mb-0 text-middle">Purchase History</h1>
        </template>
        <SupplierPurchasesTable :purchases="supplier.purchases" @onShow="handleShow"/>
    </Panel>
</template>
