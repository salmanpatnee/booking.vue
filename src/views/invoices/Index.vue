<script setup>
import axios from "axios";
import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

let baseEndpoint = `/api/invoices`;

const router = useRouter();

const editMode = ref(false);

import moment from "moment";
import Form from "vform";

const invoiceForm = ref(
  new Form({
    id: "",
    invoice_no: "",
    client_name: "",
    client_email: "",
    description: "",
    vat: "",
    total: "",
    net_total: "",
    date: moment().format("YYYY-MM-DD"),
  })
);

const displaynet_totalAmount = computed(() => {
  if (invoiceForm.value.total != "" && invoiceForm.value.vat != "") {
    return (
      (invoiceForm.value.total * invoiceForm.value.vat) / 100 +
      invoiceForm.value.total
    );
  }
  return invoiceForm.value.total;
});

watch(
  () => displaynet_totalAmount.value,
  (newVal, preVal) => (invoiceForm.value.net_total = newVal)
);


const invoices = ref({
  isLoading: true,
  data: [],
});

const search = ref("");

watch(
  () => search.value,
  (search, prevCount) => {
    fetchInvoices();
  }
);

const fetchInvoices = async (page) => {
  invoices.value.isLoading = true;
  try {
    const response = await axios.get(baseEndpoint, {
      params: {
        page,
        search: search.value,
      },
    });

    invoices.value.data = response.data;
  } catch (error) {}
  invoices.value.isLoading = false;
};

onMounted(async () => {
  await fetchInvoices();

});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Invoices</h1>
      <div class="d-flex">
        <router-link class="btn btn-primary" :to="{name: 'invoices.create'}">
          New Invoice
        </router-link>
      </div>
    </template>
    <div class="mb-3 row">
      <div class="col"></div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <Search v-model="search" />
      </div>
    </div>
    <div class="table-responsive" v-if="!invoices.isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Total</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoice, index) in invoices.data.data" :key="invoice.id">
            <td>{{ index + 1 }}</td>
            <td>{{ invoice.invoice_no }}</td>
            <td><AppDate :timestamp="invoice.date" /></td>
            <td>{{ invoice.client_name }}</td>
            <td>{{ invoice.phone }}</td>
            <td>{{ $filters.currencyPound(invoice.net_total) }}</td>
            <td class="text-center">
              <!-- <button
                class="btn btn-sm btn-outline-info me-2"
                type="button"
                @click="showEditModal(invoice)"
              >
                <i class="fa fa-pencil"></i>
              </button> -->
              <router-link
                class="btn btn-sm btn-outline-warning me-2"
                target="_blank"
                :to="{ name: 'invoices.print', params: { id: invoice.id } }"
              >
                <i class="fa fa-print"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <AppLoader />
    </div>

    <template #footer v-if="!invoices.isLoading">
      <Pagination
        :data="invoices.data"
        @pagination-change-page="fetchInvoices"
      />
      <div class="text-center">
        <small>
          Showing {{ invoices.data.meta.from }} to
          {{ invoices.data.meta.to }} of
          {{ invoices.data.meta.total }}
        </small>
      </div>
    </template>
  </Panel>

  
</template>
