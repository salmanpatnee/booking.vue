import http from "@/services/httpService";
import { defineStore, acceptHMRUpdate } from "pinia";

const apiEndpoint = `/api/carts`;

export const useCartStore = defineStore({
  id: "cart",
  state: () => ({
    items: {
      isLoading: false,
      data: [],
    },
    item: {
      isLoading: false,
      data: {},
    },
    vat: 5,
  }),
  getters: {
    totalItemQuatities: (state) => {
      let totalItemQuatities = 0;
      state.items.data &&
        state.items.data.map(
          (item) => (totalItemQuatities += parseInt(item.quantity))
        );
      return totalItemQuatities;
    },
    subTotal: (state) => {
      let subTotal = 0;
      state.items.data &&
        state.items.data.forEach(
          (item) =>
            (subTotal += parseInt(item.quantity) * parseFloat(item.price))
        );
      return parseFloat(subTotal);
    },
    grandTotal: (state) => {
      const subTotal = state.subTotal;
      return subTotal + (subTotal * state.vat) / 100;
    },
  },
  actions: {
    async addItem(form) {
      try {
        return await form.post(apiEndpoint);
      } catch (error) {
        return error;
      }
    },
    async addItemToCart(form, product) {
      
      let productInCart =
        this.items.data &&
        this.items.data.find((item) => {
          return item.product_id === product.id;
        });
       

      if (productInCart) {

        if (productInCart.quantity + 1 > product.stock) return false;
        
        // form.id = productInCart.id;
        productInCart.quantity++;

        // this.updateItem(form, productInCart.id);
      } else {
        product.quantity = 1;
        product.product_id = product.id;
        this.items.data.push(product);
      }


      form.product_id = product.id;
      return await form.post(apiEndpoint);

      // Setting in Local Storage
      // sessionStorage.removeItem("cartItems");
      // sessionStorage.setItem("cartItems", JSON.stringify(this.items.data));
    },
    async getItems(params = "") {
      try {
        this.items.isLoading = true;
        const { data: response } = await http.get(`${apiEndpoint}${params}`);
        this.items.data = response.data;
        // Getting from Local Storage
        // this.items.data = sessionStorage.getItem("cartItems") ? JSON.parse(sessionStorage.getItem("cartItems")) : [],
        this.items.isLoading = false;
      } catch (error) {
        console.log({ error });
        this.items.isLoading = false;
      }
    },
    
    async updateItem(form, id) {
      try {
        return await form.put(`${apiEndpoint}/${id}`);
      } catch (error) {
        return error;
      }
    },
    async deleteItem(id) {
      // this.items.data = this.items.data.filter((item) => item.id !== id);
      // sessionStorage.removeItem("cartItems");
      // sessionStorage.setItem("cartItems", JSON.stringify(this.items.data));

      try {
        return await http.delete(`${apiEndpoint}/${id}`);
      } catch (error) {
        return error;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
