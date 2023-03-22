<script setup>
import { onMounted, ref, watch } from "vue";
import http from "@@/services/HttpService";
import { useRoute } from "vue-router";

// Data
const route = useRoute();
const cashRegister = ref([]);
const paginate = ref(25);
const baseEndpoint = "/api/cash-registers";
const isLoading = ref(true);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getcashRegister();
  }
);

// Methods
const getcashRegister = async (id) => {
  isLoading.value = true;
  const response = await http.get(`${baseEndpoint}/${id}`);

  cashRegister.value = response.data.data;
  isLoading.value = false;
};
// Hooks
onMounted(async () => {
    if(route.params.id){

        await getcashRegister(route.params.id);
    }
});
</script>

<template>


  <Panel>
    <template #header v-if="!isLoading">
      <h1 class="h3 mb-0 text-middle">Cash Register - (<AppDate :timestamp="cashRegister.date"/> <AppTime :timestamp="cashRegister.created_at"/> <span v-if="cashRegister.end_datetime">to <AppTime :timestamp="cashRegister.end_datetime"/></span>)</h1>
    </template>
    
    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <tbody>
            <tr>
            <td><strong>User</strong></td>
            <td>{{ cashRegister.user.name }}</td>
          </tr>
          <tr>
            <td><strong>Opening Cash</strong></td>
            <td>{{ cashRegister.cash_in_hand }}</td>
          </tr>
          <tr>
            <td><strong>Closing Cash</strong></td>
            <td>{{ !cashRegister.cash_in_hand_at_end ? 'Not closed yet' : cashRegister.cash_in_hand_at_end }}</td>
          </tr>
          <tr>
            <td><strong>Debit</strong></td>
            <td>{{ cashRegister.debit }}</td>
          </tr>
          <tr>
            <td><strong>Credit</strong></td>
            <td>{{ cashRegister.credit }}</td>
          </tr>
           <tr>
            <td><strong>Balance</strong></td>
            <td>{{ cashRegister.balance }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
            <tr>
                <th>#</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
            </tr>
        </thead>
        <tbody>
          <tr v-for="(cash_register_entry, index) in cashRegister.cash_register_entries" :key="cash_register_entry.id">
            <td>{{ index + 1 }}</td>
            <td>{{ cash_register_entry.description }}</td>
            <td>{{ cash_register_entry.debit }}</td>
            <td>{{ cash_register_entry.credit }}</td>
            <td>{{ cash_register_entry.balance }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    
  </Panel>
</template>
