import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import ListAltIcon from "@mui/icons-material/ListAlt"; // Nuevo icono para Flotas
import ReportIcon from "@mui/icons-material/Report";
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Nuevo icono para Ubicación
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications"; // Nuevo icono para Notificaciones
import HelpIcon from "@mui/icons-material/Help"; // Nuevo icono para Manual
import BusinessIcon from "@mui/icons-material/Business"; // Nuevo icono para Empresas Morosas
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useContextValue } from "../../context/Context";
import AdvancedHistoryModal from "./AdvancedHistoryModal";
import ContractReportsModal from "./ContractReportsModal";
import FleetAdminModal from "./FleetAdminModal"; // Importar el nuevo componente
import NoUnitSelectedModal from "./NoUnitSelectedModal"; // Importar el nuevo componente
import UnitReportModal from "./UnitReportModal"; // Asegurarnos de importar el modal
import NotificationAdminModal from "./NotificationAdminModal"; // Importar el nuevo componente
import UserManualModal from "./UserManualModal"; // Importar el manual de usuario
import LocationReportModal from "./LocationReportModal"; // Importar el nuevo reporte de ubicación
import DelinquentCompaniesModal from "./DelinquentCompaniesModal"; // Importar el modal de empresas morosas
import { useNotifications } from "../../hooks/useNotifications"; // Añadir esta importación
import { paymentService } from "../../services/paymentService";

// Función simplificada para abrir una URL externa con cookies existentes
const openExternalUrl = (url) => {
  window.open(url, "_blank");
};

const MenuButton = ({ selectedUnit }) => {
  const { state, dispatch } = useContextValue();
  const [anchorEl, setAnchorEl] = useState(null);
  const [ocultaUnidadesDeBaja, setOcultaUnidadesDeBaja] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [advancedHistoryOpen, setAdvancedHistoryOpen] = useState(false);
  const [contractReportsOpen, setContractReportsOpen] = useState(false);
  const [fleetAdminOpen, setFleetAdminOpen] = useState(false); // Nuevo estado
  const [notificationAdminOpen, setNotificationAdminOpen] = useState(false); // Nuevo estado
  const [delinquentCompaniesOpen, setDelinquentCompaniesOpen] = useState(false); // Nuevo estado para empresas morosas
  const [noUnitModalOpen, setNoUnitModalOpen] = useState(false);
  const [unitReportOpen, setUnitReportOpen] = useState(false);
  const [userManualOpen, setUserManualOpen] = useState(false); // Nuevo estado para el manual de usuario
  const [locationReportOpen, setLocationReportOpen] = useState(false); // Nuevo estado para reporte de ubicación
  const open = Boolean(anchorEl);

  // Obtener la función createNotification del hook
  const { createNotification } = useNotifications();

  useEffect(() => {
    if (state.ocultaUnidadesDeBaja !== undefined) {
      setOcultaUnidadesDeBaja(state.ocultaUnidadesDeBaja);
    }
  }, [state.ocultaUnidadesDeBaja]);

  // Efecto para obtener el estado de pagos
  useEffect(() => {
    const getCurrentPaymentStatus = () => {
      const status = paymentService.getCurrentUserStatus();
      setPaymentStatus(status);
    };

    // Obtener estado inicial
    getCurrentPaymentStatus();

    // Actualizar cada vez que cambie el estado de pago
    const interval = setInterval(getCurrentPaymentStatus, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Verificar si el usuario tiene restricciones de menú
  const isMenuRestricted = paymentStatus?.restrictions?.menuDisabled || false;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openAdvancedHistory = () => {
    setAdvancedHistoryOpen(true);
    handleClose();
  };

  const openContractReports = () => {
    setContractReportsOpen(true);
    handleClose();
  };

  // Nuevo manejador para abrir el administrador de flotas
  const openFleetAdmin = () => {
    setFleetAdminOpen(true);
    handleClose();
  };

  // Nuevo manejador para abrir el administrador de notificaciones
  const openNotificationAdmin = () => {
    setNotificationAdminOpen(true);
    handleClose();
  };

  // Nuevo manejador para abrir el modal de empresas morosas
  const openDelinquentCompanies = () => {
    setDelinquentCompaniesOpen(true);
    handleClose();
  };

  // Nuevo manejador para abrir el manual de usuario
  const openUserManual = () => {
    setUserManualOpen(true);
    handleClose();
  };

  // Nuevo manejador para abrir el reporte de ubicación
  const openLocationReport = () => {
    setLocationReportOpen(true);
    handleClose();
  };

  const handleOpenReport = () => {
    if (selectedUnit) {
      setUnitReportOpen(true);
    } else {
      setNoUnitModalOpen(true);
    }
    handleClose();
  };

  const Logout = () => {
    document.cookie = "rol=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "sesion=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    dispatch({ type: "SET_ACCESS_GRANTED", payload: false });
    dispatch({ type: "SET_ROLE", payload: null });
    dispatch({ type: "SET_USER", payload: null });
    dispatch({ type: "SET_SELECTED_UNITS", payload: [] });
  };

  const toggleOcultarBajas = () => {
    const newValue = !ocultaUnidadesDeBaja;
    setOcultaUnidadesDeBaja(newValue);
    dispatch({
      type: "SET_HIDE_LOW_UNITS",
      payload: newValue,
    });
  };

  const menuItems = [
    {
      icon: <HistoryIcon fontSize="small" />,
      label: "Histórico Avanzado",
      show: true,
      onClick: openAdvancedHistory,
      disabled: isMenuRestricted,
    },
    {
      icon: <LocationOnIcon fontSize="small" />, // Nuevo icono para Reporte de Ubicación
      label: "Reporte de Posición Actual", // Nueva opción de menú
      show: true, // Mostrar a todos los usuarios
      onClick: openLocationReport, // Nuevo manejador
      disabled: isMenuRestricted,
    },
    {
      icon: <ListAltIcon fontSize="small" />, // Nuevo icono para Flotas
      label: "Flotas", // Nueva opción de menú
      show: true, // Mostrar a todos los usuarios
      onClick: openFleetAdmin, // Nuevo manejador
      disabled: isMenuRestricted,
    },
    /* {
      icon: <NotificationsIcon fontSize="small" />, // Nuevo icono para Notificaciones
      label: "Gestionar Notificaciones", // Nueva opción de menú
      show: state.role === "Administrador", // Mostrar solo a administradores
      onClick: openNotificationAdmin, // Nuevo manejador
      disabled: isMenuRestricted,
    }, */
    {
      icon: <BusinessIcon fontSize="small" />, // Nuevo icono para Empresas Morosas
      label: "Empresas Morosas", // Nueva opción de menú
      show: state.role === "Administrador", // Mostrar solo a administradores
      onClick: openDelinquentCompanies, // Nuevo manejador
      disabled: isMenuRestricted,
    },
    {
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      label: "Certificado de Funcionamiento",
      show: true, // Siempre visible
      onClick: handleOpenReport,
      disabled: isMenuRestricted,
    },
    {
      icon: <BarChartIcon fontSize="small" />,
      label: "Informes",
      show: true,
      onClick: () => {
        // Cambiamos para usar la función getFullURL
        openExternalUrl("https://plataforma.fullcontrolgps.com.ar/informes/");
        handleClose();
      },
      disabled: isMenuRestricted,
    },
    {
      icon: <SsidChartIcon fontSize="small" />,
      label: "Informes Parciales",
      show: true,
      onClick: openContractReports,
      disabled: isMenuRestricted,
    },
    {
      icon: <SettingsIcon fontSize="small" />,
      label: "Administración",
      show: state.role === "Administrador" || state.role === "Proveedor",
      onClick: () => {
        // Cambiamos para usar la función getFullURL
        openExternalUrl("https://plataforma.fullcontrolgps.com.ar/fulladm/");
        handleClose();
      },
      disabled: isMenuRestricted,
    },
    {
      icon: <ReportIcon fontSize="small" />,
      label: "Ocultar Bajas",
      show: state.role === "Administrador",
      onClick: toggleOcultarBajas,
      renderRight: (
        <Switch
          checked={ocultaUnidadesDeBaja}
          onChange={toggleOcultarBajas}
          color="primary"
          disabled={isMenuRestricted}
        />
      ),
      disabled: isMenuRestricted,
    },
    {
      icon: <HelpIcon fontSize="small" />,
      label: "Manual de Usuario",
      show: true, // Mostrar a todos los usuarios
      onClick: openUserManual, // Nuevo manejador
      disabled: isMenuRestricted,
    },
    {
      icon: <LogoutIcon fontSize="small" />,
      label: "Cerrar Sesión",
      link: "/logout",
      show: true,
      onClick: () => {
        handleClose();
        Logout();
      },
      disabled: false, // Cerrar sesión nunca debe estar deshabilitado
    },
  ];

  return (
    <Box
      position="absolute"
      zIndex={1000}
      sx={{
        top: "16px",
        right: "16px",
      }}
    >
      <IconButton
        color="black"
        aria-label="menu"
        onClick={handleClick}
        sx={{
          height: "48px",
          width: "48px",
          backgroundColor: "white",
          "&:hover": { backgroundColor: "lightgrey" },
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        {menuItems
          .filter((item) => item.show)
          .map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.disabled ? undefined : item.onClick}
              disabled={item.disabled}
              sx={{
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? "not-allowed" : "pointer",
                "&.Mui-disabled": {
                  opacity: 0.5,
                },
              }}
            >
              <ListItemIcon sx={{ opacity: item.disabled ? 0.5 : 1 }}>
                {item.icon}
              </ListItemIcon>
              {item.label}
              {item.renderRight && (
                <Box sx={{ marginLeft: "auto" }}>{item.renderRight}</Box>
              )}
            </MenuItem>
          ))}
      </Menu>

      {/* Modal de Histórico Avanzado */}
      <AdvancedHistoryModal
        open={advancedHistoryOpen}
        onClose={() => setAdvancedHistoryOpen(false)}
        selectedUnit={selectedUnit}
      />

      {/* Modal de Informes Parciales */}
      <ContractReportsModal
        open={contractReportsOpen}
        onClose={() => setContractReportsOpen(false)}
      />

      {/* Modal de Administración de Flotas */}
      <FleetAdminModal
        open={fleetAdminOpen}
        onClose={() => setFleetAdminOpen(false)}
      />

      {/* Modal de Reporte de Posición Actual */}
      <LocationReportModal
        open={locationReportOpen}
        onClose={() => setLocationReportOpen(false)}
      />

      {/* Modal de unidad no seleccionada */}
      <NoUnitSelectedModal
        open={noUnitModalOpen}
        onClose={() => setNoUnitModalOpen(false)}
        message="Seleccionar unidad para obtener el Certificado de Funcionamiento"
      />

      {/* Modal de informe de unidad */}
      <UnitReportModal
        open={unitReportOpen}
        onClose={() => setUnitReportOpen(false)}
        unitData={selectedUnit}
      />

      {/* Modal de Administración de Notificaciones */}
      <NotificationAdminModal
        open={notificationAdminOpen}
        onClose={() => setNotificationAdminOpen(false)}
        onSave={createNotification} // Esta función vendría del hook useNotifications
      />

      {/* Modal de Manual de Usuario */}
      <UserManualModal
        open={userManualOpen}
        onClose={() => setUserManualOpen(false)}
      />

      {/* Modal de Empresas Morosas */}
      <DelinquentCompaniesModal
        open={delinquentCompaniesOpen}
        onClose={() => setDelinquentCompaniesOpen(false)}
      />
    </Box>
  );
};

export default MenuButton;
