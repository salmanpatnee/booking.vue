<script setup>
import axios from "axios";
import { onMounted, ref, inject, computed, watch } from "vue";

let baseEndpoint = `/api/invoices`;

import { Modal } from "bootstrap";
let modal = null;
let modalID = "invoiceModal";
const showInvoiceModal = () => modal.show();

import moment from "moment";
import Form from "vform";

const invoiceForm = ref(
  new Form({
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

const swal = inject("$swal");
const generateInvoice = async () => {
  try {
    const { data: response } = await invoiceForm.value.post(baseEndpoint);

    if (response.status == "success") {
      invoiceForm.value.reset();
      modal.hide();
      swal
        .fire({
          title: "Success!",
          text: "Do You Want To Print ?",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Yes!",
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            let routeData = router.resolve({
              name: "bookings.proceed.invoice",
              params: { id: response.data.id },
            });
            window.open(routeData.href, "_blank");
          }
          router.push({ name: "booking.items.index" });
        });

        await fetchInvoices();
    }
  } catch (error) {
    console.log(error);
  }
};

const invoices = ref({
  isLoading: true,
  data: [],
});

const fetchInvoices = async (page) => {
  invoices.value.isLoading = true;
  try {
    const response = await axios.get(baseEndpoint, {
      params: {
        page,
      },
    });

    invoices.value.data = response.data;
  } catch (error) {}
  invoices.value.isLoading = false;
};

onMounted(async () => {
  await fetchInvoices();

  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Invoices</h1>
      <button @click="showInvoiceModal" type="button" class="btn btn-primary">
        New Invoice
      </button>
    </template>

    <div class="table-responsive" v-if="!invoices.isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Customer Name</th>
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
            <td>{{  $filters.currencyPound(invoice.net_total) }}</td>
            <td class="text-center">
              <router-link class="btn btn-sm btn-outline-info me-2" :to="{}">
                <i class="fa fa-pencil"></i>
              </router-link>
              <router-link class="btn btn-sm btn-outline-warning me-2" :to="{}">
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

  <VueModal :id="modalID" @onSubmit="generateInvoice">
    <template #title>
      Generate Invoice
    </template>

    <div class="row mb-3">
      <div class="col">
        <label class="form-label" for="invoice_no"><b>Invoice No:</b></label>
        <input
          type="text"
          class="form-control"
          id="invoice_no"
          v-model="invoiceForm.invoice_no"
        />
        <p>Leave empty to generate automatically.</p>
      </div>
    </div>
    
    <div class="row mb-3">
      <div class="col">
        <label class="form-label" for="client_name"><b>Client Name:</b></label>
        <input
          type="text"
          class="form-control"
          id="client_name"
          v-model="invoiceForm.client_name"
        />
      </div>
    </div>

    <div class="row mb-3">
      <div class="col">
        <label class="form-label" for="client_email"
          ><b>Client Email:</b></label
        >
        <input
          type="email"
          class="form-control"
          id="client_email"
          v-model="invoiceForm.client_email"
        />
      </div>
    </div>

    <div class="row mb-3">
      <div class="col">
        <label class="form-label" for="description"><b>Description:</b></label>
        <textarea
          class="form-control"
          id="description"
          v-model="invoiceForm.description"
          rows="5"
        >
        </textarea>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col">
        <label class="form-label" for="vat"><b>VAT (%):</b></label>
        <input
          type="number"
          min="0"
          class="form-control"
          id="vat"
          v-model="invoiceForm.vat"
        />
      </div>
    </div>

    <div class="row mb-3">
      <div class="col">
        <label class="form-label" for="amount"><b>Amount:</b></label>
        <input
          type="number"
          min="0"
          class="form-control"
          id="amount"
          v-model="invoiceForm.total"
        />
      </div>
    </div>

    <div class="row mb-3">
      <div class="col">
        <label class="form-label readonly" for="net_total"
          ><b>Net Total:</b></label
        >
        {{ displaynet_totalAmount }}
      </div>
    </div>

    <template #footer>
      <Button :form="invoiceForm" class="btn btn-primary"
        >Generate Invoice</Button
      >
    </template>
  </VueModal>
</template>
