<script setup>
import http from "@@/services/HttpService";
import { onMounted, ref, watch } from "vue";
import salesReturnService from "@@/services/SalesReturnService";
import { useCan } from "@@/composables/useCan";
// Data
const { can } = useCan();
let start_date = ref("");
let end_date = ref("");
const salesReturn = ref([]);
const paginate = ref(20);
const search = ref("");
let orderBy = ref("created_at");
let sortOrder = ref("desc");
const isLoading = ref(true);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getSalesReturn();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getSalesReturn();
  }
);

// Methods
const getSalesReturn = async (page = 1) => {
  isLoading.value = true;
  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}&start_date=${start_date.value}&end_date=${end_date.value}`;
  const response = await salesReturnService.getSaleReturns(params);
  salesReturn.value = response.data.data;
  isLoading.value = false;
};

const handleFilterReturns = async () => {
  await getSalesReturn();
};

const handleExportClick = async () => {
  
  const response = await http.get(salesReturnService.apiEndpoint +
     
      "/export?search=" +
      search.value +
      "&start_date=" +
      start_date.value +
      "&end_date=" +
      end_date.value, {
    // If you forget this, your download will be corrupt.
    responseType: "blob",
  });
  //Let's create a link in the document that we'll
  // programmatically 'click'.
  const link = document.createElement("a");

  // Tell the browser to associate the response data to
  // the URL of the link we created above.
  link.href = window.URL.createObjectURL(new Blob([response.data]));

  // Tell the browser to download, not render, the file.
  link.setAttribute("download", "sale-returns.xlsx");

  // Place the link in the DOM.
  document.body.appendChild(link);

  // Make the magic happen!
  link.click();
};


// Hooks
onMounted(() => getSalesReturn());
</script>

<template>
    <Panel>
    <div class="row g-3">
      <div class="col">
        <div class="row">
          <label for="start_date" class="col-sm-4 fw-bold col-form-label"
            >Start Date</label
          >
          <div class="col-sm-8">
            <input
              type="date"
              id="start_date"
              v-model="start_date"
              class="form-control"
              placeholder="Start Date"
            />
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <label for="end_date" class="col-sm-4 fw-bold col-form-label"
            >End Date</label
          >
          <div class="col-sm-8">
            <input
              type="date"
              id="end_date"
              v-model="end_date"
              class="form-control"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
      <div class="col">
        <button
          type="button"
          @click="handleFilterReturns"
          class="btn btn-primary"
        >
          Filter
        </button>
      </div>
    </div>
  </Panel>

  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Sales Return</h1>
      <button class="btn btn-lg btn-info" @click="handleExportClick">
          <i class="fa fa-download"></i>
          Export to Excel
        </button>

      <!-- <router-link v-if="can('sale-return-add')"
        class="btn btn-primary"
        :to="{ name: 'sales.return.create' }"
      >
        Add Sale Return
      </router-link> -->
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <PaginateDropdown v-model="paginate" />
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <Search v-model="search" />
      </div>
    </div>

    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Invoice No</th>
            <th>Sale Invoice No</th>
            <th>Customer</th>
            <th>Amount Before Return</th>
            <th>Amount After Return</th>
            <th>Retun Amount</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sale, index) in salesReturn.data" :key="sale.id">
            <td>{{ index + 1 }}</td>
            <td>
              <AppDate :timestamp="sale.date" /><br/>
              <AppTime :timestamp="sale.created_at" />
            </td>
            <td>
              <router-link
                :to="{ name: 'sales.return.show', params: { id: sale.id } }"
              >
                {{ sale.id }}
              </router-link>
            </td>
            <td>
              <router-link
                :to="{ name: 'sales.show', params: { id: sale.sale.id } }"
              >
                {{ sale.sale.id }}
              </router-link>
            </td>
            <td>{{ sale.sale.account.name }}</td>
            <td>{{ sale.sale_amount_before_return }}</td>
            <td>{{ sale.sale_amount_after_return }}</td>
            <td>{{ sale.sale_return_amount }}</td>
            <td>
              <router-link
                class="btn btn-sm btn-primary me-1"
                :to="{ name: 'sales.return.show', params: { id: sale.id } }"
              >
                <i class="mr-1 fa fa-eye"></i>
              </router-link>
              <router-link
                class="btn btn-sm btn-info me-1"
                :to="{ name: 'sales.return.print', params: { id: sale.id } }"
                target="_blank"
              >
                <i class="mr-1 fa fa-print"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    <template #footer v-if="!isLoading">
      <Pagination
        :data="salesReturn"
        @pagination-change-page="getSalesReturn"
      />
      <div class="text-center">
        <small>
          Showing {{ salesReturn.from }} to {{ salesReturn.to }} of
          {{ salesReturn.total }}
        </small>
      </div>
    </template>
  </Panel>
</template>
