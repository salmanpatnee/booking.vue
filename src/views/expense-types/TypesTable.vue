<script setup>
import { useCan } from "@@/composables/useCan";

const { can } = useCan();

const props = defineProps({
  types: Array,
  sortColumn: Object,
});

const columns = [
  { path: "#", label: "#" },
  { path: "name", label: "Name", sortable: true },
  { path: "", label: "Action" },
];
</script>

<template>
  <Table
    :columns="columns"
    :data="types"
    :sortColumn="sortColumn"
    @onSort="$emit('onSort', sortColumn)"
  >
    <template #action="{ id }">
      <button
        v-if="can('expense-edit')"
        @click="$emit('onEdit', id)"
        class="btn btn-sm btn-info me-1"
      >
        <i class="fa fa-edit"></i>
      </button>
      <button
        v-if="can('expense-delete')"
        @click="$emit('onDelete', id)"
        class="btn btn-sm btn-danger"
      >
        <i class="fa fa-trash"></i>
      </button>
    </template>
  </Table>
</template>
