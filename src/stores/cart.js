import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  getters: {
    totalQuantity: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: (state) => state.items.reduce((total, item) => total + item.price * item.quantity, 0),
    getItemQuantity: (state) => (dishId) => {
      const item = state.items.find(item => item.id === dishId)
      return item ? item.quantity : 0
    }
  },

  actions: {
    addItem(dish) {
      const existingItem = this.items.find(item => item.id === dish.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity: 1
        })
      }
    },

    updateItemQuantity(dishId, quantity) {
      const item = this.items.find(item => item.id === dishId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(dishId)
        } else {
          item.quantity = quantity
        }
      }
    },

    removeItem(dishId) {
      const index = this.items.findIndex(item => item.id === dishId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    clearCart() {
      this.items = []
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'cart',
        storage: localStorage
      }
    ]
  }
}) 