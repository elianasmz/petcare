import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null, // datos de sesión
    role: null, // 'owner' | 'carer' | 'admin'
  }),
  actions: {
    login(email, password) {
      // simular login (luego conectás a backend)
      this.user = { id: 1, name: "Eliana", email }
      this.role = "owner"
    },
    logout() {
      this.user = null
      this.role = null
    }
  },
})
