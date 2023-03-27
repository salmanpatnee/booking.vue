<script setup>
import moment from "moment";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import "vue-select/dist/vue-select.css";
import axios from "axios";

// Data
const baseEndpoint = "/api/bookings";
const sale = ref({});
const route = useRoute();
let isLoaded = ref(false);
let imageLoaded = 0;

// Methods
const getBooking = async () => {
  const response = await axios.get(
    `${baseEndpoint}/${route.params.id}?for=print`
  );
  sale.value = response.data.data;
};

const handleImageLoad = () => {
  imageLoaded++;
  if (imageLoaded == 1) {
    handlePrint();
  }
};

const handlePrint = () => {
  const printContents = document.getElementById("printable").innerHTML;
  // const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;

  window.print();

  // document.body.innerHTML = originalContents;
  window.onafterprint = window.close;
};

onMounted(async () => {
  await getBooking();
  document.body.classList.add("sale-print");
  isLoaded.value = true;
});
</script>

<template>
  <div v-if="isLoaded">
    <div id="printable">
      <div
        class="print-invoice"
        style="
          /* border: 1px solid #a1a1a1; */
          /* width: 88mm; */
          background: white;
          padding: 10px;
          margin: 0 auto;
          text-align: center;
        "
      >
        <main class="content">
          <div class="container-fluid p-0">
            <img
              @load="handleImageLoad"
              src="/img/pharma-logo-black.png"
              style="display: none"
            />

            <div class="row">
              <div class="col-12" id="printable">
                <div class="card">
                  <div class="card-body m-sm-3 m-md-5">
                    <div class="mb-3 text-center">
                      <h3>Invoice</h3>
                    </div>
                    <div class="mb-3 text-center">
                      <h1>CVS Technologies Limited</h1>
                      <p class="m-0">Eureka Court</p>
                      <p class="m-0">India</p>
                      <p>info@cvstechnologiges.com</p>
                    </div>

                    <div class="row mb-4">
                      <div class="col-6 text-start">
                        <div class="text-muted">
                          Bill to:
                          <strong> {{ sale.account.name }} </strong>
                        </div>
                        <p>
                          Phone:
                          <strong>{{ sale.account.phone }}</strong>
                          <br />
                          <a href="#"> </a>
                        </p>
                      </div>
                      <div class="col-6 text-end">
                        <div class="text-muted">
                          Invoice No. <strong>{{ sale.reference_id }}</strong>
                        </div>
                        <div class="text-muted">
                          Invoice Date.
                          <strong
                            ><AppDate
                              :timestamp="moment().format('YYYY-MM-DD')"
                          /></strong>
                        </div>
                        <!-- <div class="text-muted">
                          Due Date.
                          <strong>5 10 23</strong>
                        </div> -->
                      </div>
                    </div>
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th class="text-end">Price</th>
                          <th class="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{{ sale.issue }}</td>
                          <td class="text-end">PKR {{ sale.charges }}</td>
                          <td class="text-end">PKR {{ sale.charges }}</td>
                        </tr>
                        <tr>
                          <th>&nbsp;</th>
                          <th>Subtotal</th>
                          <th class="text-end">PKR {{ sale.charges }}</th>
                        </tr>
                        <tr>
                          <th>&nbsp;</th>
                          <th>Total</th>
                          <th class="text-end">PKR {{ sale.charges }}</th>
                        </tr>
                      </tbody>
                    </table>

                    <div class="row mt-4">
                      <div class="col">
                        <div align="center">
                          <img :src="sale.qr_code" alt="Qr Code" srcset="" />
                          <p>{{ sale.reference_id }}</p>
                        </div>

                        <!-- <h3>Payment details</h3>
                        <div class="text-muted">
                          Bank: <strong>Habib Bank Limited</strong>
                        </div>
                        <div class="text-muted">
                          Account title: <strong>Muhammad Saifullah</strong>
                        </div>
                        <div class="text-muted">
                          Iban: <strong>PK17 HABB 0024907000093103</strong>
                        </div> -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- <div align="center">
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
         <img src="/img/pharma-logo-black.png" /> 
        </div> 
       <div align="left">
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

<style scoped>
@media print {
  .sale-print {
    font-family: monospace !important;
    color: #000 !important;
  }
  .table > tbody > tr > td,
  table > tbody > tr > th {
    padding: 0 !important;
    text-align: center !important;
    font-family: monospace;
    color: black !important;
  }
}
</style>
