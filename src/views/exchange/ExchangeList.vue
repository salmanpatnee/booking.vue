<script setup>
import { onMounted, ref, watch } from 'vue'
import productExchangeService from "@@/services/ProductExchangeService";

// Data
const productExchange = ref([]);
const paginate = ref(10);
const search = ref('');
let orderBy = ref('created_at')
let sortOrder = ref('desc')

watch(
    () => paginate.value,
    (paginate, prevCount) => {
        getExchangeList()
    }
)
watch(
    () => search.value,
    (search, prevCount) => {
        getExchangeList()
    }
)

// Methods
const getExchangeList = async (page = 1) => {
    const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}&sortOrder=${sortOrder.value}&orderBy=${orderBy.value}`;
    const {data: response} = await productExchangeService.getExchanges(params);
    productExchange.value = response.data.data;
};

// Hooks
onMounted(() => getExchangeList());

</script>
        
<template>

    <Panel>
        <template #header>
            <h1 class="h3 mb-0 text-middle">Product Exchange List</h1>
            <!-- <router-link class="btn btn-primary" :to="{ name: 'sales.return.create' }">
                Add Sale Return
            </router-link> -->
        </template>
        <div class="mb-3 row">
            <div class="align-items-center col d-flex">
                <PaginateDropdown v-model="paginate" />
            </div>
            <div class="col"></div>
            <div class="align-items-center col d-flex">
                <Search v-model="search" />
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-bordered table-hover table-striped">
                <thead class="bg-primary text-bg-dark">
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Invoice No</th>
                        <th>Sale Amount</th>
                        <th>Return Amount </th>
                        <th>Credit Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(sale, index) in productExchange" :key="sale.id">
                        <td>{{index + 1}}</td>
                        <td>
                            <AppDate :timestamp="sale.date" />
                        </td>
                        <td>
                            <router-link
                :to="{ name: 'sales.show', params: { id: sale.sale.id } }"
              >
                {{ sale.sale.id }}
              </router-link></td>
                        <td>{{sale.sale_amount}}</td>
                        <td>{{sale.sales_return_amount}}</td>
                        <td>{{sale.net_amount}}</td>
                        <td>
                            <router-link class="btn btn-sm btn-info"
                                :to="{ name: 'exchanges.show', params: { id: sale.id } }">
                                <i class="mr-1 fa fa-eye"></i>
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <template #footer>
            <Pagination :data="productExchange" @pagination-change-page="getExchangeList" />
        </template>
    </Panel>
</template>
        