import { ref } from "vue";
import { axiosInstance } from "../api/axiosInstance.js";

export function usePayments() {
  const paymentMethods = ref([]);
  const invoiceResponse = ref(null);

  // Normaliza los métodos de pago para usar id y label en selects
  const normalizePaymentMethod = (method, index) => {
    return {
      id: method?.id ?? index,
      label: method?.name ?? `Método ${index + 1}`,
      ...method,
    };
  };

  // Obtener todos los métodos de pago
  async function fetchPaymentMethods() {
    try {
      const res = await axiosInstance.get("/payment-methods/all");
      const rawMethods = Array.isArray(res.data) ? res.data : [];
      paymentMethods.value = rawMethods.map(normalizePaymentMethod);
    } catch (e) {
      console.error("Error fetching payment methods:", e);
      paymentMethods.value = [];
    }
  }

  // Crear una factura
  async function createInvoice(invoiceData) {
    try {
      const res = await axiosInstance.post("/invoices", invoiceData);
      invoiceResponse.value = res.data;
      return res.data;
    } catch (e) {
      console.error("Error creating invoice:", e);
      return null;
    }
  }

  // Crear detalles de pago para la factura
  async function createPaymentDetail(detailData) {
    try {
      const res = await axiosInstance.post("/payment-details", detailData);
      return res.data;
    } catch (e) {
      console.error("Error creating payment detail:", e);
      return null;
    }
  }

  return {
    paymentMethods,
    invoiceResponse,
    fetchPaymentMethods,
    createInvoice,
    createPaymentDetail,
  };
}