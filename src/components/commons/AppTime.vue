<script setup>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat  from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const props = defineProps({
    timestamp: {
        type: Number, 
        required: true
    }
})

const diffForHumans = () => dayjs(props.timestamp).format('DD MMM YYYY')
const humanFriendlyDate = () => dayjs(props.timestamp).format('hh:mm a');
</script>

<template>

    <span v-if="props.timestamp">
        {{ humanFriendlyDate() }}
    </span>
</template>