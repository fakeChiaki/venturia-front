// src/services/user.service.js
import api from './api'

const userService = {
  async getMe() {
    // Simulación local del endpoint para el MVP sin romper el tipado
    return {
      id: 'usr-1',
      fullName: 'Fernando Robles',
      email: 'fernando@ufro.cl',
      avatar: '', 
      roles: ['developer', 'designer'],
      isAdmin: true
    }
  }
}

export default userService