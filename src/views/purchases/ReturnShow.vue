<script setup>
import purchaseReturnService from "@@/services/PurchaseReturnService";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";

// Data
const route = useRoute();
const purchaseReturn = ref({});
let isLoaded = ref(false);

// Methods
const getPurchaseReturn = async () => {
  const { data: response } = await purchaseReturnService.getPurchaseReturn(
    route.params.id
  );
  purchaseReturn.value = response.data;
};

const displayDueAmount = computed(()=>{
  let received_amount = parseFloat(purchaseReturn.value.received_amount);
  let purchase_return_amount = parseFloat(purchaseReturn.value.purchase_return_amount);

  if(received_amount < purchase_return_amount) {
    return purchase_return_amount - received_amount
  } 
  return false
  
});

// Hooks
onMounted(async () => {
  await getPurchaseReturn();
  isLoaded.value = true;
});
</script>

<template>
  <div v-if="isLoaded">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">
          Purchase Return Details ( Invoice No. :
          {{ purchaseReturn.purchase.id }})
        </h1>
        <router-link
          class="btn btn-primary"
          :to="{ name: 'purchases.return.index' }"
        >
          All Purchase Return
        </router-link>
      </template>
    </Panel>
    <div class="card border-primary">
      <div class="card-body">
        <div class="row">
          <div class="col mb-3">
            <label class="form-label" for="date"
              ><strong>Invoice No:</strong></label
            >
            <p>#{{ purchaseReturn.purchase.id }}</p>
            <p>
              <b>Payment Status:</b>
              <span
                class="badge bg-success mx-1 text-capitalize"
                :class="
                  ({ 'bg-success': purchaseReturn.payment_status === 'paid' },
                  { 'bg-danger': purchaseReturn.payment_status === 'due' })
                "
                >{{ purchaseReturn.payment_status }}</span
              >
            </p>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date"
                ><strong>Supplier Name:</strong></label
              >
              <p>{{ purchaseReturn.purchase.account.name }}</p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date"
                ><strong>Return Date:</strong></label
              >
              <p><AppDate :timestamp="purchaseReturn.date" /></p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date"
                ><strong>Purchase Date:</strong></label
              >
              <p><AppDate :timestamp="purchaseReturn.purchase.date" /></p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                ><strong>Before Return:</strong></label
              >
              {{ purchaseReturn.purchase_amount_before_return }}
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                ><strong>After Return</strong></label
              >
              {{ purchaseReturn.purchase_amount_after_return }}
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                ><strong>Return Amount</strong></label
              >
              <span >{{
                purchaseReturn.purchase_return_amount
              }}</span>
            </div>
             <div class="mb-3 d-flex justify-content-between mb-3" v-if="displayDueAmount">
              <label class="form-label me-2" for="date"
                ><strong>Due Amount</strong></label
              >
              <span class="text-danger fw-bold">{{
               displayDueAmount
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer text-muted text-end">
        <router-link
          class="btn btn-info btn-sm"
          :to="{
            name: 'purchase.return.print',
            params: { id: purchaseReturn.id },
          }"
          target="_blank"
        >
          <i class="fa fa-print"></i> &nbsp; Print Invoice
        </router-link>
      </div>
    </div>

    <div class="card border-primary">
      <div class="card-header">
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h3 mb-0 text-middle">Products</h1>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table
            class="card-1 mb-0 table table-bordered table-hover table-striped"
          >
            <thead class="bg-primary text-light text-center">
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity Before Return</th>
                <th>Return Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="text-center"
                v-for="(purchase_return_detail,
                i) in purchaseReturn.purchase_return_details"
              >
                <td>{{ i + 1 }}</td>
                <td>{{ purchase_return_detail.product.name }}</td>
                <td>{{ purchase_return_detail.price }}</td>
                <td>{{ purchase_return_detail.quantity_before_return }}</td>
                <td class="text-danger">
                  {{ purchase_return_detail.quantity_return }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer text-muted"></div>
    </div>
  </div>
</template>
