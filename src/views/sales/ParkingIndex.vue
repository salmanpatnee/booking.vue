<script setup>
import http from "@@/services/HttpService";
import { onMounted, ref, inject, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useCan } from "@@/composables/useCan";
import { useFlash } from "@@/composables/useFlash";

// Data
const { flash, confirmAtts } = useFlash();
const router = useRouter();
const { can } = useCan();
const sales = ref([]);
const paginate = ref(25);
const search = ref("");
const baseEndpoint = "/api/sales";
let orderBy = ref("created_at");
let sortOrder = ref("desc");
let start_date = ref("");
let end_date = ref("");
const isLoading = ref(true);
const swal = inject("$swal");

const columns = [
  {
    title: "#",
    name: "",
  },
  {
    title: "Date",
    name: "date",
    sort: true,
  },
  {
    title: "Products Count",
    name: "products_count",
    sort: true,
  },
  {
    title: "Amount",
    name: "net_amount",
    sort: true,
  },
  {
    title: "Action",
    name: "",
    class: "text-center",
  },
];

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getSales();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getSales();
  }
);

// Methods
const getSales = async (page = 1) => {
  isLoading.value = true;
  const response = await axios.get(
    baseEndpoint +
      "?page=" +
      page +
      "&status=ordered" +
      "&paginate=" +
      paginate.value +
      "&search=" +
      search.value +
      "&sortOrder=" +
      sortOrder.value +
      "&orderBy=" +
      orderBy.value +
      "&start_date=" +
      start_date.value +
      "&end_date=" +
      end_date.value
  );
  sales.value = response.data.data;
  isLoading.value = false;
};

const handleFilterSales = async () => {
  await getSales();
};

const handleReceivePayment = async (id) => {
  try {
    const {data: response} = await http.put(`/api/sales-shipment/${id}`);
    if(response.status === "success"){
      flash(response.message);
      await getSales();
    }
  } catch (error) {
    console.log({ error });
  }
};

const handleSort = (col) => {
  orderBy.value = col;
  sortOrder.value = sortOrder.value == "desc" ? "asc" : "desc";
  getSales();
};

const handleShow = (id) => {
  router.push({ name: "sales.show", params: { id: id } });
};

const handleReturn = (id) => {
  router.push({ name: "sales.return", params: { id: id } });
};

const handleDelete = async (id) => {

  const originalSales = sales.value.data;

  sales.value.data = originalSales.filter(
    (sale) => sale.id !== id
  );

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      
      const { data: response } = await http.delete(`/api/sales/${id}`);
      if (response.status === "success") flash(response.message);
    } else sales.value.data = originalSales;
  } catch (error) {
    sales.value.data = originalSales;
    flash("An unexpected error occurred.", "error");
  }
};
// Hooks
onMounted(() => {
  getSales();
});
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
          @click="handleFilterSales"
          class="btn btn-primary"
        >
          Filter
        </button>
      </div>
    </div>
  </Panel>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Parking</h1>
      <router-link
        v-if="can('pos-manage')"
        class="btn btn-primary"
        :to="{ name: 'pos.create' }"
      >
        <i class="fa fa-arrow-circle-left" aria-hidden="true"></i> Back to POS
      </router-link>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <label class="d-inline-block me-2 fw-bold">
          Show
        </label>
        <select v-model="paginate" class="form-select w-auto">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <label class="d-inline-block me-2 fw-bold" for="search">
          Search
        </label>
        <input
          type="search"
          v-model.trim.lazy="search"
          class="form-control"
          id="search"
        />
      </div>
    </div>

    <div class="table-responsive" v-if="!isLoading">
      <table class="table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Invoice No</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>

            <th class="text-center" style="width: 160px;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sale, index) in sales.data" :key="sale.id">
            <td>{{ index + 1 }}</td>
            <td>
              <AppDate :timestamp="sale.date" /><br/>
              <AppTime :timestamp="sale.created_at" />
            </td>
            <td>
              <router-link
                :to="{ name: 'sales.show', params: { id: sale.id } }"
              >
                {{ sale.id }}
              </router-link>
            </td>
            <td>{{ sale.account.name }}</td>
            <td>
              <span
                class="text-capitalize badge"
                :class="{
                  'bg-info': sale.status == 'ordered',
                  'bg-warning': sale.status == 'draft',
                  'bg-success':
                    sale.status == 'final' || sale.status == 'completed',
                  'bg-danger': sale.status == 'returned',
                }"
                >{{ sale.status }}</span
              >
            </td>
            <td>{{ sale.net_amount }}</td>

            <td>
              <div class="text-center">
                <router-link
                  class="btn btn-success btn-sm me-1 mb-1"
                  :to="{ name: 'sales.show', params: { id: sale.id } }"
                  ><i class="mr-1 fa fa-eye"></i>
                </router-link>
                <!-- <router-link
                  class="btn btn-info btn-sm me-1 mb-1"
                  :to="{ name: 'sales.edit', params: { id: sale.id } }"
                  ><i class="mr-1 fa fa-pencil"></i>
                </router-link> -->
                <router-link
                  class="btn btn-warning btn-sm me-1 mb-1"
                  target="_blank"
                  :to="{
                    name: 'sales.proceed.invoice',
                    params: { id: sale.id },
                  }"
                >
                  <i class="mr-1 fa fa-print"></i>
                </router-link>
                <button
                  @click="handleReceivePayment(sale.id)"
                  v-if="
                    sale.is_deliverable && sale.shipping_status == 'shipped'
                  "
                  class="btn btn-info btn-sm me-1 mb-1"
                >
                  <i class="mr-1 fa fa-money"></i>
                </button>
                <button
        v-if="can('sale-delete')"
        @click="handleDelete(sale.id)"
        class="btn btn-sm btn-danger me-1 mb-1"
      >
        <i class="fa fa-trash"></i>
      </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    <template #footer v-if="!isLoading">
      <Pagination :data="sales" @pagination-change-page="getSales" />
      <div class="text-center">
        <small>
          Showing {{ sales.from }} to {{ sales.to }} of
          {{ sales.total }}
        </small>
      </div>
    </template>
  </Panel>
</template>
