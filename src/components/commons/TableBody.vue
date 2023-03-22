<script setup>
import _ from 'lodash';
import moment from 'moment';

const props = defineProps({
    columns: Array,
    data: Array
})


const renderCell = (item, column, index) => {
    if(column.label === '#') return index;
    if(column.content) return column.content;
    return _.get(item, column.path)
}

const isColumn = (column, key) => column.label === key;

</script>

<template>
    <tbody>
        <tr v-for="(item, index) in data" :key="index">
            <td v-for="(column, colIndex) in columns" :key="colIndex" :class="{'text-center': isColumn(column, 'Action')}">
                {{renderCell(item, column, index + 1 )}}
                <slot name="action" v-if="isColumn(column, 'Action')" v-bind:id="_.get(item, 'id')"></slot>
              
            </td>
        </tr>
    </tbody>
    <tfoot>        
        <slot name="footer"></slot>
    </tfoot>
</template>