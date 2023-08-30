<script setup>
import { RouterLink } from "vue-router";
import { useCan } from "@@/composables/useCan";

const { can } = useCan();
</script>

<template>
  <nav id="sidebar" class="sidebar js-sidebar">
    <div class="sidebar-content js-simplebar">
      <router-link class="sidebar-brand" to="/dashboard">
        <span class="align-middle">iCrack</span>
      </router-link>

      <ul class="sidebar-nav">
        <li class="sidebar-item">
          <router-link class="sidebar-link" to="/dashboard">
            <i class="fa fa-tachometer" aria-hidden="true"></i>
            <span class="align-middle">Dashboard</span>
          </router-link>
        </li>

        <!--
        <li
          class="sidebar-item"
          
        >
          <a
            data-bs-target="#users"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-th" aria-hidden="true"></i>
            <span class="align-middle">Users</span>
          </a>
          <ul
            id="users"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item" >
              <router-link class="sidebar-link" :to="{ name: 'users.index' }">
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">All Users</span>
              </router-link>
            </li>
            <li class="sidebar-item" >
              <router-link class="sidebar-link" :to="{ name: 'roles.index' }">
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Roles & Permissions</span>
              </router-link>
            </li>
          </ul>
        </li>

         <li class="sidebar-item" >
          <router-link class="sidebar-link" :to="{ name: 'users.index' }">
            <i class="fa fa-user" aria-hidden="true"></i>
            <span class="align-middle">Users</span>
          </router-link>
        </li> 

        <li class="sidebar-item">
          <router-link class="sidebar-link" :to="{ name: 'suppliers.index' }">
            <i class="fa fa-users" aria-hidden="true"></i>
            <span class="align-middle">Suppliers</span>
          </router-link>
        </li>-->
        <li class="sidebar-item">
          <router-link class="sidebar-link" :to="{ name: 'employees.index' }">
            <i class="fa fa-user-circle" aria-hidden="true"></i>
            <span class="align-middle">Employees</span>
          </router-link>
        </li>
        <li class="sidebar-item">
          <router-link class="sidebar-link" :to="{ name: 'customers.index' }">
            <i class="fa fa-user-circle" aria-hidden="true"></i>
            <span class="align-middle">Customers</span>
          </router-link>
        </li>

        <li class="sidebar-item">
          <a
            data-bs-target="#bookings"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-calendar" aria-hidden="true"></i>
            <span class="align-middle">Bookings</span>
          </a>
          <ul
            id="bookings"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'bookings.create' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Add Booking</span>
              </router-link>
            </li>

            <!-- <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'bookings.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Manage Bookings</span>
              </router-link>
            </li> -->
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'booking.items.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Booking Items</span>
              </router-link>
            </li>
          </ul>
        </li>

        <li class="sidebar-item">
          <a
            data-bs-target="#invoices"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-file" aria-hidden="true"></i>
            <span class="align-middle">Invoices</span>
          </a>
          <ul
            id="invoices"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <!-- <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'bookings.create' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Add Booking</span>
              </router-link>
            </li> -->

            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'invoices.create' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Add Invoice</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'invoices.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Manage Invoices</span>
              </router-link>
            </li>
          </ul>
        </li>

        <li class="sidebar-item">
          <a
            data-bs-target="#products"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-th" aria-hidden="true"></i>
            <span class="align-middle">Products</span>
          </a>
          <ul
            id="products"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'parts.create' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Add Product</span>
              </router-link>
            </li>


            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'parts.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Manage Product</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'stock.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Manage Inventory</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'categories.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Categories</span>
              </router-link>
            </li>
          </ul>
        </li>
        
        <li class="sidebar-item">
          <a
            data-bs-target="#settings"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-cog" aria-hidden="true"></i>
            <span class="align-middle">Settings</span>
          </a>
          <ul
            id="settings"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >

            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'settings.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Manage Settings</span>
              </router-link>
            </li>
          </ul>
        </li>

        <!-- <li class="sidebar-item">
          <router-link class="sidebar-link" :to="{ name: 'locations.index' }">
            <i class="fa fa-location-arrow" aria-hidden="true"></i>
            <span class="align-middle">Locations</span>
          </router-link>
        </li> -->

      

        <!-- <li class="sidebar-item">
          <a
            data-bs-target="#purchases"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-cart-plus" aria-hidden="true"></i>
            <span class="align-middle">Purchases</span>
          </a>
          <ul
            id="purchases"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'purchases.create' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Add Purchase</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'purchases.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Manage Purchases</span>
              </router-link>
            </li> -->
        <!-- <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'purchases.return.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Purchase Return</span>
              </router-link>
            </li> 
          </ul>
        </li>-->

        <!-- <li class="sidebar-item">
          <a
            data-bs-target="#stock"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-th" aria-hidden="true"></i>
            <span class="align-middle">Stock</span>
          </a>
          <ul
            id="stock"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'stock.management.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Stock Management</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'stock.transfer.create' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Stock Transfer</span>
              </router-link>
            </li> 

            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'stock.report.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Stock Report</span>
              </router-link>
            </li>
             <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'stock.checker.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Stock Checker</span>
              </router-link>
            </li> 
          </ul>
        </li> -->

        <!-- <li class="sidebar-item">
          <a
            data-bs-target="#sale"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-arrow-up" aria-hidden="true"></i>
            <span class="align-middle">Sales</span>
          </a>
          <ul
            id="sale"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item">
              <router-link class="sidebar-link" :to="{ name: 'sales.index' }">
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Sales</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link class="sidebar-link" :to="{ name: 'pos.create' }">
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">POS</span>
              </router-link>
            </li>
          </ul>
        </li> -->

        <!-- <li class="sidebar-item">
          <a
            data-bs-target="#saleReturn"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-refresh" aria-hidden="true"></i>
            <span class="align-middle">Sales Return</span>
          </a>
          <ul
            id="saleReturn"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'sales.return.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Sale Return</span>
              </router-link>
            </li>

            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'exchanges.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Product Exchange</span>
              </router-link>
            </li>
          </ul>
        </li> -->

        <!-- <li class="sidebar-item">
          <router-link class="sidebar-link" :to="{ name: 'discounts.index' }">
            <i class="fa fa-percent" aria-hidden="true"></i>
            <span class="align-middle">Discounts</span>
          </router-link>
        </li> -->

        <!-- <li class="sidebar-item">
            <a
              data-bs-target="#accounts"
              data-bs-toggle="collapse"
              class="sidebar-link collapsed"
              aria-expanded="false"
            >
              <i class="fa fa-calculator" aria-hidden="true"></i>
              <span class="align-middle">Accounts</span>
            </a>
            <ul
              id="accounts"
              class="sidebar-dropdown list-unstyled collapse"
              data-bs-parent="#sidebar"
              style=""
            >
              <li class="sidebar-item">
                <router-link
                  class="sidebar-link"
                  :to="{ name: 'accountheads.index' }"
                >
                  <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                  <span class="align-middle">Account Heads</span>
                </router-link>
              </li>
              <li class="sidebar-item">
                <router-link class="sidebar-link" :to="{ name: 'trial.balance' }">
                  <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                  <span class="align-middle">Trial Balance</span>
                </router-link>
              </li>
            </ul>
          </li>

          <li class="sidebar-item">
            <a
              data-bs-target="#expenses"
              data-bs-toggle="collapse"
              class="sidebar-link collapsed"
              aria-expanded="false"
            >
              <i class="fa fa-book" aria-hidden="true"></i>
              <span class="align-middle">Expenses</span>
            </a>
            <ul
              id="expenses"
              class="sidebar-dropdown list-unstyled collapse"
              data-bs-parent="#sidebar"
              style=""
            >
              <li class="sidebar-item">
                <router-link class="sidebar-link" :to="{ name: 'expense.types' }">
                  <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                  <span class="align-middle">Expense Types</span>
                </router-link>
              </li>
              <li class="sidebar-item">
                <router-link
                  class="sidebar-link"
                  :to="{ name: 'expenses.index' }"
                >
                  <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                  <span class="align-middle">Expenses</span>
                </router-link>
              </li>
            </ul>
          </li> -->

        <!-- <li class="sidebar-item">
          <a
            data-bs-target="#reports"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-bar-chart" aria-hidden="true"></i>
            <span class="align-middle">Reports</span>
          </a>
          <ul
            id="reports"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'reports.registers.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Cash Registers</span>
              </router-link>
            </li> 
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'reports.today.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Todays Report</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'reports.stock.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Stock Report</span>
              </router-link>
            </li>
          </ul>
        </li> -->

        <!-- <li class="sidebar-item">
          <a
            data-bs-target="#hrm"
            data-bs-toggle="collapse"
            class="sidebar-link collapsed"
            aria-expanded="false"
          >
            <i class="fa fa-user-circle" aria-hidden="true"></i>
            <span class="align-middle">HRM</span>
          </a>
          <ul
            id="hrm"
            class="sidebar-dropdown list-unstyled collapse"
            data-bs-parent="#sidebar"
            style=""
          >
            <li class="sidebar-item">
              <router-link
                class="sidebar-link"
                :to="{ name: 'attendance.index' }"
              >
                <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
                <span class="align-middle">Attendence</span>
              </router-link>
            </li>
          </ul>
        </li> -->
      </ul>
    </div>
  </nav>
</template>
