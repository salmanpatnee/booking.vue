<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import purchaseOrderService from '@@/services/PurchaseOrderService';
// Data
const purchase = ref({});
const route = useRoute();
let isLoaded = ref(false)

// Methods
const getPurchase = async () => {
    const {data: response} = await purchaseOrderService.getPurchaseOrder(route.params.id);
    purchase.value = response.data
};


// Hooks
onMounted(async () => {
    await getPurchase();
    isLoaded.value = true;
});

</script>
    
<template>
    <div v-if="isLoaded">
        <Panel>
            <template #header>
                <h1 class="h3 mb-0 text-middle">
                    Purchase Order Details ( Invoice No. : {{purchase.id}})
                </h1>
                <router-link class="btn btn-primary" :to="{ name: 'purchase.order.index' }">
                    All Purchase Orders
                </router-link>
            </template>
            <div class="row">
                <div class="col ">
                    <p><b>Date:</b> {{ moment(purchase.date).format("DD MMMM YYYY") }}</p>
                    
                </div>
                <div class="col text-center">
                    <div class="">
                        <p>
                        <b>Location:</b>
                        {{purchase.location.name}}
                    </p>

                    </div>
                </div>
                <div class="col text-end">
                    <p>
                        <b>Status:</b>
                        <span class="badge bg-success mx-1 text-capitalize"
                            :class="{'bg-success': purchase.status === 'final' || purchase.status === 'received' || purchase.status === 'ordered'}, {'bg-warning': purchase.status === 'draft' || purchase.status === 'ordered' || purchase.status === 'returned'}">{{purchase.status}}</span>
                    </p>
                </div>


            </div>
        </Panel>

        <Panel>
            <template #header>
                <h1 class="h3 mb-0 text-middle">Products</h1>
            </template>
            <div class="table-responsive">
                <table class="table table-striped table-hover table-bordered">
                    <thead class="bg-primary text-light">
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Qty Demanded</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(purchaseDetail, i) in purchase.purchase_order_details">
                            <td>{{ i + 1 }}</td>
                            <td>{{ purchaseDetail.product.name }}</td>
                            <td>{{ purchaseDetail.quantity_demanded }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Panel>
    </div>
</template>
    