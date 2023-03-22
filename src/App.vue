<script setup>
// import http from "@@/services/HttpService";
// import { useAppStore } from "@@/stores/appStore";
// import { onMounted, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router'

// const appStore = useAppStore();
const route = useRoute();

// const openingDay = ref({
//   isOpen: false,
//   data: {},
// });

// const checkDayOpening = async () => {
//   try {
//     const { data: response } = await http.get(`/api/cash-registers/me`);
//     if (response.data.id) {
//       appStore.isDayOpen = true
//       openingDay.value.isOpen = true;
//     }
//   } catch (error) {
//     openingDay.value.isOpen = false;
//     appStore.isDayOpen = false;
//   }
// };

// onMounted(async () => {
//   await checkDayOpening();
//   console.log('APP');
// });

</script>

<template>
  <!-- <div class="d-flex align-items-center justify-content-center" v-if="appStore.isAppLoading">
    <AppLoader  />
  </div> -->
  <RouterView :key="route.path" />
  <vue-progress-bar></vue-progress-bar>
</template>



