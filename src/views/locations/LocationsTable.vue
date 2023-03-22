<script setup>
import { useCan } from "@@/composables/useCan";

const { can } = useCan();

const props = defineProps({
  locations: Array,
  sortColumn: Object,
});

const columns = [
  { path: "#", label: "#" },
  { path: "name", label: "Name", sortable: true },
  { path: "address", label: "Address" },
  { path: "phone", label: "Phone" },
  { path: "", label: "Action" },
];
</script>

<template>
  <Table
    :columns="columns"
    :data="locations"
    :sortColumn="sortColumn"
    @onSort="$emit('onSort', sortColumn)"
  >
    <template #action="{id}">
      <button
        v-if="can('location-edit')"
        @click="$emit('onEdit', id)"
        class="btn btn-sm btn-info me-1"
      >
        <i class="fa fa-edit"></i>
      </button>
      <!-- <button v-if="can('location-delete')" @click="$emit('onDelete', id)" class="btn btn-sm btn-danger">
        <i class="fa fa-trash"></i>
      </button> -->
    </template>
  </Table>
</template>
