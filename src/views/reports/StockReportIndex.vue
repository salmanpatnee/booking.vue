<script setup>
import categoryService from '@@/services/CategoryService';
import { onMounted, ref } from 'vue';

const location_id = ref("");
const category_id = ref("");
const categories = ref([]);
const search = ref('');

const getCategories = async (page = 1) => {
    const {data: response} = await categoryService.getCategories();
    categories.value = response.data.data;
};

onMounted(async () => {
    await getCategories();
});
</script>

<template>
    <Panel>
        <template #header>
            <h1 class="h3 mb-0 text-middle">Stock Report</h1>
        </template>
        <!-- <div class="row">
            <div class="col">
            <label class="form-label" for="location"><b>Location:</b></label>
            <select id="location" v-model="location_id" class="form-select">
                <option value="">Select Location</option>
                <option value="1">Model Colony</option>
            </select>
            </div>
            <div class="col">
                <label class="form-label" for="category"><b>Category:</b></label>
                <select id="category" v-model="category_id" class="form-select">
                <option value="">Select Category</option>
                <option :value="category.id" v-for="category in categories" :key="category.id">
                    {{category.name}}
                </option>
            </select>
            </div>
            <div class="col">
                <label class="form-label" for="search"><b>Search:</b></label>
                <input type="text" v-model="search" id="search" class="form-control">
            </div>
        </div> -->
    </Panel>
</template>