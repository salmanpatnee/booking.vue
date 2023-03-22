<script setup>
import Form from "vform";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { useFlash } from "@@/composables/useFlash";

const editMode = ref(false);
const route = useRoute();
const router = useRouter();
const { flash } = useFlash();
const baseEndpoint = "/api/roles";
const isLoading = ref(true);

const form = ref(
  new Form({
    id: "",
    name: "",
    permissions: [],
  })
);

const store = async () => {
  await form.value
    .post(baseEndpoint)
    .then((response) => {
      if (response.data.status == "success") {
        flash(response.data.message);
        router.push({ name: "roles.index" });
      }
    })
    .catch((error) => console.log(error));
};
const update = async () => {
  await form.value
    .patch(`${baseEndpoint}/${route.params.id}`)
    .then((response) => {
      if (response.data.status == "success") {
        flash(response.data.message);
        router.push({ name: "roles.index" });
      }
    })
    .catch((error) => console.log(error));
};

const getRole = async () => {
  isLoading.value = true;
  const response = await axios.get(`${baseEndpoint}/${route.params.id}`);
  form.value.fill(response.data.data);
  isLoading.value = false;
};

onMounted(() => {
  if (route.params.id) {
    editMode.value = true;
    getRole();
  } else {
    isLoading.value = false;
  }
});
</script>

<template>
  <form @submit.prevent="!editMode ? store() : update()">
    <Panel>
      <template #header>
        <h1 class="h3 mb-0 text-middle">
          {{ editMode ? "Edit" : "Add" }} Role
        </h1>
        <router-link class="btn btn-primary" :to="{ name: 'roles.index' }">
          All Roles
        </router-link>
      </template>
      <div v-if="!isLoading">
        <div class="row mb-4">
          <div class="col-4 mb-4">
            <label class="form-label" for="name">Role Name:</label>
            <input
              v-model="form.name"
              type="text"
              class="form-control form-control-lg"
              id="name"
              required=""
            />
            <HasError :form="form" field="name" />
          </div>
        </div>
        <div class="row mb-4">
          <div class="col mb-4">
            <h3>Permission:</h3>
          </div>
        </div>
        <div class="row mb-4">
          <div class="col-3">
            <h4>Dashboard</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="dashboard-view"
              />
              <span class="form-check-label"> View Dashboard </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Users</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="user-view"
              />
              <span class="form-check-label"> View User </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="user-add"
              />
              <span class="form-check-label"> Add User </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="user-edit"
              />
              <span class="form-check-label"> Edit User </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="user-delete"
              />
              <span class="form-check-label"> Delete User </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Roles</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="role-view"
              />
              <span class="form-check-label"> View Role </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="role-add"
              />
              <span class="form-check-label"> Add Role </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="role-edit"
              />
              <span class="form-check-label"> Edit Role </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="role-delete"
              />
              <span class="form-check-label"> Delete Role </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Locations</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="location-view"
              />
              <span class="form-check-label"> View Location </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="location-add"
              />
              <span class="form-check-label"> Add Location </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="location-edit"
              />
              <span class="form-check-label"> Edit Location </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="location-delete"
              />
              <span class="form-check-label"> Delete Location </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Suppliers</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="supplier-view"
              />
              <span class="form-check-label"> View Supplier </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="supplier-add"
              />
              <span class="form-check-label"> Add Supplier </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="supplier-edit"
              />
              <span class="form-check-label"> Edit Supplier </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="supplier-delete"
              />
              <span class="form-check-label"> Delete Supplier </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Customers</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="customer-view"
              />
              <span class="form-check-label"> View Customer </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="customer-add"
              />
              <span class="form-check-label"> Add Customer </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="customer-edit"
              />
              <span class="form-check-label"> Edit Customer </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="customer-delete"
              />
              <span class="form-check-label"> Delete Customer </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Categories</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="category-view"
              />
              <span class="form-check-label"> View Category </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="category-add"
              />
              <span class="form-check-label"> Add Category </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="category-edit"
              />
              <span class="form-check-label"> Edit Category </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="category-delete"
              />
              <span class="form-check-label"> Delete Category </span>
            </label>
          </div>
        </div>

        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Brands</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="brand-view"
              />
              <span class="form-check-label"> View Brand </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="brand-add"
              />
              <span class="form-check-label"> Add Brand </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="brand-edit"
              />
              <span class="form-check-label"> Edit Brand </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="brand-delete"
              />
              <span class="form-check-label"> Delete Brand </span>
            </label>
          </div>
        </div>

        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Products</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="product-view"
              />
              <span class="form-check-label"> View Product </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="product-add"
              />
              <span class="form-check-label"> Add Product </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="product-edit"
              />
              <span class="form-check-label"> Edit Product </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="product-delete"
              />
              <span class="form-check-label"> Delete Product </span>
            </label>
          </div>
        </div>

        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Purchases</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="purchase-view"
              />
              <span class="form-check-label"> View Purchase </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="purchase-add"
              />
              <span class="form-check-label"> Add Purchase </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="purchase-edit"
              />
              <span class="form-check-label"> Edit Purchase </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="purchase-delete"
              />
              <span class="form-check-label"> Delete Purchase </span>
            </label>
          </div>
        </div>

        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Stock</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="stock-view"
              />
              <span class="form-check-label"> View Stock </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="stock-edit"
              />
              <span class="form-check-label"> Manage Stock </span>
            </label>
          </div>
        </div>

        <!--
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Purchase Orders</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="po-view"
              />
              <span class="form-check-label"> View Purchase Order </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="po-add"
              />
              <span class="form-check-label"> Add Purchase Order </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="po-edit"
              />
              <span class="form-check-label"> Edit Purchase Order </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="po-delete"
              />
              <span class="form-check-label"> Delete Purchase Order </span>
            </label>
          </div>
        </div>
        -->

        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Purchase Return</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="purchase-return-view"
              />
              <span class="form-check-label"> View Purchase Return </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="purchase-return-add"
              />
              <span class="form-check-label"> Add Purchase Return </span>
            </label>
            <!-- <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="purchase-return-edit"
              />
              <span class="form-check-label"> Edit Purchase Return </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="purchase-return-delete"
              />
              <span class="form-check-label"> Delete Purchase Return </span>
            </label> -->
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>POS</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="pos-manage"
              />
              <span class="form-check-label"> Manage POS </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Sales</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="sale-view"
              />
              <span class="form-check-label"> View Sales </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="sale-add"
              />
              <span class="form-check-label"> Add Sales </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="sale-edit"
              />
              <span class="form-check-label"> Edit Sales </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="sale-delete"
              />
              <span class="form-check-label"> Delete Sales </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Sales Return</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="sale-return-view"
              />
              <span class="form-check-label"> View Sales Return </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="sale-return-add"
              />
              <span class="form-check-label"> Add Sales Return </span>
            </label>
            <!-- <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="sale-return-edit"
              />
              <span class="form-check-label"> Edit Sales Return </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="sale-return-delete"
              />
              <span class="form-check-label"> Delete Sales Return </span>
            </label> -->
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Discount</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="discount-view"
              />
              <span class="form-check-label"> View Discount </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="discount-edit"
              />
              <span class="form-check-label"> Edit / Assign Discount </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Expense</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="expense-view"
              />
              <span class="form-check-label"> View Expense </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="expense-add"
              />
              <span class="form-check-label"> Add Expense </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="expense-edit"
              />
              <span class="form-check-label"> Edit Expense </span>
            </label>
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="expense-delete"
              />
              <span class="form-check-label"> Delete Expense </span>
            </label>
          </div>
        </div>
        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Account</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="account-view"
              />
              <span class="form-check-label"> View Account </span>
            </label>
            <!-- <label class="form-check form-check-inline">
            <input
              class="form-check-input"
              v-model="form.permissions"
              type="checkbox"
              value="account-add"
            />
            <span class="form-check-label"> Add Account </span>
          </label>
          <label class="form-check form-check-inline">
            <input
              class="form-check-input"
              v-model="form.permissions"
              type="checkbox"
              value="account-edit"
            />
            <span class="form-check-label"> Edit Account </span>
          </label>
          <label class="form-check form-check-inline">
            <input
              class="form-check-input"
              v-model="form.permissions"
              type="checkbox"
              value="account-delete"
            />
            <span class="form-check-label"> Delete Account </span>
          </label> -->
          </div>
        </div>

        <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>Report</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="report-view"
              />
              <span class="form-check-label"> View Report </span>
            </label>
          </div>
        </div>
        <!-- <hr class="mb-4" />
        <div class="row mb-4">
          <div class="col-3">
            <h4>HRM</h4>
          </div>
          <div class="col">
            <label class="form-check form-check-inline">
              <input
                class="form-check-input"
                v-model="form.permissions"
                type="checkbox"
                value="hrm-view"
              />
              <span class="form-check-label"> View HRM </span>
            </label>
          </div>
        </div> -->
        <div class="row mb-4 mt-5 text-end">
          <div class="col">
            <Button :form="form" class="btn btn-lg btn-primary">
              {{
                editMode
                  ? "Update Role & Permissions"
                  : "Add Role & Permissions"
              }}
            </Button>
          </div>
        </div>
      </div>
      <div v-else class="text-center">
        <h4>Loading...</h4>
      </div>
    </Panel>
  </form>
</template>

<style scoped>
span.form-check-label {
  font-size: 16px;
  margin-left: 0.5em;
}
.form-check-input {
  width: 1.5em;
  height: 1.5em;
  margin-top: 0.1em;
}
</style>
