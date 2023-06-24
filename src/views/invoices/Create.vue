<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Form from "vform";
import moment from "moment";
import { useFlash } from "@@/composables/useFlash";
import { v4 as uuidv4 } from "uuid";

// Data
const baseEndpoint = "/api/invoices";
const { flash } = useFlash();
const router = useRouter();

const form = ref(
  new Form({
    invoice_no: "",
    client_name: "",
    phone: "",
    date: moment().format("YYYY-MM-DD"),
    notes: "",
    invoice_item_details: [],
  })
);

// Methods
const handleAddInvoiceItem = (index) => {
  const newInvoiceItem = {
    id: uuidv4(),
    item: "",
    amount: null,
    qty: 1,
    vat: null,
    sub_total: "",
    net_total: "",
  };
  form.value.invoice_item_details.push(newInvoiceItem);
};

const handleDeleteInvoiceItem = (booingItem) => {
  form.value.invoice_item_details = form.value.invoice_item_details.filter(
    (q) => q.id !== booingItem.id
  );
};

const handleSubmit = async () => {
  try {
    const { data: response } = await form.value.post(`/api/booking-list`);

    if (response.status == "success") {
      form.value.reset();
      selectedCustomer.value = "";

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
    }
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  const newInvoiceItem = {
    id: uuidv4(),
    item: "",
    amount: null,
    qty: 1,
    vat: null,
    sub_total: "",
    net_total: "",
  };
  form.value.invoice_item_details.push(newInvoiceItem);
})

</script>

<template>
  <form @submit.prevent="handleSubmit">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">Create Invoice</h1>
      </template>
      <div class="row mt-5">
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="reference_number"
              ><b>Invoice No:</b></label
            >
            <input
              type="text"
              class="form-control"
              v-model="form.invoice_no"
              id="invoice_no"
              required
            />
            <small>Leave empty to generate automatically.</small>
            <HasError :form="form" field="invoice_no" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="reference_number"
              ><b>Client Name:</b></label
            >
            <input
              type="text"
              class="form-control"
              v-model="form.client_name"
              id="client_name"
              required
            />
            <HasError :form="form" field="client_name" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="phone"><b>Phone:</b></label>
            <input
              type="tel"
              class="form-control"
              v-model="form.phone"
              id="phone"
              required
            />
            <HasError :form="form" field="phone" />
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label" for="date"><b>Date:</b></label>
            <input
              type="date"
              class="form-control"
              v-model="form.date"
              id="date"
              required
            />
            <HasError :form="form" field="date" />
          </div>
        </div>
      </div>
      <div class="mt-5">
        <div class="d-flex justify-content-between mt-4 mb-4">
          <h3>Invoice Details</h3>
        </div>
        <hr />

        <div class="mb-5">
          <div class="table-responsive">
            <table
              class="card-1 mb-0 table table-bordered table-hover table-striped"
            >
              <thead class="bg-primary text-light">
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Qty</th>
                  <th>VAT</th>
                  <th>Total</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.invoice_item_details" :key="item.id">
                  <td>{{index + 1}}</td>
                  <td>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="" v-model="item.item"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      class="form-control"
                      placeholder="" v-model="item.amount"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      class="form-control"
                      placeholder="" v-model="item.qty"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      class="form-control" v-model="item.vat"
                      placeholder=""
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      class="form-control readonly"
                      placeholder="" readonly v-model="item.total"
                    />
                  </td>
              
                  <td class="text-center">
                    <button
                      @click="handleDeleteInvoiceItem(item)"
                      type="button"
                      class="btn btn-sm btn-danger"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="text-end mt-4">
              <button
                v-if="!form.invoice_item_details.length"
                type="button"
                @click="handleAddInvoiceItem()"
                class="btn btn-primary"
              >
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>
 
          <div class="text-end" v-if="form.invoice_item_details.length">
            <button
              @click="handleAddInvoiceItem(index)"
              type="button"
              class="btn btn-primary me-2"
            >
              <i class="fa fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="text-end">
          <Button
            :form="form"
            :disabled="!form.invoice_item_details.length"
            class="btn btn-lg btn-primary"
            >Save</Button
          >
        </div>
      </template>
    </Panel>
  </form>
</template>
