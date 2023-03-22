<script setup>
import { onMounted, ref, inject, watch } from "vue";
import axios from "axios";
import Form from "vform";
import { Modal } from "bootstrap";
import { useFlash } from "@@/composables/useFlash";
import { useRoute, useRouter } from "vue-router";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const customers = ref([]);
const router = useRouter();
const editMode = ref(false);
const paginate = ref(10);
const search = ref("");
const baseEndpoint = "/api/accounts";
const swal = inject("$swal");
const { flash } = useFlash();
let modalID = "customersModal";
const isLoading = ref(true);
let orderBy = ref("created_at");
let sortOrder = ref("desc");

const columns = [
  {
    title: "#",
    name: "",
  },
  {
    title: "Name",
    name: "name",
    sort: true,
  },
  {
    title: "Email",
    name: "email",
    sort: true,
  },
  {
    title: "Phone",
    name: "phone",
  },
  {
    title: "Company",
    name: "company",
    sort: true,
  },
  {
    title: "Balance",
    name: "balance",
    sort: true,
  },
  {
    title: "Action",
    name: "",
    class: "text-center",
  },
];

const form = ref(
  new Form({
    id: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    balance: 0.0,
    account_type: "customer",
  })
);

let modal = null;

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getCustomers();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getCustomers();
  }
);

// Methods
const getCustomers = async (page = 1) => {
  isLoading.value = true;
  const {data: response} = await axios.get(baseEndpoint, {
    params: {
      page: page,
      type: form.value.account_type,
      paginate: paginate.value,
      search: search.value,
      sortOrder: sortOrder.value,
      orderBy: orderBy.value,
    },
  });
  customers.value = response;
  isLoading.value = false;
};
const create = () => {
  editMode.value = false;
  form.value.reset();
  modal.show();
};
const store = () => {
  form.value
    .post(baseEndpoint)
    .then((response) => {
      if (response.data.status == "success") {
        modal.hide();
        flash(response.data.message);
        getCustomers();
      }
    })
    .catch((error) => console.log(error));
};

const edit = async (id) => {
  editMode.value = true;
  const response = await axios.get(`${baseEndpoint}/${id}`);
  form.value.fill(response.data.data);
  modal.show();
};

const update = async () => {
  form.value
    .patch(`${baseEndpoint}/${form.value.id}`)
    .then((response) => {
      if (response.data.status == "success") {
        modal.hide();
        getCustomers();
        editMode.value = false;
        flash(response.data.message);
      }
    })
    .catch((error) => console.log(error));
};

const destroy = async (id) => {
  swal
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    })
    .then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${baseEndpoint}/${id}`)
          .then((response) => {
            if (response.data.status == "success") {
              getCustomers();
              flash(response.data.message);
            } else {
              flash(response.data.message);
            }
          })
          .catch((error) => console.log(error));
      }
    });
};

const show = async (id) => {
  router.push({ name: "customers.show", params: { id: id } });
};

const handleSort = (col) => {
  orderBy.value = col;
  sortOrder.value = sortOrder.value == "desc" ? "asc" : "desc";
  getCustomers();
};

const handleSubmit = () => {
  editMode.value ? update() : store();
};

const handleExportClick = async () => {
  const response = await axios.get(
    `/api/customers` + "/export?search=" + search.value,
    {
      // If you forget this, your download will be corrupt.
      responseType: "blob",
    }
  );
  //Let's create a link in the document that we'll
  // programmatically 'click'.
  const link = document.createElement("a");

  // Tell the browser to associate the response data to
  // the URL of the link we created above.
  link.href = window.URL.createObjectURL(new Blob([response.data]));

  // Tell the browser to download, not render, the file.
  link.setAttribute("download", "customers.xlsx");

  // Place the link in the DOM.
  document.body.appendChild(link);

  // Make the magic happen!
  link.click();
};

// Hooks
onMounted(() => {
  getCustomers();
  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Customers</h1>
      <div>
        <button
          v-if="can('customer-add')"
          type="button"
          class="btn btn-primary"
          @click="create"
        >
          Add Customer
        </button>
        <button
          v-if="can('customer-view')"
          class="btn btn-lg btn-info ms-3"
          @click="handleExportClick"
        >
          <i class="fa fa-download"></i>
          Export to Excel
        </button>
      </div>
    </template>
    <div class="mb-3 row">
      <div class="align-items-center col d-flex">
        <label class="d-inline-block me-2 fw-bold"> Show </label>
        <select v-model="paginate" class="form-select w-auto">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
      <div class="col"></div>
      <div class="align-items-center col d-flex">
        <label class="d-inline-block me-2 fw-bold" for="search"> Search </label>
        <input
          type="search"
          v-model.trim.lazy="search"
          class="form-control"
          id="search"
        />
      </div>
    </div>

    <div v-if="!isLoading">
      <div class="table-responsive">
      <table class="table table-striped-table-bordered table-hover">
        <thead class="bg-primary text-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Orders</th>
            <th>Spending</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(customer, index) in customers.data" :key="customer.id">
            <td>{{ index + 1 }}</td>
            <td>{{ customer.name }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phone }}</td>
            <td>{{ customer.company }}</td>
            <td>{{ customer.sales_count }}</td>
            <td>{{ customer.sales_amount }}</td>
            <td>
              <div>
                <router-link
                  v-if="can('customer-view')"
                  class="btn btn-sm btn-primary me-1 mb-1"
                  :to="{ name: 'customers.show', params: { id: customer.id } }"
                >
                  <i class="mr-1 fa fa-eye"></i>
                </router-link>
                <a
                  v-if="can('customer-edit')"
                  class="btn btn-sm btn-info me-1 mb-1"
                  @click.prevent="edit(customer.id)"
                >
                  <i class="mr-1 fa fa-pencil"></i>
                </a>
                <!--
                <a v-if="can('customer-trash')"
                  class="btn btn-sm btn-danger me-1 mb-1"
                  @click.prevent="destroy(customer.id)"
                >
                  <i class="mr-1 fa fa-trash"></i>
                </a>
                 <a
                  class="btn btn-sm btn-secondary me-1 mb-1"
                  @click.prevent="ledger(customer.id)"
                >
                  <i class="fa fa-book"></i>
                </a> -->
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
    <div v-else class="text-center">
      <h3>Loading...</h3>
    </div>
    <template #footer v-if="!isLoading">
      <Pagination :data="customers" @pagination-change-page="getCustomers" />
      <div class="text-center">
        <small>
          Showing {{ customers.meta.from }} to {{ customers.meta.to }} of
          {{ customers.meta.total }}
        </small>
      </div>
    </template>
  </Panel>

  <VueModal :id="modalID" @onSubmit="handleSubmit">
    <template #title> {{ editMode ? "Edit" : "Add" }} Customer </template>
    <div class="mb-3">
      <label class="form-label" for="name">Name:</label>
      <input
        v-model="form.name"
        type="text"
        class="form-control"
        id="name"
        required
      />
      <HasError :form="form" field="name" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="email">Email:</label>
      <input
        v-model="form.email"
        type="email"
        class="form-control"
        id="email"
      />
      <HasError :form="form" field="email" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="phone">Phone:</label>
      <input
        v-model="form.phone"
        type="tel"
        required
        class="form-control"
        id="phone"
      />
      <HasError :form="form" field="phone" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="company">Company:</label>
      <input
        v-model="form.company"
        type="text"
        class="form-control"
        id="company"
      />
      <HasError :form="form" field="company" />
    </div>
    <template #footer>
      <Button :form="form" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
