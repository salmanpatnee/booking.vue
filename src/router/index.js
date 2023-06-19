import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "@@/components/commons/DefaultLayout.vue";
import AuthLayout from "@@/components/commons/AuthLayout.vue";

import DashboardView from "@@/views/DashboardView.vue";
import LoginView from "@@/views/LoginView.vue";

// import UsersIndex from "@@/views/users/UsersIndex.vue";
// import Roles from "@@/views/roles/RolesIndex.vue";
// import RolesCreate from "@@/views/roles/RolesCreate.vue";
// import Permissions from "@@/views/roles/PermissionIndex.vue";

// import Suppliers from "@@/views/suppliers/SuppliersList.vue";
// import SuppliersShow from "@@/views/suppliers/SupplierShow.vue";
// import SupplierLedger from "@@/views/suppliers/SupplierLedger.vue";

import Customers from "@@/views/customers/Index.vue";
import CustomersShow from "@@/views/customers/Show.vue";

import Employees from "@@/views/employees/Index.vue";
import EmployeesShow from "@@/views/employees/Show.vue";

// import Locations from "@@/views/locations/LocationList.vue";
import Categories from "@@/views/categories/CategoryList.vue";
// import Brands from "@@/views/brands/BrandList.vue";

import Products from "@@/views/products/ProductList.vue";
import ProductsShow from "@@/views/products/ProductShow.vue";
import ProductCreate from "@@/views/products/ProductCreate.vue";

// import Discounts from "@@/views/discounts/DiscountList.vue";

import Purchases from "@@/views/purchases/PurchaseList.vue";
import PurchasesShow from "@@/views/purchases/PurchasesShow.vue";
import PurchasesPrint from "@@/views/purchases/PurchasesPrint.vue";
import PurchaseCreate from "@@/views/purchases/PurchaseCreate.vue";

// import PurchaseOrderIndex from "@@/views/purchase-orders/PurchaseOrderList.vue";
// import PurchaseOrderCreate from "@@/views/purchase-orders/PurchaseOrderCreate.vue";
// import PurchaseOrderShow from "@@/views/purchase-orders/PurchaseOrderShow.vue";
// import PurchaseOrderCheck from "@@/views/purchase-orders/PurchaseOrderCheck.vue";
// import PurchaseReturn from "@@/views/purchases/Return.vue";
// import PurchaseReturnList from "@@/views/purchases/ReturnList.vue";
// import PurchaseReturnShow from "@@/views/purchases/ReturnShow.vue";
// import PurchaseReturnPrint from "@@/views/purchases/PurchaseReturnPrint.vue";

import StockReport from "@@/views/stock/StockReport.vue";
// import StockChecker from "@@/views/stock/StockChecker.vue";
// import StockTransfer from "@@/views/stock/StockTransfer.vue";
// import StockManagement from "@@/views/stock/StockManagement.vue";

import BookingIndex from "@@/views/bookings/Index.vue";
import BookingItemIndex from "@@/views/bookings/ItemIndex.vue";
import BookingCreate from "@@/views/bookings/Create.vue";
import BookingEdit from "@@/views/bookings/Edit.vue";
import BookingsProceedInvoice from "@@/views/bookings/ProceedInvoice.vue";
import BookingsBarcodePrint from "@@/views/bookings/BarcodePrint.vue";
import BookingsInvoice from "@@/views/bookings/Invoice.vue";

import InvoiceIndex from "@@/views/invoices/Index.vue";
import InvoiceCreate from "@@/views/invoices/Create.vue";

import SaleIndex from "@@/views/sales/Index.vue";
// import TodaySaleIndex from "@@/views/sales/TodaySaleIndex.vue";
// import SaleShow from "@@/views/sales/Show.vue";
// import SaleCreate from "@@/views/sales/Create.vue";
// import SaleEdit from "@@/views/sales/Edit.vue";
// import SaleParking from "@@/views/sales/ParkingShow.vue";
// import SaleParkingIndex from "@@/views/sales/ParkingIndex.vue";
// import SalesPrint from "@@/views/sales/SalesPrint.vue";
// import SalesInvoice from "@@/views/sales/SalesInvoice.vue";
// import SalesProceedInvoice from "@@/views/sales/SalesProceedInvoice.vue";

// import SaleReturnList from "@@/views/sales-return/ReturnList.vue";
// import SaleReturnShow from "@@/views/sales-return/ReturnShow.vue";
// import SaleReturnCreate from "@@/views/sales-return/ReturnsCreate.vue";
// import SalesReturnPrint from "@@/views/sales-return/SalesReturnPrint.vue";

import PosCreate from "@@/views/pos/PosCreate.vue";

// import ExchangeList from "@@/views/exchange/ExchangeList.vue";
// import ExchangeShow from "@@/views/exchange/ExchangeShow.vue";
// import ExchangeCreate from "@@/views/exchange/ExchangeCreate.vue";

// import ExpenseTypes from "@@/views/expense-types/TypeList.vue";
// import ExpensesIndex from "@@/views/expenses/ExpensesIndex.vue";

// import AccountHeadList from "@@/views/accounts/HeadList.vue";
// import AccountHead from "@@/views/accounts/HeadShow.vue";
// import TrialBalance from "@@/views/accounts/TrailBalance.vue";

import StockReportIndex from "@@/views/reports/StockReportIndex.vue";
import TodaysReportIndex from "@@/views/reports/TodaysReportIndex.vue";
// import CashRegisterIndex from "@@/views/reports/CashRegisterIndex.vue";
// import CashRegisterShow from "@@/views/reports/CashRegisterShow.vue";

// import AttendanceIndex from "@@/views/attendance/AttendanceIndex.vue";
// import AttendanceCreate from "@@/views/attendance/AttendanceCreate.vue";
import { useAuthStore } from "@@/stores/authStore";
// import { useAppStore } from "@@/stores/appStore";

let isInitiated = false;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        { path: "/dashboard", name: "dashboard", component: DashboardView },

        // {
        //   path: "/roles",
        //   name: "roles.index",
        //   component: Roles,
        //   // meta: { authorize: ["role-view"] },
        // },
        // {
        //   path: "/roles/create",
        //   name: "roles.create",
        //   component: RolesCreate,
        //   // meta: { authorize: ["role-view"] },
        // },
        // {
        //   path: "/roles/edit/:id",
        //   name: "roles.edit",
        //   component: RolesCreate,
        //   // meta: { authorize: ["role-edit"] },
        // },
        // { path: "/permissions", name: "permissions.index", component: Permissions },
        // {
        //   path: "/users",
        //   name: "users.index",
        //   component: UsersIndex,
        //   // meta: { authorize: ["user-view"] },
        // },

        // {
        //   path: "/suppliers",
        //   name: "suppliers.index",
        //   component: Suppliers,
        //   // meta: { authorize: ["supplier-view"] },
        // },
        // {
        //   path: "/suppliers/supplier/:id",
        //   name: "suppliers.show",
        //   component: SuppliersShow,
        //   // meta: { authorize: ["supplier-view"] },
        // },
        // {
        //   path: "/accounts/ledger/:id",
        //   name: "accounts.ledger",
        //   component: SupplierLedger,
        //   // meta: { authorize: ["supplier-view"] },
        // },
        {
          path: "/customers",
          name: "customers.index",
          component: Customers,
          // meta: { authorize: ["customer-view"] },
        },
        {
          path: "/customers/customer/:id",
          name: "customers.show",
          component: CustomersShow,
          // meta: { authorize: ["customer-view"] },
        },
        {
          path: "/employees",
          name: "employees.index",
          component: Employees,
          // meta: { authorize: ["customer-view"] },
        },
        {
          path: "/employees/customer/:id",
          name: "employees.show",
          component: EmployeesShow,
          // meta: { authorize: ["customer-view"] },
        },

        // {
        //   path: "/locations",
        //   name: "locations.index",
        //   component: Locations,
        //   // meta: { authorize: ["location-view"] },
        // },
        {
          path: "/categories",
          name: "categories.index",
          component: Categories,
          // meta: { authorize: ["category-view"] },
        },
        // {
        //   path: "/brands",
        //   name: "brands.index",
        //   component: Brands,
        //   // meta: { authorize: ["brand-view"] },
        // },

        {
          path: "/products",
          name: "products.index",
          component: Products,
          // meta: { authorize: ["product-view"] },
        },
        {
          path: "/products/product/:id",
          name: "products.show",
          component: ProductsShow,
          // meta: { authorize: ["product-view"] },
        },
        {
          path: "/products/create",
          name: "products.create",
          component: ProductCreate,
          // meta: { authorize: ["product-add"] },
        },
        {
          path: "/products/edit/:id",
          name: "products.edit",
          component: ProductCreate,
          // meta: { authorize: ["product-edit"] },
        },

        // {
        //   path: "/discounts",
        //   name: "discounts.index",
        //   component: Discounts,
        //   // meta: { authorize: ["discount-view"] },
        // },

        {
          path: "/purchases",
          name: "purchases.index",
          component: Purchases,
          // meta: { authorize: ["purchase-view"] },
        },
        {
          path: "/purchases/:id",
          name: "purchases.show",
          component: PurchasesShow,
          // meta: { authorize: ["purchase-view"] },
        },
        {
          path: "/purchases/:id/print",
          name: "purchases.print",
          component: PurchasesPrint,
          // meta: { authorize: ["purchase-view"] },
        },
        {
          path: "/purchases/create",
          name: "purchases.create",
          component: PurchaseCreate,
          // meta: { authorize: ["purchase-add"] },
        },
        {
          path: "/purchases/edit/:id",
          name: "purchases.edit",
          component: PurchaseCreate,
          // meta: { authorize: ["purchase-edit"] },
        },

        // {
        //   path: "/purchase-orders",
        //   name: "purchase.order.index",
        //   component: PurchaseOrderIndex,
        // },
        // {
        //   path: "/purchase-orders/create",
        //   name: "purchase.order.create",
        //   component: PurchaseOrderCreate,
        // },
        // {
        //   path: "/purchase-orders/:id",
        //   name: "purchase.order.show",
        //   component: PurchaseOrderShow,
        // },
        // {
        //   path: "/purchase-orders/check/:id",
        //   name: "purchase.order.check",
        //   component: PurchaseOrderCheck,
        // },
        // {
        //   path: "/purchase/return/:id?",
        //   name: "purchases.return",
        //   component: PurchaseReturn,
        //   // meta: { authorize: ["purchase-return-add"] },
        // },
        // {
        //   path: "/purchase-return",
        //   name: "purchases.return.index",
        //   component: PurchaseReturnList,
        //   // meta: { authorize: ["purchase-return-view"] },
        // },
        // {
        //   path: "/purchase-return/:id",
        //   name: "purchase.return.show",
        //   component: PurchaseReturnShow,
        //   // meta: { authorize: ["purchase-return-view"] },
        // },
        // {
        //   path: "/purchase/return/:id/print",
        //   name: "purchase.return.print",
        //   component: PurchaseReturnPrint,
        //   // meta: { authorize: ["purchase-return-view"] },
        // },
        // {
        //   path: "/purchase-orders/:id/purchases/create",
        //   name: "purchase-orders.purchases.create",
        //   component: PurchaseCreate,
        // },

        {
          path: "/stock-report",
          name: "stock.report.index",
          component: StockReport,
          // meta: { authorize: ["stock-view"] },
        },
        // {
        //   path: "/stock-checker",
        //   name: "stock.checker.index",
        //   component: StockChecker,
        //   // meta: { authorize: ["stock-view"] },
        // },
        // {
        //   path: "/stock-transfer",
        //   name: "stock.transfer.create",
        //   component: StockTransfer,
        //   // meta: { authorize: ["stock-view"] },
        // },
        // {
        //   path: "/stock-management",
        //   name: "stock.management.index",
        //   component: StockManagement,
        // },

        {
          path: "/bookings",
          name: "bookings.index",
          component: BookingIndex,
        },
        {
          path: "/booking/items",
          name: "booking.items.index",
          component: BookingItemIndex,
        },
        {
          path: "/bookings/create",
          name: "bookings.create",
          component: BookingCreate,
        },
        {
          path: "/items/edit/:id",
          name: "bookings.edit",
          component: BookingEdit,
        },
        {
          path: "/bookings/:id/proceed/invoice",
          name: "bookings.proceed.invoice",
          component: BookingsProceedInvoice,
          // meta: { authorize: ["pos-manage"] },
        },
        {
          path: "/bookings/:id/barcode",
          name: "bookings.barcode.print",
          component: BookingsBarcodePrint,
          // meta: { authorize: ["pos-manage"] },
        },
        {
          path: "/bookings/invoice/:id",
          name: "bookings.invoice",
          component: BookingsInvoice,
        },
        {
          path: "/invoices",
          name: "invoices.index",
          component: InvoiceIndex,
        },
        {
          path: "/invoices/create",
          name: "invoices.create",
          component: InvoiceCreate,
        },

        {
          path: "/sales",
          name: "sales.index",
          component: SaleIndex,
        },
        // {
        //   path: "/todays-sales",
        //   name: "todays.sales.index",
        //   component: TodaySaleIndex,
        //   // meta: { authorize: ["sale-view"] },
        // },
        // {
        //   path: "/sales/parking/invoice",
        //   name: "sales.parking",
        //   component: SaleParking,
        //   // meta: { authorize: ["sale-edit"] },
        // },
        // {
        //   path: "/sales/parking",
        //   name: "sales.parking.index",
        //   component: SaleParkingIndex,
        //   // meta: { authorize: ["sale-view"] },
        // },
        // {
        //   path: "/sales/:id",
        //   name: "sales.show",
        //   component: SaleShow,
        //   // meta: { authorize: ["sale-view"] },
        // },
        // {
        //   path: "/sales/:id/print",
        //   name: "sales.print",
        //   component: SalesPrint,
        //   // meta: { authorize: ["sale-view"] },
        // },
        // {
        //   path: "/sales/:id/proceed/invoice",
        //   name: "sales.proceed.invoice",
        //   component: SalesProceedInvoice,
        //   // meta: { authorize: ["pos-manage"] },
        // },
        // {
        //   path: "/sales/:id/invoice",
        //   name: "sales.invoice",
        //   component: SalesInvoice,
        //   // meta: { authorize: ["sale-view"] },
        // },
        // {
        //   path: "/sales/create",
        //   name: "sales.create",
        //   component: SaleCreate,
        //   // meta: { authorize: ["sale-add"] },
        // },
        // {
        //   path: "/sales/edit/:id",
        //   name: "sales.edit",
        //   component: SaleEdit,
        //   // meta: { authorize: ["sale-edit"] },
        // },

        {
          path: "/pos",
          name: "pos.create",
          component: PosCreate,
          // meta: { authorize: ["pos-manage"] },
        },

        // {
        //   path: "/sales-return",
        //   name: "sales.return.index",
        //   component: SaleReturnList,
        //   // meta: { authorize: ["sale-return-view"] },
        // },
        // {
        //   path: "/sales-return/:id",
        //   name: "sales.return.show",
        //   component: SaleReturnShow,
        //   // meta: { authorize: ["sale-return-view"] },
        // },
        // {
        //   path: "/sales/return/create/:id?",
        //   name: "sales.return.create",
        //   component: SaleReturnCreate,
        //   // meta: { authorize: ["sale-return-add"] },
        // },
        // {
        //   path: "/sales/return/:id/print",
        //   name: "sales.return.print",
        //   component: SalesReturnPrint,
        //   // meta: { authorize: ["sale-return-view"] },
        // },

        // {
        //   path: "/exchanges",
        //   name: "exchanges.index",
        //   component: ExchangeList,
        //   // meta: { authorize: ["sale-return-view"] },
        // },
        // {
        //   path: "/exchanges/:id",
        //   name: "exchanges.show",
        //   component: ExchangeShow,
        //   // meta: { authorize: ["sale-return-view"] },
        // },
        // {
        //   path: "/exchanges/create/:id?",
        //   name: "exchanges.create",
        //   component: ExchangeCreate,
        //   // meta: { authorize: ["sale-return-add"] },
        // },

        // {
        //   path: "/expenses/types",
        //   name: "expense.types",
        //   component: ExpenseTypes,
        //   // meta: { authorize: ["expense-view"] },
        // },
        // {
        //   path: "/expenses",
        //   name: "expenses.index",
        //   component: ExpensesIndex,
        //   // meta: { authorize: ["expense-view"] },
        // },

        // {
        //   path: "/accounts/account-heads",
        //   name: "accountheads.index",
        //   component: AccountHeadList,
        //   // meta: { authorize: ["account-view"] },
        // },
        // {
        //   path: "/accounts/account-head/:id",
        //   name: "accounthead.show",
        //   component: AccountHead,
        //   // meta: { authorize: ["account-view"] },
        // },

        // {
        //   path: "/accounts/trial-balance",
        //   name: "trial.balance",
        //   component: TrialBalance,
        //   // meta: { authorize: ["account-view"] },
        // },

        // {
        //   path: "/attendance",
        //   name: "attendance.index",
        //   component: AttendanceIndex,
        // },
        // {
        //   path: "/reports/cash-registers",
        //   name: "reports.registers.index",
        //   component: CashRegisterIndex,
        //   // meta: { authorize: ["report-view"] },
        // },
        // {
        //   path: "/reports/cash-registers/:id",
        //   name: "reports.registers.show",
        //   component: CashRegisterShow,
        //   // meta: { authorize: ["report-view"] },
        // },
        {
          path: "/reports/stock-report",
          name: "reports.stock.index",
          component: StockReportIndex,
          // meta: { authorize: ["report-view"] },
        },
        {
          path: "/reports/today-report",
          name: "reports.today.index",
          component: TodaysReportIndex,
          // meta: { authorize: ["report-view"] },
        },
      ],
    },
    // {
    //   path: "/attendance",
    //   redirect: "/attendance",
    //   component: AuthLayout,
    //   children: [
    //     {
    //       path: "/attendance-mark",
    //       name: "attendance.create",
    //       component: AttendanceCreate,
    //     },
    //   ],
    // },
    {
      path: "/auth",
      redirect: "/login",
      component: AuthLayout,
      meta: { isGuest: true },
      children: [{ path: "/login", name: "login", component: LoginView }],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const { requiresAuth, authorize, isGuest } = to.meta;

  if (requiresAuth) {
    const authStore = useAuthStore();

    if (!isInitiated) {
      await authStore.getUser();
      isInitiated = true;
    }
    if (!authStore.user) {
      next({ name: "login" });
    } else {
      // const { permissions } = authStore.user;
      // if (authorize) {
      //   if (!authorize.some((permission) => permissions.includes(permission))) {
      //     next({ name: "login" });
      //   }
      // } else {
      //   next();
      // }
      next();
    }
  } else {
    next();
  }
});

export default router;

//If route requires login then do login otherwise go
// If logged in then get user if user is not go to login else
