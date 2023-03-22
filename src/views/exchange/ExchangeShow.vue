<script setup>
import { onMounted, ref } from "vue";
import { useRoute} from "vue-router";
import axios from "axios";
import productExchangeService from "@@/services/ProductExchangeService";
import moment from "moment";

// Data
const route = useRoute();
const sale = ref({});
const products = ref([]);
const baseEndpoint = "/api/sales";
let isLoaded = ref(false)


// Methods

const getExchange = async (id) => {
    const response = await productExchangeService.getExchange(route.params.id);
    sale.value = response.data.data
};

// Hooks
onMounted(async () => {
    await getExchange();
    isLoaded.value = true;
});
</script>
    
<template>
    <div v-if="isLoaded">
        <div class="card border-primary">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h1 class="h3 mb-0 text-middle">
                        Product Exchange ( Invoice No. : {{sale.id}})
                    </h1>
                    <router-link class="btn btn-primary" :to="{ name: 'exchanges.index' }">
                        All Exchanges
                    </router-link>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col mb-3">
                        <label class="form-label" for="date">Invoice No:</label>
                        <p><b>#{{ sale.id }}</b></p>
                    </div>
                    <div class="col">
                        <div class="mb-3">
                            <label class="form-label" for="date">Customer Name:</label>
                            <p><b>{{ sale.sale.account.name }}</b></p>
                        </div>
                    </div>
                    <div class="col mb-3">
                        <label class="form-label" for="date">Sale Invoice No:</label>
                        <p><b>#{{ sale.sale.id }}</b></p>
                    </div>
                    <div class="col">
                        <div class="mb-3">
                            <label class="form-label" for="date">Sale Date:</label>
                            <p><b>{{ moment(sale.date).format("DD MMMM YYYY") }}</b></p>
                        </div>
                    </div>
                    <!-- <div class="col">
                        <div class="mb-3 d-flex justify-content-between mb-3">
                            <label class="form-label me-2" for="date">Sale Amount</label>
                            <b>{{ sale.sale_amount }}</b>
                        </div>
                        <div class="mb-3 d-flex justify-content-between mb-3">
                            <label class="form-label  me-2" for="date">Discount</label>
                            <b>{{discount_amount ? sale.discount_amount : '0.00'}}</b>
                        </div>
                        <div class="mb-3 d-flex justify-content-between mb-3">
                            <label class="form-label  me-2" for="date">Shipping</label>
                            <b>{{shipping_charges ? sale.shipping_charges : '0.00'}}</b>
                        </div>
                        <hr>
                        <div class="mb-3 d-flex justify-content-between mb-3">
                            <label class="form-label  me-2" for="date">Paid</label>
                            <b>{{ sale.net_amount }}.00</b>
                        </div>
                        <div class="mb-3 d-flex justify-content-between mb-3">
                            <label class="form-label  me-2" for="date">Remaining</label>
                            <b>0.00</b>
                        </div>
                    </div> -->
                </div>
            </div>
            <!-- <div class="card-footer text-muted text-end">
                <button class="btn btn-info btn-sm">
                    <i class="fa fa-print"></i> &nbsp; Print Invoice
                </button>
            </div> -->
        </div>
        <Panel>
            <template #header>
                <h3>Exchange Product Details</h3>
            </template>
            <div class="row">
                <div class="col">
                    <Panel>
                        <template #header>
                            <h4>Returned</h4>
                        </template>
                        <table class="card-1 mb-0 table table-bordered table-hover table-striped">
                            <thead class="bg-primary text-bg-dark">
                                <tr>
                                    <td>Product</td>
                                    <td>Qty</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="product in sale.sales_return.sales_return_details">
                                    <td>{{product.product.name}}</td>
                                    <td>{{product.quantity_return}}</td>
                                </tr>
                            </tbody>

                        </table>
                    </Panel>
                </div>
                <div class="col">
                    <Panel>
                        <template #header>
                            <h4>Sold</h4>
                        </template>
                        <table class="card-1 mb-0 table table-bordered table-hover table-striped">
                            <thead class="bg-primary text-bg-dark">
                                <tr>
                                    <td>Product</td>
                                    <td>Qty</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="product in sale.sale.sale_details">
                                    <td>{{product.product.name}}</td>
                                    <td>{{product.quantity}}</td>
                                </tr>
                            </tbody>

                        </table>
                    </Panel>
                </div>
            </div>
        </Panel>

        <!-- <div class="card border-primary">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h1 class="h3 mb-0 text-middle">Products</h1>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead class="bg-primary text-light">
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(saleDetail, i) in sale.sale_details">
                                <td>{{ i + 1 }}</td>
                                <td>{{ saleDetail.product.name }}</td>
                                <td>{{ saleDetail.price }}</td>
                                <td>{{ saleDetail.quantity }} </td>
                                <td>{{ saleDetail.amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer text-muted"></div>
        </div> -->

    </div>

</template>
    