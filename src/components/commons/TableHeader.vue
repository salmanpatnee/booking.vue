<script setup>

const props = defineProps({
    columns: Array,
    sortColumn: Object
})

const emit = defineEmits(['onSort'])

const raiseSort = path => {
    const sortColumn = props.sortColumn;

    sortColumn.path = path;
    sortColumn.order = sortColumn.order == 'desc' ? 'asc' : 'desc';

    emit('onSort', sortColumn);

    //===========Alternate approach===========
    /*
    if (sortColumn.value.path === path) {
        sortColumn.value.order = sortColumn.value.order === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value.path = path;
        sortColumn.value.order = 'asc';
    }
    */
}

const renderSortIcon = column => {
    
    return props.sortColumn && props.sortColumn.order === 'asc' 
        ? '<i class="fa fa-sort-asc"></i>' 
        : '<i class="fa fa-sort-desc"></i>'
    
}
</script>

<template>
    <thead class="bg-primary text-bg-dark">
        <tr clas="border-bottom">
            <th 
                v-for="(column, index) in columns" 
                :key="index" 
                @click="column.sortable && raiseSort(column.path)" 
                :class="{'clickable': column.sortable, 'text-center': column.label === 'Action'}">
                {{column.label}} 
                <span 
                    v-if="column.sortable" 
                    v-html="renderSortIcon(column)"></span> 
            </th>
        </tr>
    </thead>
</template>