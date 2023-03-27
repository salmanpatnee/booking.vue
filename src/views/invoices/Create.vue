<script setup>
import Form from "vform";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const printMode = ref(false);
let imageLoaded = 0;

const form = ref(
  new Form({
    client_name: null,
    description: null,
    amount: null,
  })
);

const generateInvoice = async () => {
  document.body.classList.add("sale-print");
  printMode.value = true;
  //   let routeData = router.resolve({
  //     name: "bookings.invoice",
  //     params: {
  //       name: form.value.client_name,
  //       description: form.value.description,
  //       amount: form.value.amount,
  //     },
  //   });
  //   window.open(routeData.href, "_blank");
};

const handlePrint = () => {
  const printContents = document.getElementById("printable").innerHTML;
  // const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;

  window.print();

  // document.body.innerHTML = originalContents;
  window.onafterprint = window.close;
};

const handleImageLoad = () => {
  imageLoaded++;
  if (imageLoaded == 1) {
    handlePrint();
  }
};

</script>

<template>
  <div v-if="!printMode">
    <form @submit.prevent="generateInvoice">
      <Panel>
        <template #header>
          <h1 class="h3 mb-0 text-middle">Generate Invoice</h1>
          <router-link
            class="btn btn-primary"
            :to="{ name: 'invoices.create' }"
          >
            All Sales
          </router-link>
        </template>
        <div class="row">
          <div class="col-6 mb-4">
            <label class="form-label" for="client_name">Client Name:</label>
            <input
              v-model="form.client_name"
              type="text"
              class="form-control form-control-lg"
              id="client_name"
              required=""
              autofocus
            />
            <HasError :form="form" field="client_name" />
          </div>
        </div>
        <div class="row">
          <div class="col-6 mb-4">
            <label class="form-label" for="description">Description:</label>
            <textarea
              v-model="form.description"
              type="text"
              class="form-control form-control-lg"
              id="description"
              required=""
            ></textarea>
            <HasError :form="form" field="description" />
          </div>
        </div>
        <div class="row">
          <div class="col-6 mb-4">
            <label class="form-label" for="amount">Amount Paid:</label>
            <input
              v-model="form.amount"
              type="number"
              class="form-control form-control-lg"
              id="amount"
              required=""
            />
            <HasError :form="form" field="amount" />
          </div>
        </div>
        <template #footer>
          <Button :form="form" class="btn btn-lg btn-primary">
            Generate
          </Button>
        </template>
      </Panel>
    </form>
  </div>
  <div v-else>
    <div id="printable">
      <div
        class="print-invoice"
        style="
          border: 1px solid #a1a1a1;
          /* width: 88mm; */
          background: white;
          padding: 10px;
          margin: 0 auto;
          text-align: center;
        "
      >
        <div align="center">
          <img
            @load="handleImageLoad"
            src="/img/pharma-logo-black.png"
            style="display: none;"
          />
          <h1
            style="
              font-family: monospace;
              font-weight: 900;
              text-transform: uppercase;
            "
          >
            <storng>Bookings</storng>
          </h1>
          <!-- <img src="/img/pharma-logo-black.png" /> -->
        </div>
        <!-- <div align="left">
          <div class="row">
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black"
                >Invoice No</strong
              >:
            </div>
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black">{{
                sale.id
              }}</strong>
            </div>
          </div>
          <div class="row">
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black"
                >Date:</strong
              >
            </div>
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black"
                ><AppDate :timestamp="sale.date"
              /></strong>
            </div>
          </div>
          <div class="row">
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black"
                >Customer:</strong
              >
            </div>
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black">{{
                sale.account.name
              }}</strong>
            </div>
          </div>
          <div class="row">
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black"
                >Phone:</strong
              >
            </div>
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black">{{
                sale.account.phone
              }}</strong>
            </div>
          </div>
          <div class="row">
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black"
                >Paid By:</strong
              >
            </div>
            <div
              class="col"
              style="font-weight: bold; font-family: monospace; color: black"
            >
              <strong style="font-family: monospace; color: black">{{
                sale.payment_method_id == 1 ? "Cash" : "Bank"
              }}</strong>
            </div>
          </div>
        </div>

        <div align="left" style="margin-top: 20px; margin-bottom: 10px">
          <table class="table" style="border-spacing: 0px">
            <tr style="border-top: 1px solid">
              <th style="font-family: monospace; color: black" align="center">
                Item
              </th>
              <th style="font-family: monospace; color: black" align="center">
                Qty
              </th>
              <th style="font-family: monospace; color: black" align="center">
                Price
              </th>
              <th style="font-family: monospace; color: black" align="center">
                Dis
              </th>
              <th style="font-family: monospace; color: black" align="center">
                Amount
              </th>
            </tr>
            <tr
              v-for="(sale_details, i) in sale.sale_details"
              :key="sale_details.id"
            >
              <td style="font-family: monospace; color: black" align="center">
                {{ sale_details.product.name }}
              </td>
              <td style="font-family: monospace; color: black" align="center">
                {{ sale_details.quantity }}
              </td>
              <td style="font-family: monospace; color: black" align="center">
                {{ sale_details.original_price.toFixed(2) }}
              </td>
              <td style="font-family: monospace; color: black" align="center">
                {{ sale_details.discount_rate }}
              </td>
              <td style="font-family: monospace; color: black" align="center">
                {{ sale_details.amount.toFixed(2) }}
              </td>
            </tr>
          </table>
        </div>

        <div class="row" align="left">
          <div class="col">
            <span style="font-family: monospace; color: black">Subtotal:</span>
          </div>
          <div class="col">
            <span style="font-family: monospace; color: black">{{
              sale.gross_amount
            }}</span>
          </div>
        </div>
        <div
          class="row"
          align="left"
          style="border-bottom: 1px solid; margin-bottom: 0.5em"
        >
          <div class="col">
            <span style="font-family: monospace; color: black">Discount:</span>
          </div>
          <div class="col">
            <span style="font-family: monospace; color: black">{{
              totalDiscountDisplay
            }}</span>
          </div>
        </div>
        <div
          v-if="sale.shipping_charges"
          class="row"
          align="left"
          style="border-bottom: 1px solid; margin-bottom: 0.5em"
        >
          <div class="col">
            <span style="font-family: monospace; color: black"
              >Delivery Charges:</span
            >
          </div>
          <div class="col">
            <span style="font-family: monospace; color: black">{{
              sale.shipping_charges
            }}</span>
          </div>
        </div>

        <div
          class="row"
          align="left"
          style="border-bottom: 1px solid; margin-bottom: 1em"
        >
          <div class="col" style="font-weight: bold">
            <strong style="font-family: monospace; color: black">Total:</strong>
          </div>
          <div class="col" style="font-weight: bold">
            <strong style="font-family: monospace; color: black">{{
              sale.net_amount
            }}</strong>
          </div>
        </div>
        <div
          class="row"
          align="left"
          style="border-bottom: 1px solid; margin-bottom: 1em"
        >
          <div class="col">
            <strong style="font-family: monospace; color: black">Paid:</strong>
          </div>
          <div class="col">
            <strong style="font-family: monospace; color: black">{{
              sale.paid_amount
            }}</strong>
          </div>
        </div>
        <div
          v-if="sale.returned_amount"
          class="row"
          align="left"
          style="border-bottom: 1px solid; margin-bottom: 1em"
        >
          <div class="col">
            <strong style="font-family: monospace; color: black"
              >Change:</strong
            >
          </div>
          <div class="col">
            <strong style="font-family: monospace; color: black">{{
              sale.returned_amount
            }}</strong>
          </div>
        </div>

        <div
          align="center"
          v-if="sale.discount_amount != '0.00'"
          style="border-bottom: 1px solid"
        >
          <h4 style="font-family: monospace; color: black">
            You Have Saved Rs.{{ totalDiscountDisplay }}!
          </h4>
        </div>
        <div align="center" style="margin-top: 1em">
          <img width="60" :src="sale.qr_code" alt="Qr Code" srcset="" />
        </div>
        <div align="left" style="margin-top: 10px">
          <h4 style="font-size: 14px; font-family: monospace; color: black">
            <strong>Terms & Conditions</strong>
          </h4>
          <ol
            style="
              margin: 0;
              padding-left: 20px;
              font-family: monospace;
              color: black;
              font-size: 11px;
            "
          >
            <li style="font-family:'monospace' color:black;, Times, serif;">
              GST Included where applicable.
            </li>
            <li style="font-family:'monospace' color:black;, Times, serif;">
              No exchange & refund without receipt.
            </li>
            <li style="font-family:'monospace' color:black;, Times, serif;">
              Exchange & refund within 3 days.
            </li>
            <li style="font-family:'monospace' color:black;, Times, serif;">
              No Exchange & Refund on fridge and surgical items.
            </li>
          </ol>
        </div>

        <div align="center" style="margin-top: 20px">
          <hr />

          <p style="font-family: monospace; color: black; margin-bottom: 0">
            <strong>Address</strong>: Plot # 118/1, Block A, Alamgeer Society
            Model Colony Malir Karachi.
          </p>
          <p style="font-family: monospace; color: black; margin-bottom: 0">
            <strong>Contact No</strong>: 03000742762
          </p>
          <p style="font-family: monospace; color: black; margin-bottom: 0">
            <strong>Email</strong>: info@pharmasquare.com.pk
          </p>
        </div> -->
      </div>
    </div>
  </div>
</template>
