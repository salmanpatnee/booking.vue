<script setup>
import trailBalanceService from '@@/services/TrailBalanceService';
import { onMounted, ref, computed } from 'vue'

const trailBalance = ref([]);

const getTrailBalance = async () => {
    const {data: response} = await trailBalanceService.getTrailBalance();
    trailBalance.value = response.data;
};

const total = computed(() => {
    return {
        'debit': trailBalance.value.reduce((total, data) => total + data.debit, 0),
        'credit': trailBalance.value.reduce((total, data) => total + data.credit, 0)
    }
});

onMounted(() => {
    getTrailBalance();
});


</script>

<template>

    <Panel>
        <template #header>
            <h1 class="h3 mb-3 text-middle">Trial Balance</h1>
        </template>

        <div class="table-responsive">
            <table class="card-1 mb-0 table table-bordered table-hover table-striped">
                <thead class="bg-primary text-bg-dark">
                    <tr clas="border-bottom">
                        <th scope="col">Title</th>
                        <th scope="col">Debit</th>
                        <th scope="col">Credit</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="accountHead in trailBalance" :key="accountHead.id">
                        <td>
                            {{ accountHead.name }}
                        </td>
                        <td>
                            {{ accountHead.debit }}
                        </td>
                        <td>
                            {{ accountHead.credit }}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th>Total</th>
                        <th>{{ total.debit }}</th>
                        <th>{{ total.credit }}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    </Panel>

</template>
