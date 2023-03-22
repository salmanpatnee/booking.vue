<script setup>
import { onMounted, ref, inject, watch } from "vue";
import axios from "axios";
import Form from "vform";
import { Modal } from "bootstrap";
import { useFlash } from "@@/composables/useFlash";
import { useCan } from "@@/composables/useCan";

// Data
const { flash } = useFlash();
const roles = ref([]);
const { can } = useCan();
const editMode = ref(false);
const paginate = ref(10);
const search = ref("");
const baseEndpoint = "/api/roles";
const swal = inject("$swal");
let modalID = "rolesModal";

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
    getRoles();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getRoles();
  }
);

const handleSubmit = () => {
  editMode.value ? update() : store();
};
// Methods
const getRoles = async (page = 1) => {
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
  roles.value = response.data.data;
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
        getRoles();
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
        getRoles();
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
              getRoles();
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
  getRoles();
};
// Hooks
onMounted(() => {
  getRoles();
  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <div class="card border-primary">
    <div class="card-header">
      <div class="d-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-middle">Roles</h1>
        <router-link
          v-if="can('role-add')"
          class="btn btn-primary"
          :to="{ name: 'roles.create' }"
        >
          Add Role
        </router-link>
      </div>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table
          class="card-1 mb-0 table table-bordered table-hover table-striped"
        >
          <thead class="bg-primary text-bg-dark">
            <tr>
              <td>#</td>
              <td>Name</td>
              <td class="text-center">Action</td>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(role, index) in roles" :key="role.id">
              <td>{{ index + 1 }}</td>
              <td>{{ role.name }}</td>
              <td>
                <div class="text-center">
                  <router-link
                    v-if="can('role-edit')"
                    class="btn btn-sm btn-info me-1 mb-1"
                    :to="{ name: 'roles.edit', params: { id: role.id } }"
                  >
                    <i class="mr-1 fa fa-pencil"></i>
                  </router-link>
                  <!-- <a
                    class="btn btn-sm btn-danger me-1 mb-1"
                    @click.prevent="destroy(role.id)"
                  >
                    <i class="mr-1 fa fa-trash"></i>
                  </a> -->
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-footer text-muted">
      <Pagination :data="roles" @pagination-change-page="getRoles" />
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
