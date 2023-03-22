<script setup>
import { Modal } from "bootstrap";
import Form from "vform";
import { onMounted, ref, inject, watch } from "vue";
import locationService from "@@/services/LocationService";
import { useFlash } from "@@/composables/useFlash";
import LocationsTable from "./LocationsTable.vue";
import { useCan } from "@@/composables/useCan";

// Data
const { can } = useCan();
const locations = ref([]);
const editMode = ref(false);
const paginate = ref(10);
const search = ref("");
const swal = inject("$swal");
const { flash, confirmAtts } = useFlash();

const form = ref(
  new Form({
    id: "",
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
  })
);

let modal = null;

watch(
  () => paginate.value,
  (paginate, prevCount) => {
    getLocations();
  }
);
watch(
  () => search.value,
  (search, prevCount) => {
    getLocations();
  }
);

// Methods
const handleSubmit = () => {
  editMode.value ? update() : store();
};

const getLocations = async (page = 1) => {
  // const params = `?page=${page}&paginate=${paginate.value}&search=${search.value}`;
  const { data: response } = await locationService.getLocations();
  locations.value = response.data;
};

const handleCreate = () => {
  editMode.value = false;
  form.value.reset();
  modal.show();
};

const store = async () => {
  try {
    const { data: response } = await form.value.post(
      locationService.apiEndpoint
    );

    if (response.status == "success") {
      modal.hide();
      getLocations();
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleEdit = async (id) => {
  editMode.value = true;
  const { data: response } = await locationService.getLocation(id);
  form.value.fill(response.data);
  modal.show();
};

const update = async () => {
  try {
    const { data: response } = await form.value.put(
      `${locationService.apiEndpoint}/${form.value.id}`
    );

    if (response.status == "success") {
      modal.hide();
      getLocations();
      editMode.value = false;
      flash(response.message);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (id) => {
  const originalLocations = locations.value;

  locations.value = originalLocations.filter((location) => location.id !== id);

  try {
    const { isConfirmed } = await swal.fire(confirmAtts());
    if (isConfirmed) {
      const { data: response } = await locationService.deleteLocation(id);
      if (response.status === "success") flash(response.message);
    } else locations.value = originalLocations;
  } catch (error) {
    locations.value = originalLocations;
    console.log(error);
    flash("An unexpected error occurred.", "error");
  }
};

// Hooks
onMounted(async () => {
  await getLocations();
  modal = new Modal(document.getElementById("locationsModal"), {
    keyboard: false,
  });
});
</script>

<template>
  <Panel>
    <template #header>
      <h1 class="h3 mb-0 text-middle">Locations</h1>
      <button v-if="can('location-add')" type="button" class="btn btn-primary" @click="handleCreate">
        Add Location
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
    <LocationsTable
      :locations="locations"
      :sortColumn="sortColumn"
      @onEdit="handleEdit"
      @onDelete="handleDelete"
      @onSort="handleSort"
    />

    <!-- <template #footer>
      <Pagination :data="locations" @pagination-change-page="getLocations" />
    </template> -->
  </Panel>

  <VueModal id="locationsModal" @onSubmit="handleSubmit">
    <template #title>
      <h5 class="fw-bold modal-title text-light" id="exampleModalLabel">
        {{ editMode ? "Edit" : "Add" }} Location
      </h5>
    </template>
    <div class="mb-3">
      <label class="form-label" for="name">Name:</label>
      <input v-model="form.name" type="text" class="form-control" id="name" required/>
      <HasError :form="form" field="name" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="address">Address:</label>
      <input v-model="form.address" type="text" class="form-control" id="address" required/>
      <HasError :form="form" field="address" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="city">City:</label>
      <input v-model="form.city" type="text" class="form-control" id="city" required/>
      <HasError :form="form" field="city" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="phone">Phone:</label>
      <input v-model="form.phone" type="tel" class="form-control" id="phone" required/>
      <HasError :form="form" field="phone" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="email">Email:</label>
      <input v-model="form.email" type="email" class="form-control" id="email" />
      <HasError :form="form" field="email" />
    </div>
    <template #footer>
      <Button :form="form" class="btn btn-primary">Save</Button>
    </template>
  </VueModal>
</template>
