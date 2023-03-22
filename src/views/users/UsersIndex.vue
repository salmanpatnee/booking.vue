<script setup>
import Form from "vform";
import locationService from "@@/services/LocationService";
import roleService from "@@/services/RoleService";
import userService from "@@/services/UserService";
import { Modal } from "bootstrap";
import { useFlash } from "@@/composables/useFlash";
import { useCan } from "@@/composables/useCan";
import { onMounted, ref, inject, watch } from "vue";

// Data
const { flash, confirmAtts } = useFlash();
const { can } = useCan();
const locations = ref([]);
const roles = ref([]);
const users = ref({
  data: [],
  isLoading: true,
});
const editMode = ref(false);
const paginate = ref(25);
const search = ref("");
const swal = inject("$swal");
let modalID = "userModal";
let modal = null;

const form = ref(
  new Form({
    id: "",
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "", 
    location_id: ""
  })
);

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    search.value = "";
    getUsers();
  }
);

watch(
  () => search.value,
  (search, prevCount) => {
    getUsers();
  }
);

// Methods
const handleSubmit = () => {
  editMode.value ? update() : store();
};

const getLocations = async () => {
  const response = await locationService.getLocations();
  locations.value = response.data.data;
};

const getRoles = async () => {
  const response = await roleService.getRoles();
  roles.value = response.data.data;
};

const getUsers = async (page = 1) => {
  users.value.isLoading = true;
  const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const { data: response } = await userService.getUsers(params);
  users.value.data = response.data;
  users.value.isLoading = false;
};

const create = () => {
  editMode.value = false;
  form.value.reset();
  modal.show();
};

const store = () => {
  form.value
    .post(userService.apiEndpoint)
    .then((response) => {
      if (response.data.status == "success") {
        modal.hide();
        flash(response.data.message);
        getUsers();
      }
    })
    .catch((error) => {
      flash(error.response.data.message, 'error')
    });
};

const edit = async (id) => {
  editMode.value = true;
  const { data: response } = await userService.getUser(id);
  form.value.fill(response.data);
  form.value.role = response.data.role[0];
  modal.show();
};

const update = async () => {
  form.value
    .patch(`${userService.apiEndpoint}/${form.value.id}`)
    .then((response) => {
      if (response.data.status == "success") {
        modal.hide();
        getUsers();
        editMode.value = false;
        flash(response.data.message);
      }
    })
    .catch((error) => {
      flash(error.response.data.message, 'error')
    });
};

const destroy = async (id) => {
  const originalUsers = users.value.data;

  users.value.data = originalUsers.filter((user) => user.id !== id);

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await userService.deleteUser(id);
      if (response.status === "success") flash(response.message);
    } else users.value.data = originalUsers;
  } catch (error) {
    users.value.data = originalUsers;
    flash(error.response.data.message, 'error')
  }
};

// Hooks
onMounted(async () => {
  await getLocations();
  await getRoles();
  await getUsers();
  modal = new Modal(document.getElementById(modalID), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">All Users</h1>
      <button
        v-if="can('user-add')"
        type="button"
        class="btn btn-primary"
        @click="create"
      >
        Add New User
      </button>
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
    <div class="table-responsive" v-if="!users.isLoading">
      <table class="card-1 mb-0 table table-bordered table-hover table-striped">
        <thead class="bg-primary text-bg-dark">
          <tr>
            <td>#</td>
            <td>Name</td>
            <td>Email</td>
            <td>Location</td>
            <td>Role</td>
            <!-- <td>Status</td> -->
            <td class="text-center">Action</td>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(user, index) in users.data" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.location && user.location.name }}</td>
            <td>{{ user.role[0] }}</td>
            <!-- <td>Active</td> -->
            <td>
              <div class="text-center">
                <button
                  @click.prevent="edit(user.id)"
                  v-if="can('user-edit')"
                  class="btn btn-sm btn-info me-1 mb-1"
                >
                  <div class="fa fa-pencil"></div>
                </button>
                <button
                  @click.prevent="destroy(user.id)"
                  v-if="can('user-delete')"
                  class="btn btn-sm btn-danger me-1 mb-1"
                >
                  <div class="fa fa-trash"></div>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">
      <AppLoader/>
    </div>
    <template #footer>
      <Pagination :data="users.data" @pagination-change-page="getUsers" />
    </template>
  </Panel>

  <Teleport to="body">
    <VueModal :id="modalID" @onSubmit="handleSubmit">
      <template #title> {{ editMode ? "Edit" : "Add" }} User </template>
      <div class="mb-3">
        <label class="form-label" for="name">Name:</label>
        <input
          required
          v-model="form.name"
          type="text"
          class="form-control"
          id="name"
        />
        <HasError :form="form" field="name" />
      </div>
      <div class="mb-3">
        <label class="form-label" for="email">Email:</label>
        <input
          v-model="form.email"
          required
          type="email"
          class="form-control"
          id="email"
        />
        <HasError :form="form" field="email" />
      </div>
      <div class="mb-3">
        <label class="form-label" for="password">Password:</label>
        <input
          v-model="form.password"
          :required="!editMode"
          type="password"
          class="form-control"
          id="password"
        />
        <HasError :form="form" field="password_confirmation" />
      </div>
      <div class="mb-3">
        <label class="form-label" for="password_confirmation"
          >Confirm Password:</label
        >
        <input
          v-model="form.password_confirmation"
          :required="!editMode"
          type="password"
          class="form-control"
          id="password_confirmation"
        />
        <HasError :form="form" field="password_confirmation" />
      </div>
      <div class="mb-3">
        <label class="form-label" for="location_id">Location:</label>
        <select v-model="form.location_id" class="form-control" id="location_id" required>
          <option value="">Select a Location</option>
          <option v-for="location in locations" :value="location.id" :key="location.id">
            {{ location.name }}
          </option>
        </select>
        <HasError :form="form" field="location_id" />
      </div>
      <div class="mb-3">
        <label class="form-label" for="role">Role:</label>
        <select v-model="form.role" class="form-control" id="role" required>
          <option value="">Select a Role</option>
          <option v-for="role in roles" :value="role.name" :key="role.id">
            {{ role.name }}
          </option>
        </select>
        <HasError :form="form" field="role" />
      </div>
      <template #footer>
        <Button :form="form" class="btn btn-primary">Save</Button>
      </template>
    </VueModal>
  </Teleport>
</template>
