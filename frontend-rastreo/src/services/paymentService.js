// Servicio para verificar el estado de pagos y morosidad de empresas
// IMPORTANTE: Los usuarios "Administrador" están EXENTOS del sistema de morosidad
// ya que son usuarios internos para gestión de flotas, no clientes finales
export class PaymentService {
  constructor() {
    this.currentUserPaymentStatus = null;
    this.checkInterval = null;
  }

  // Obtener estado de pagos desde el endpoint de morosidad
  // Este endpoint devuelve:
  // - Para usuarios normales: solo sus empresas morosas
  // - Para administradores: todas las empresas morosas del sistema
  async fetchPaymentStatus() {
    try {
      const response = await fetch("api/servicio/empresa.php/moroso/", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Error al consultar estado de pagos: ${response.status}`
        );
      }

      const data = await response.json();
      return data.empresas || [];
    } catch (error) {
      console.error("Error en PaymentService:", error);
      return [];
    }
  }

  // Verificar el estado de morosidad del usuario actual
  async checkUserPaymentStatus() {
    try {
      // CRÍTICO: Los administradores nunca deben tener restricciones
      // Son usuarios internos para gestión, no clientes finales
      const userRole = this.getUserRole();
      if (userRole === "Administrador") {
        this.currentUserPaymentStatus = {
          status: "No moroso",
          companies: [],
          restrictions: {
            menuDisabled: false,
            showModal: false,
            modalFrequency: null,
          },
        };
        return this.currentUserPaymentStatus;
      }

      // Solo verificar morosidad para usuarios clientes
      const paymentData = await this.fetchPaymentStatus();

      // Si no hay empresas morosas para este usuario, no es moroso
      if (!paymentData || paymentData.length === 0) {
        this.currentUserPaymentStatus = {
          status: "No moroso",
          companies: [],
          restrictions: {
            menuDisabled: false,
            showModal: false,
            modalFrequency: null,
          },
        };
        return this.currentUserPaymentStatus;
      }

      // Si hay empresas en la respuesta, significa que el usuario tiene morosidad
      const delinquentCompanies = paymentData.filter(
        (company) => company.deudor && company.deudor !== "No moroso"
      );

      if (delinquentCompanies.length === 0) {
        this.currentUserPaymentStatus = {
          status: "No moroso",
          companies: [],
          restrictions: {
            menuDisabled: false,
            showModal: false,
            modalFrequency: null,
          },
        };
        return this.currentUserPaymentStatus;
      }

      // Determinar el nivel más severo de morosidad
      const hasGrave = delinquentCompanies.some(
        (company) => company.deudor === "Moroso grave"
      );
      const hasLeve = delinquentCompanies.some(
        (company) => company.deudor === "Moroso leve"
      );

      const worstStatus = hasGrave
        ? "Moroso grave"
        : hasLeve
        ? "Moroso leve"
        : "No moroso";

      this.currentUserPaymentStatus = {
        status: worstStatus,
        companies: delinquentCompanies,
        restrictions: {
          menuDisabled: worstStatus === "Moroso grave",
          showModal: worstStatus !== "No moroso",
          modalFrequency: worstStatus === "Moroso leve" ? 30 * 60 * 1000 : null,
        },
      };

      return this.currentUserPaymentStatus;
    } catch (error) {
      console.error("Error al verificar estado de pagos del usuario:", error);
      // En caso de error, asumir que no es moroso para no bloquear funcionalidad
      return {
        status: "No moroso",
        companies: [],
        restrictions: {
          menuDisabled: false,
          showModal: false,
          modalFrequency: null,
        },
      };
    }
  }

  // Obtener el rol del usuario actual desde cookies
  getUserRole() {
    try {
      const cookies = document.cookie.split(";");
      const rolCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("rol=")
      );
      return rolCookie ? rolCookie.split("=")[1] : null;
    } catch (error) {
      console.error("Error al obtener rol del usuario:", error);
      return null;
    }
  }

  // Iniciar verificación periódica para moroso leve (cada 30 minutos)
  startPeriodicCheck(onStatusChange) {
    // Limpiar intervalo previo si existe
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Verificación inicial
    this.checkUserPaymentStatus().then(onStatusChange);

    // Verificación cada 30 minutos para mostrar modal a usuarios morosos leves
    this.checkInterval = setInterval(async () => {
      const status = await this.checkUserPaymentStatus();
      if (status && onStatusChange) {
        onStatusChange(status);
      }
    }, 30 * 60 * 1000); // 30 minutos
  }

  // Detener verificación periódica
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Obtener todas las empresas morosas (para administradores)
  async getAllDelinquentCompanies() {
    try {
      // Este método es para administradores, devuelve todas las empresas morosas
      const paymentData = await this.fetchPaymentStatus();

      // Filtrar solo las empresas que están morosas
      return paymentData.filter(
        (company) => company.deudor && company.deudor !== "No moroso"
      );
    } catch (error) {
      console.error("Error al obtener empresas morosas:", error);
      return [];
    }
  }

  // Obtener el estado actual del usuario
  getCurrentUserStatus() {
    return this.currentUserPaymentStatus;
  }
}

// Exportar una instancia única del servicio
export const paymentService = new PaymentService();

// Para debugging: hacer el servicio accesible globalmente en desarrollo
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.paymentService = paymentService;
}
