<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router';
import accountService from '@@/services/AccountHeadsService';

const route = useRoute()
const accountHead = ref([])
let isLoaded = ref(false)

const getAccountHead = async () => {
    const {data: response} = await accountService.getHead(route.params.id);
    accountHead.value = response.data;
};

onMounted(async () => {
    await getAccountHead();
    isLoaded.value = true;
});

const carryForwardDr = computed(() => {
    let balance = accountHead.value.total.debit - accountHead.value.total.credit;
    return balance > 0 ? balance : '-';
});
const carryForwardCr = computed(() => {
    let balance = accountHead.value.total.credit - accountHead.value.total.debit;
    return balance > 0 ? balance : '-';
});

</script>

<template >
    <div v-if="isLoaded">
        <Panel>
            <template #header>
                <h1 class="h3 mb-3 text-middle">Account Head: {{ accountHead.name }}</h1>
                <router-link class="btn btn-primary" :to="{ name: 'accountheads.index' }">
                    <i class="align-middle" data-feather="arrow-right"></i>
                    <span class="align-middle">Back</span>
                </router-link>
            </template>

            <div class="table-responsive">
                <table class="card-1 mb-0 table table-bordered table-hover table-striped">
                    <thead class="bg-primary text-bg-dark">
                        <tr clas="border-bottom">
                            <th scope="col">#</th>
                            <th scope="col">Date</th>
                            <th scope="col">Description</th>
                            <th scope="col">Debit</th>
                            <th scope="col">Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(journal_entry, index) in accountHead.journal_entries" :key="journal_entry.id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ journal_entry.date }}</td>
                            <td>{{ journal_entry.description }}</td>
                            <td>{{ journal_entry.debit }}</td>
                            <td>{{ journal_entry.credit }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="3" class="text-end">Total</th>
                            <td>{{ accountHead.total.debit }}</td>
                            <td>{{ accountHead.total.credit }}</td>
                        </tr>
                        <tr>
                            <th colspan="3" class="text-end">Carry Forward Balance</th>
                            <td>{{ carryForwardDr }}</td>
                            <td>{{ carryForwardCr }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </Panel>
    </div>
</template>
