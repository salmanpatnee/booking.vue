<script setup>
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue'
import accountService from '@@/services/AccountHeadsService';
import HeadsTable from './HeadsTable.vue';

const accounts = ref([]);
const router = useRouter()
let isLoaded = ref(false)

const getAccounts = async () => {
    const {data: response} = await accountService.getHeads();
    accounts.value = response.data;
};

const handleView = id => {
    router.push({ name: 'accounthead.show', params: { id: id } })
}

onMounted(() => {
    getAccounts();
    isLoaded.value = true;
});


</script>

<template>

    <Panel>
        <template #header>
            <h1 class="h3 mb-3 text-middle">Account Heads</h1>
        </template>
        <div v-if="isLoaded">
            <div class="row">
                <div class="col-12">
                    <HeadsTable 
                        :accounts="accounts" 
                        @onView="handleView"
                     />
                </div>
            </div>
        </div>
    </Panel>
</template>
