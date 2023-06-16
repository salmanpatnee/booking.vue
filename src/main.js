import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import axios from "axios";
import VueProgressBar from "@aacassandra/vue3-progressbar";
import LaravelVuePagination from "laravel-vue-pagination";
import vSelect from "vue-select";
import Modal from "@@/components/commons/Modal.vue";
import Panel from "@@/components/commons/Panel.vue";
import PaginateDropdown from "@@/components/commons/PaginateDropdown.vue";
import Search from "@@/components/commons/Search.vue";
import Table from "@@/components/commons/Table.vue";
import AppDate from "@@/components/commons/AppDate.vue";
import AppTime from "@@/components/commons/AppTime.vue";
import AppLoader from "@@/components/commons/AppLoader.vue";

import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import App from "./App.vue";

import "./assets/scss/app.scss";
import "bootstrap";

import {
  Button,
  HasError,
  AlertError,
  AlertErrors,
  AlertSuccess,
} from "vform/src/components/bootstrap5";

const app = createApp(App);

app.config.globalProperties.$filters = {
  currencyPound(value) {
    // return '£' + value
    let val = (value/1).toFixed(2).replace(',', '.')
        return '£' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
}

app.component(Button.name, Button);
app.component(HasError.name, HasError);
app.component(AlertError.name, AlertError);
app.component(AlertErrors.name, AlertErrors);
app.component(AlertSuccess.name, AlertSuccess);
app.component("Pagination", LaravelVuePagination);

app.component("VueModal", Modal);
app.component("Panel", Panel);
app.component("PaginateDropdown", PaginateDropdown);
app.component("Search", Search);
app.component("Table", Table);
app.component("AppDate", AppDate);
app.component("AppTime", AppTime);
app.component("AppLoader", AppLoader);

const options = {
  color: "#ed008c",
  failedColor: "#874b4b",
  thickness: "3px",
};

app.use(VueProgressBar, options);
app.component("v-select", vSelect);

const swalConfig = {
  confirmButtonColor: "#a0c92a",
  cancelButtonColor: "#d33",
};

app.use(VueSweetalert2, swalConfig);

app.use(Toast);

app.use(createPinia());
app.use(router);
app.mount("#app");

//Interceptors
axios.interceptors.request.use((config) => {
  app.config.globalProperties.$Progress.start();
  return config;
});

axios.interceptors.response.use((response) => {
  if (response.status >= 400) {
    app.config.globalProperties.$Progress.fail();
  }
  app.config.globalProperties.$Progress.finish();
  return response;
});
