<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Form from "vform";
import { useFlash } from "@@/composables/useFlash";

const { flash } = useFlash();
const form = ref(
  new Form({
    company_name: "",
    address: "",
    phone: "",
    review_link: "",
  })
);

// Data
const baseEndpoint = "/api/settings";
const settings = ref({
  data: [],
  isLoading: true,
});

const route = useRoute();

// Methods
const getSettings = async () => {
  settings.value.isLoading = true;
  const response = await axios.get(baseEndpoint);
  settings.value.data = response.data;
  form.value.company_name = settings.value.data.data[0].value;
  form.value.address = settings.value.data.data[1].value;
  form.value.phone = settings.value.data.data[2].value;
  form.value.review_link = settings.value.data.data[3].value;
  settings.value.isLoading = false;
};

const updateSettings = async () => {
    try {
    const { data: response } = await form.value.patch(baseEndpoint);

    if (response.status == "success") {
        flash(response.message);
    }
  } catch (error) {
    flash(response.message, "error");
  }

};

onMounted(async () => {
  await getSettings();
});
</script>

<template>
  <Panel>
    <template #header>
      <h1>Settings</h1>
    </template>
    <div v-if="!settings.isLoading">
      <div class="row">
        <div class="col">
          <form @submit.prevent="updateSettings">
            <!-- <pre>{{settings.data.data[0].value}}</pre> -->
            <div class="row mb-3">
              <div class="col">
                <label class="form-label" for="company_name"
                  ><b>Company Name:</b></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="company_name"
                  v-model="form.company_name"
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label" for="address"><b>Address:</b></label>
                <textarea
                  type="text"
                  class="form-control"
                  id="address"
                  v-model="form.address"
                ></textarea>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label" for="phone"><b>Phone:</b></label>
                <input
                  type="text"
                  class="form-control"
                  id="phone"
                  v-model="form.phone"
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label" for="review_link"
                  ><b>Review Link:</b></label
                >
                <input
                  type="url"
                  class="form-control"
                  id="review_link"
                  v-model="form.review_link"
                />
              </div>
            </div>

            <div class="row mt-5">
              <div class="col text-end">
                <Button :form="form" class="btn btn-primary"
                  >Update Settings</Button
                >
              </div>
            </div>
          </form>
        </div>
        <div class="col"></div>
      </div>
    </div>
    <div v-else class="text-center">
      <AppLoader />
    </div>
  </Panel>
</template>
