<script setup>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat  from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const props = defineProps({
    timestamp: {
        type: String, 
        required: true
    }
})

const diffForHumans = () => dayjs(props.timestamp).format('DD MMM YYYY')
const humanFriendlyDate = () => dayjs(props.timestamp).format('LLL');
</script>

<template>

    <span v-if="props.timestamp" :title="humanFriendlyDate()">
        {{ diffForHumans() }}
    </span>
</template>