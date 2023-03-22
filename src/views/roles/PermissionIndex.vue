<script setup>
import { onMounted, ref, inject, watch } from "vue";
import axios from "axios";
import Form from "vform";
import { Modal } from "bootstrap";
import { useFlash } from "@@/composables/useFlash";

// Data
const { flash } = useFlash();
const permissions = ref([]);
const editMode = ref(false);
const paginate = ref(10);
const search = ref("");
const baseEndpoint = "/api/permissions";
const swal = inject("$swal");
let modalID = "permissionsModal";

let orderBy = ref("created_at");
let sortOrder = ref("desc");

const form = ref(
  new Form({
    id: "",
    name: "",
  })
);

let modal = null;

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getPermissions();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getPermissions();
  }
);

const handleSubmit = () => {
  editMode.value ? update() : store();
};
// Methods
const getPermissions = async (page = 1) => {
  const response = await axios.get(
    baseEndpoint +
      "?page=" +
      page +
      "&paginate=" +
      paginate.value +
      "&search=" +
      search.value +
      "&sortOrder=" +
      sortOrder.value +
      "&orderBy=" +
      orderBy.value
  );
  permissions.value = response.data.data.data;
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
        getPermissions();
      }
    })
    .catch((error) => console.log(error));
};

const edit = async (id) => {
  editMode.value = true;
  const response = await axios.get(baseEndpoint + id);
  form.value.fill(response.data.data);
  modal.show();
};

const update = async () => {
  form.value
    .patch(baseEndpoint + form.value.id)
    .then((response) => {
      if (response.data.status == "success") {
        modal.hide();
        getPermissions();
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
          .delete(baseEndpoint + id)
          .then((response) => {
            if (response.data.status == "success") {
              getPermissions();
              flash(response.data.message);
            } else {
              flash(response.data.message);
            }
          })
          .catch((error) => console.log(error));
      }
    });
};

const handleSort = (col) => {
  orderBy.value = col;
  sortOrder.value = sortOrder.value == "desc" ? "asc" : "desc";
  getPermissions();
};
// Hooks
onMounted(() => {
  getPermissions();
  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <div class="card border-primary">
    <div class="card-header">
      <div class="d-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-middle">Permissions</h1>
        <button type="button" class="btn btn-primary" @click="create">
          Add Permission
        </button>
      </div>
    </div>
    <div class="card-body">
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

      <div class="table-responsive">
        <table
          class="card-1 mb-0 table table-bordered table-hover table-striped"
        >
          <thead class="bg-primary text-bg-dark">
            <tr>
              <td>#</td>
              <td>Name</td>
              <td>Action</td>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(role, index) in permissions" :key="role.id">
              <td>{{ index + 1 }}</td>
              <td>{{ role.name }}</td>
              <td>
                <div class="text-center">
                  <a
                    class="btn btn-sm btn-info me-1 mb-1"
                    @click.prevent="edit(customer.id)"
                  >
                    <i class="mr-1 fa fa-pencil"></i>
                  </a>
                  <a
                    class="btn btn-sm btn-danger me-1 mb-1"
                    @click.prevent="destroy(customer.id)"
                  >
                    <i class="mr-1 fa fa-trash"></i>
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-footer text-muted">
      <Pagination
        :data="permissions"
        @pagination-change-page="getPermissions"
      />
    </div>
  </div>

  <VueModal :id="modalID" @onSubmit="handleSubmit">
    <template #title> {{ editMode ? "Edit" : "Add" }} Role </template>
    <div class="mb-3">
      <label class="form-label" for="name">Name:</label>
      <input v-model="form.name" type="text" class="form-control" id="name" />
      <HasError :form="form" field="name" />
    </div>
    <template #footer>
      <Button :form="form" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
