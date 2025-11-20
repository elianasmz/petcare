import { ref, computed } from 'vue'
import ReservationApi from '../api/ReservationApi.js'
import CarerApi from '../api/CarerApi.js'
import OwnerApi from '../api/OwnerApi.js'
import ServiceApi from '../api/ServiceApi.js'

// Estado global (singleton)
const reservations = ref([])
const reservationServices = ref([])
const selectedReservation = ref(null)
const selectedServices = ref(null)
const loading = ref(false)
const error = ref(null)
const pageable = ref({
  pageNumber: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
})
const filter = ref({
  state: "Todas",
  ownerId: null,
})
const states = {
  'PENDING': 'Pendiente',
  'ACCEPTED': 'Aceptada',
  'REJECTED': 'Rechazada',
  'FINISHED': 'Finalizada',
}
const statesBack = {
  "Pendiente": "PENDING",
  "Aceptada": "ACCEPTED",
  "Rechazada": "REJECTED",
  "Finalizada": "FINISHED",
}

export function useReservations() {
  async function getAllReservations(params = {}) {
    loading.value = true
    error.value = null
    try {
      const resp = await ReservationApi.getAllReservations(params)
      const reservationBase = resp.data.content || []
      
      pageable.value = {
        pageNumber: resp.data.pageable?.pageNumber || 0,
        pageSize: resp.data.pageable?.pageSize || 10,
        totalElements: resp.data.totalElements || 0,
        totalPages: resp.data.totalPages || 0,
      }

      // Enriquecer con datos de carer y owner
      const enriched = await Promise.all(
        reservationBase.map(async (res) => {
          let carer = null
          let owner = null
          try {
            if (res.carerId) {
              const carerRes = await CarerApi.getCarerById(res.carerId)
              carer = carerRes.data || { name: "Desconocido", lastName: "" }
            }
          } catch (err) {
            carer = { name: "Desconocido", lastName: "" }
          }

          try {
            if (res.ownerId) {
              const ownerRes = await OwnerApi.getOwnerById(res.ownerId)
              owner = ownerRes.data || { name: "Desconocido", lastName: "" }
            }
          } catch (err) {
            owner = { name: "Desconocido", lastName: "" }
          }

          return {
            ...res,
            carer: carer || { name: "Desconocido", lastName: "" },
            owner: owner || { name: "Desconocido", lastName: "" },
            services: [],
          }
        })
      )

      reservations.value = enriched
      return enriched
    } catch (err) {
      console.error("Error al obtener reservaciones:", err)
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getReservationById(id) {
    loading.value = true
    error.value = null
    try {
      const resp = await ReservationApi.getReservationById(id)
      const res = resp.data
      
      // Enriquecer con datos
      let carer = null
      let owner = null
      try {
        if (res.carerId) {
          const carerRes = await CarerApi.getCarerById(res.carerId)
          carer = carerRes.data || { name: "Desconocido", lastName: "" }
        }
      } catch (err) {
        carer = { name: "Desconocido", lastName: "" }
      }

      try {
        if (res.ownerId) {
          const ownerRes = await OwnerApi.getOwnerById(res.ownerId)
          owner = ownerRes.data || { name: "Desconocido", lastName: "" }
        }
      } catch (err) {
        owner = { name: "Desconocido", lastName: "" }
      }

      const enriched = {
        ...res,
        carer: carer || { name: "Desconocido", lastName: "" },
        owner: owner || { name: "Desconocido", lastName: "" },
        services: [],
      }

      selectedReservation.value = enriched
      return enriched
    } catch (err) {
      console.error("Error al obtener reservación:", err)
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchReservations({ page = 0, size = 10, sortBy = 'id', sortDir = 'DESC', ownerId = null, carerId = null, state = null } = {}) {
    loading.value = true
    error.value = null
    try {
      // Mapear estado legible -> enum backend
      const stateFilter = filter.value.state
      const stateEnum = statesBack[stateFilter] || state || null

      // Armar filtros
      const filters = {
        ownerId: ownerId || filter.value.ownerId || null,
        carerId: carerId || null,
        state: stateEnum || null,
        page,
        size,
        sortBy,
        sortDir,
      }

      const resp = await ReservationApi.searchReservations(filters)
      const reservationBase = resp.data.content || []

      // Actualizar paginación
      pageable.value = {
        pageNumber: resp.data.pageable?.pageNumber || page,
        pageSize: resp.data.pageable?.pageSize || size,
        totalElements: resp.data.totalElements || 0,
        totalPages: resp.data.totalPages || 0,
      }

      // Enriquecer con datos de carer y owner
      const enriched = await Promise.all(
        reservationBase.map(async (res) => {
          let carer = null
          let owner = null
          try {
            if (res.carerId) {
              const carerRes = await CarerApi.getCarerById(res.carerId)
              carer = carerRes.data || { name: "Desconocido", lastName: "" }
            }
          } catch (err) {
            carer = { name: "Desconocido", lastName: "" }
          }

          try {
            if (res.ownerId) {
              const ownerRes = await OwnerApi.getOwnerById(res.ownerId)
              owner = ownerRes.data || { name: "Desconocido", lastName: "" }
            }
          } catch (err) {
            owner = { name: "Desconocido", lastName: "" }
          }

          return {
            ...res,
            carer: carer || { name: "Desconocido", lastName: "" },
            owner: owner || { name: "Desconocido", lastName: "" },
            services: [],
          }
        })
      )

      reservations.value = enriched

      // Cargar servicios para cada reserva
      for (const res of enriched) {
        try {
          const services = await getServicesByReservation(res.id)
          res.services = services || []
        } catch (err) {
          res.services = []
        }
      }

    } catch (err) {
      console.error("Error al buscar reservaciones:", err)
      error.value = err.response?.data?.message || err.message
    } finally {
      loading.value = false
    }
  }

  async function getServicesByReservation(reservationId) {
    try {
      const res = await ReservationApi.getServicesByReservation(reservationId)
      const services = res.data || []

      const relationsServices = await Promise.all(
        services.map(async (rs) => {
          let service = { name: "Servicio desconocido" }
          try {
            const fetchedService = await ServiceApi.getServiceTypeById(rs.serviceId)
            service = fetchedService.data || service
          } catch (err) {
            console.warn(`No se pudo obtener servicio ${rs.serviceId}:`, err)
          }
          return {
            ...rs,
            service: service,
          }
        })
      )

      // Actualizar reservationServices
      reservationServices.value = reservationServices.value.filter(rs => rs.reservationId !== reservationId)
      reservationServices.value.push(...relationsServices)

      return relationsServices
    } catch (err) {
      console.error("Error al obtener los servicios de la reservación:", err)
      return []
    }
  }

  async function postReservation(data) {
    loading.value = true
    error.value = null
    try {
      const response = await ReservationApi.postReservation(data)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postReservationService(data) {
    try {
      const response = await ReservationApi.postReservationService(data)
      return response
    } catch (err) {
      console.error("Error al crear relación Reservation-Service:", err)
      throw err
    }
  }

  async function updateReservationState(id, newState) {
    loading.value = true
    error.value = null
    try {
      const existingReservation = reservations.value.find(r => r.id === id)
      if (!existingReservation) {
        throw new Error(`Reservación con ID ${id} no encontrada.`)
      }
      const payload = { ...existingReservation, reservationState: newState }
      const res = await ReservationApi.putReservation(id, payload)
      const idx = reservations.value.findIndex(r => r.id === id)
      if (idx !== -1) reservations.value[idx] = res.data
      if (selectedReservation.value?.id === id) selectedReservation.value = res.data
      return res.data
    } catch (err) {
      console.error(`Error al actualizar el estado de la reservación ${id}:`, err)
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function rejectReservation(id, reason) {
    loading.value = true
    error.value = null
    try {
      const existingReservation = reservations.value.find(r => r.id === id)
      if (!existingReservation) {
        throw new Error(`Reservación con ID ${id} no encontrada.`)
      }
      const payload = { ...existingReservation, reservationState: "REJECTED", note: reason }
      const res = await ReservationApi.putReservation(id, payload)
      const idx = reservations.value.findIndex(r => r.id === id)
      if (idx !== -1) reservations.value[idx] = res.data
      if (selectedReservation.value?.id === id) selectedReservation.value = res.data
      return res.data
    } catch (err) {
      console.error(`Error al rechazar la reservación ${id}:`, err)
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getAllReservationServices() {
  try {
    const res = await ReservationApi.getAllReservationServices();
    const relations = res.data;

    // 🔥 cargar datos del servicio asociado a cada relación
    const enriched = await Promise.all(
      relations.map(async (rel) => {
        try {
          const serviceRes = await ServiceApi.getServiceTypeById(rel.serviceTypeId);
          return {
            ...rel,
            service: serviceRes.data  // 👈 ahora getServicesForReservation tendrá datos reales
          };
        } catch (e) {
          console.error("Error cargando serviceType:", rel.serviceTypeId, e);
          return { ...rel, service: null };
        }
      })
    );

    reservationServices.value = enriched;
  } catch (err) {
    console.error("Error cargando ReservationServices:", err);
  }
}


  return {
    // Estado
    reservations,
    reservationServices,
    selectedReservation,
    selectedServices,
    loading,
    error,
    pageable,
    filter,
    states,
    statesBack,
    // Acciones
    getAllReservations,
    getReservationById,
    searchReservations,
    getServicesByReservation,
    postReservation,
    postReservationService,
    updateReservationState,
    rejectReservation,
    getAllReservationServices,
  }
}

