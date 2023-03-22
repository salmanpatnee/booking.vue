<script setup>
import { useCan } from "@@/composables/useCan";

const { can } = useCan();
const props = defineProps({
  suppliers: Array,
  sortColumn: Object,
});

const columns = [
  { path: "#", label: "#" },
  { path: "name", label: "Name", sortable: true },
  { path: "email", label: "Email", sortable: false },
  { path: "phone", label: "Phone", sortable: false },
  { path: "company", label: "Company", sortable: false },
  { path: "balance", label: "Balance", sortable: true },
  { path: "", label: "Action" },
];
</script>

<template>
  <Table
    :columns="columns"
    :data="suppliers"
    :sortColumn="sortColumn"
    @onSort="$emit('onSort', sortColumn)"
  >
    <template #action="{ id }">
      <div>
        <button v-if="can('supplier-view')"
          class="btn btn-sm btn-primary me-1 mb-1"
          @click.prevent="$emit('onShow', id)"
        >
          <i class="mr-1 fa fa-eye"></i>
        </button>
        <button v-if="can('supplier-edit')"
          class="btn btn-sm btn-info me-1 mb-1"
          @click.prevent="$emit('onEdit', id)"
        >
          <i class="mr-1 fa fa-pencil"></i>
        </button>
        <!-- <button class="btn btn-sm btn-danger me-1 mb-1" @click.prevent="$emit('onDelete', id)">
                    <i class="mr-1 fa fa-trash"></i>
                </button> -->
        <button v-if="can('supplier-view')"
          class="btn btn-sm btn-warning me-1 mb-1"
          @click.prevent="$emit('onViewLedger', id)"
        >
          <i class="fa fa-book"></i>
        </button>
      </div>
    </template>
  </Table>
</template>
