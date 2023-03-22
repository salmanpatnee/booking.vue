<script setup>
import salesReturnService from "@@/services/SalesReturnService";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

// Data
const route = useRoute();
const saleReturn = ref({});
let isLoaded = ref(false);

// Methods
const getSaleReturn = async () => {
  const { data: response } = await salesReturnService.getSaleReturn(
    route.params.id
  );
  saleReturn.value = response.data;
};

// Hooks
onMounted(async () => {
  await getSaleReturn();
  isLoaded.value = true;
});
</script>

<template>
  <div v-if="isLoaded">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">
          Sales Return Details ( Invoice No. : {{ saleReturn.id }})
        </h1>
        <router-link
          class="btn btn-primary"
          :to="{ name: 'sales.return.index' }"
        >
          All Sales Return
        </router-link>
      </template>
    </Panel>
    <div class="card border-primary">
      <div class="card-body">
        <div class="row">
          <div class="col mb-3">
            <div>
              <label class="form-label" for="date"
              ><strong>Invoice No:</strong></label
            >
            <p>#{{ saleReturn.id }}</p>
            </div>
            <div>
              <label class="form-label" for="date"
              ><strong>Sale Invoice No:</strong></label
            >
            <p><router-link
                  
      
                  :to="{ name: 'sales.show', params: { id: saleReturn.sale.id } }"
                >
                {{ saleReturn.sale.id }}
                </router-link>
               </p>
            </div>
            
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date"
                ><strong>Customer Name:</strong></label
              >
              <p>{{ saleReturn.sale.account.name }}</p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date"
                ><strong>Return Date:</strong></label
              >
              <p><AppDate :timestamp="saleReturn.date" /></p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3">
              <label class="form-label" for="date"
                ><strong>Sale Date:</strong></label
              >
              <p><AppDate :timestamp="saleReturn.sale.date" /></p>
            </div>
          </div>
          <div class="col">
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                ><strong>Before Return:</strong></label
              >
              {{ saleReturn.sale_amount_before_return }}
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                ><strong>After Return</strong></label
              >
              {{ saleReturn.sale_amount_after_return }}
            </div>
            <div class="mb-3 d-flex justify-content-between mb-3">
              <label class="form-label me-2" for="date"
                ><strong>Return Amount</strong></label
              >
              <span class="text-danger">{{
                saleReturn.sale_return_amount
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer text-muted text-end">
        <router-link
          class="btn btn-info btn-sm"
          :to="{ name: 'sales.return.print', params: { id: saleReturn.id } }"
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
                v-for="(
                  sales_return_detail, i
                ) in saleReturn.sales_return_details"
              >
                <td>{{ i + 1 }}</td>
                <td>{{ sales_return_detail.product.name }}</td>
                <td>{{ sales_return_detail.price }}</td>
                <td>{{ sales_return_detail.quantity_before_return }}</td>
                <td class="text-danger">
                  {{ sales_return_detail.quantity_return }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer text-muted"></div>
    </div>
  </div>

  <!-- <div class="card border-primary">
        <div class="card-header">
            <div class="d-flex align-items-center justify-content-between">
                <h1 class="h3 mb-0 text-middle">Discount</h1>
            </div>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col">
                    <div class="mb-3">
                        <label class="form-label" for="discount_type">Discount Type:</label>
                        <p>
                            <b>
                                {{ saleReturn.discount_type ? discount_type : 'Not applied' }}
                            </b>
                        </p>
                    </div>
                </div>
                <div class="col">
                    <div class="mb-3">
                        <label class="form-label" for="discount_rate">Discount Amount:</label>
                        <p><b>{{ saleReturn.discount_amount }}</b></p>
                    </div>
                </div>
                <div class="align-items-center col d-flex justify-content-end text-end">
                    <label> <b>Discount:</b>(-) {{ form.discount_amount }} </label>
                </div>
            </div>
        </div>
        <div class="card-footer text-muted">
           
    </div>
    </div> -->
</template>
