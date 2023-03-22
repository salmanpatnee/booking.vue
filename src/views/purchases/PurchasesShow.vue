<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import purchaseService from '@@/services/PurchaseService';
import PaymentHistoryTable from './PaymentHistoryTable.vue';
// import PurchasedProductsTable from './PurchasedProductsTable.vue';

// Data
const purchase = ref({});
const route = useRoute();
let isLoaded = ref(false)

// Methods
const getPurchase = async () => {
    const {data: response} = await purchaseService.getPurchase(route.params.id);
    purchase.value = response.data
};


// Hooks
onMounted(async () => {
    await getPurchase();
    isLoaded.value = true;
});

const totalDiscountDisplay = computed(() => {
    const {discount_amount} = purchase.value;
    return discount_amount === null ? '0.00' : parseFloat(discount_amount).toFixed(2);
})
const dueAmountDisplay = computed(() => {
    return purchase.value.net_amount - purchase.value.paid_amount;
})
</script>
    
<template>
    <div v-if="isLoaded">
        <Panel>
            <template #header>
                <h1 class="h3 mb-0 text-middle">
                    Purchase Details ( Invoice No. : {{purchase.reference_number}})
                </h1>
                <router-link class="btn btn-primary" :to="{ name: 'purchases.index' }">
                    All Purchase
                </router-link>
            </template>
            <div class="row">
                <div class="col mb-3">
                    <p>
                        <b>Supplier: &nbsp;</b>  
                        <router-link  :to="{ name: 'suppliers.show', params: { id: purchase.account.id }, }">
                                {{ purchase.account.name }}
                        </router-link>
                    </p>
                    <p>
                        <b>Status:</b>
                        <span class="badge bg-success mx-1 text-capitalize"
                            :class="{'bg-success': purchase.status === 'final' || purchase.status === 'received' || purchase.status === 'ordered'}, {'bg-warning': purchase.status === 'draft' || purchase.status === 'ordered' || purchase.status === 'returned'}">{{purchase.status}}</span>
                    </p>
                </div>
                <div class="col">
                    <div class="mb-3">
                        <p><b>Purchase Date:</b> {{ moment(purchase.date).format("DD MMMM YYYY") }}</p>
                        <p><b>Payment Status:</b> <span class="badge bg-success mx-1 text-capitalize"
                                :class="{'bg-success': purchase.payment_status === 'paid'}, {'bg-warning': purchase.payment_status === 'due'}">{{purchase.payment_status}}</span>
                        </p>
                    </div>
                </div>
                <div class="col">
                    <div class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label me-2" for="date"><b>Gross Amount</b></label>
                        <b>{{ purchase.gross_amount }}</b>
                    </div>
                    <div v-if="purchase.discount_type" class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date"><b>Total Discount</b></label>
                        <b>- {{totalDiscountDisplay }}</b>
                    </div>
                    <div v-if="purchase.tax_amount != '0.00' || purchase.tax_amount === null ||  purchase.tax_amount === ''" class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date"><b>Tax</b></label>
                        <b>+ {{purchase.tax_amount }}</b>
                    </div>
                    <hr>
                    <div class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date"><b>Net Total</b></label>
                        <b>{{ purchase.net_amount }}</b>
                    </div>
                    <hr>
                    <div class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date"><b>Paid</b></label>
                        <b>{{ purchase.paid_amount }}</b>
                    </div>
                    <div class="mb-3 d-flex justify-content-between mb-3">
                        <label class="form-label  me-2" for="date"><b>Due</b></label>
                        <b class="text-danger">{{dueAmountDisplay }}</b>
                    </div>
                </div>
            </div>
        </Panel>

        <Panel>
            <template #header>
                <h1 class="h3 mb-0 text-middle">Products</h1>
            </template>
            <!-- <PurchasedProductsTable :products="purchase.purchase_details"/> -->
            <div class="table-responsive">
                <table class="table table-striped table-hover table-bordered">
                    <thead class="bg-primary text-light">
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>UOM</th>
                            <th>Unit Cost</th>
                            <th>Unit Price</th>
                            <th>Profit %</th>
                            <th>Expiry Date</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(purchaseDetail, i) in purchase.purchase_details">
                            <td>{{ i + 1 }}</td>
                            <td>
                                <router-link  :to="{ name: 'products.show', params: {id: purchaseDetail.product.id} }">
                                    {{ purchaseDetail.product.name }}
                                </router-link>
                            </td>
                            <td>{{ purchaseDetail.quantity }} </td>
                            <td>{{ purchaseDetail.units_in_box }}</td>
                            <td>{{ parseFloat(purchaseDetail.price).toFixed(2)  }}</td>
                            <td>{{ parseFloat(purchaseDetail.sale_price).toFixed(2) }}</td>
                            <td>{{ purchaseDetail.profit_margin }}</td>
                            <td><AppDate :timestamp="purchaseDetail.expiry_date" /></td>
                            <td>{{ purchaseDetail.amount }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Panel>

        <Panel>
            <template #header>
                <h1 class="h3 mb-0 text-middle">Payments History</h1>
            </template>
            <PaymentHistoryTable :payments="purchase.payments"/>
        </Panel>
    </div>
</template>
    