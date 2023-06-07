<script setup>
import axios from "axios";
import Form from "vform";
import { useRouter } from "vue-router";
import authService from "@@/services/AuthService";
import { useFlash } from "@@/composables/useFlash";
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";

const { flash } = useFlash();
const authStore = useAuthStore();
const router = useRouter();

const form = ref(
  new Form({
    email: null,
    password: null,
  })
);

const handleLogin = async () => {
  try {
    await axios.get(`/sanctum/csrf-cookie`);
    try {
      const response = await form.value.post(`/api/login`);
      await authStore.userLoggedIn(response.data.token);
      router.push("/");
    } catch (error) {
      flash(error.response.data.message, "error");
    }
  } catch (error) {
    flash(error.response.data.message, "error");
  }
};
</script>

<template>
  <div class="text-center">
    <img
      src="/img/logo.jpg"
      class="img-fluid"
      width="200"
    />
    <!-- <h1>iCrack</h1>   -->
  </div>
  <form @submit.prevent="handleLogin">
    <div class="mb-3">
      <label class="form-label">Email</label>
      <input
        v-model="form.email"
        class="form-control form-control-lg"
        type="email"
        placeholder="Enter your email"
        autofocus
      />
      <HasError :form="form" field="email" />
    </div>
    <div class="mb-3">
      <label class="form-label">Password</label>
      <input
        v-model="form.password"
        class="form-control form-control-lg"
        type="password"
        placeholder="Enter your password"
      />
      <HasError :form="form" field="password" />
    </div>
    <div class="text-center mt-3">
      <Button :form="form" class="btn btn-lg btn-primary btn-block">
        <i class="fa fa-sign-in"></i>
        Login</Button
      >
    </div>
  </form>
</template>
