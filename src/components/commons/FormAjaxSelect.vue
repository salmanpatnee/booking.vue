<script setup>
import axios from "axios";
import { onMounted, onUpdated, ref, toRefs, watch, watchEffect } from "vue";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

const props = defineProps([
  "forRoute",
  "name",
  "label",
  "modelValue",
  "slug",
  "q", "item"
]);
const { forRoute, name, label, modelValue, slug, item } = toRefs(props);
const internalModel = ref(null);
const modelRef = ref(null);

const emit = defineEmits(["update:modelValue", "addNewCustomer"]);

const debounce = (fn, delay) => {
  let timeout;

  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const options = ref([]);

const getData = async (query) => {
  try {
    const response = await axios.get(
      `/api/${slug.value}?for=select&q=${query}`
    );
    return response.data;
  } catch (ex) {
    console.log(ex);
    if (ex.response.status == 422) {
      return false;
    }
  }
  alert("Something went wrong");
};

const handleSelect = (selectedOption) => {
  if(name.value !== 'parts') {
    emit("update:modelValue", selectedOption);
  } else {
    emit("update:modelValue", {selectedOption, item: item.value});
  }
    
};

const onSearch = (query, loading) => {
  if (query.length) {
    loading(true);
    search(loading, query);
  }
};
const search = debounce(async (loading, query) => {
  // let url = `/api/${slug.value}?`;
  // if (forRoute.value) url += `for=${forRoute.value}&`;
  // url += `search=${query}`;

   let url = `/api/${slug.value}`;
   const params =  {
    for: forRoute.value,  // Not conditional
    search: query
   };

  try {
    const response = await axios.get(url, {params: params});
    options.value = response.data.data;
    loading(false);
  } catch (ex) {
    console.log(ex);
  }
}, 350);

onMounted(() => {
  if (modelValue.value) internalModel.value = modelValue.value;
  else {
    modelRef.value.$emit("search", "%", modelRef.value.toggleLoading);
  }

  // modelRef.value.$emit("input");
  // document.getElementsByClassName("vs__search")[0].focus();
  // document.addEventListener('keyup', (e)=>{
  //   if(e.code == 'Enter') {
  //     alert(1)
  //   }
  // })
});

const updateValue = (event) => {};

// onMounted(() => {
//   console.log("onMounted");
// });

onUpdated(() => {
  // internalModel.value = modelValue;
  // console.log(internalModel.value);
});

watch(
  () => props.modelValue,
  async (value, prevValue) => {
    console.log("watch", value);
    internalModel.value = await value;
  },
  { deep: true }
);
</script>

<template>
  <div>
    <label :for="name" class="form-label"
      ><b>{{ label }}</b></label
    >
    <!-- <input type="text" @input.prevent="handleInput"> -->
    <!-- :value="modelValue" -->
    <v-select
      ref="modelRef"
      label="name"
      :filterable="false"
      :options="options"
      v-model="internalModel"
      @search="onSearch"
      @option:selected="handleSelect"
      :appendToBody="true"
    >
      <!-- for {{ table }} -->
      <template v-slot:no-options>
        <span class="fw-bold" v-if="name == 'customer'"
          ><a
            @click.prevent="$emit('addNewCustomer')"
            class="btn btn-link fw-bold"
            ><i class="fa fa-user-plus"></i> Add New Customer</a
          ></span
        >
        <span v-else>type to search ..</span>
      </template>
      <template v-slot:option="option">
        <div class="d-center">
          <img
            src="https://complianz.io/wp-content/uploads/2019/03/placeholder-300x202.jpg"
          />
          {{ option.name }} &nbsp;
          <span class="fw-bold" v-if="name == 'customer'"
            >({{ option.phone }})</span
          >
        </div>
      </template>
      <template v-slot:selected-option="option">
        <div class="selected d-center">
          <img
            src="https://complianz.io/wp-content/uploads/2019/03/placeholder-300x202.jpg"
          />
          {{ option.name }} &nbsp;
          <span class="fw-bold" v-if="name == 'customer'"
            >({{ option.phone }})</span
          >
        </div>
      </template>
    </v-select>
  </div>
</template>

<style scoped>
img {
  height: auto;
  max-width: 2.5rem;
  margin-right: 1rem;
}

.d-center {
  display: flex;
  align-items: center;
}

.selected img {
  width: auto;
  max-height: 23px;
  margin-right: 0.5rem;
}

.v-select .dropdown li {
  border-bottom: 1px solid rgba(112, 128, 144, 0.1);
}

.v-select .dropdown li:last-child {
  border-bottom: none;
}

.v-select .dropdown li a {
  padding: 10px 20px;
  width: 100%;
  font-size: 1.25em;
  color: #3c3c3c;
}

.v-select .dropdown-menu .active > a {
  color: #fff;
}
</style>
