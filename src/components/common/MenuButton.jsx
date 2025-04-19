import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import EventIcon from "@mui/icons-material/Event";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import ReportIcon from "@mui/icons-material/Report";
import LogoutIcon from "@mui/icons-material/Logout";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useContextValue } from "../../context/Context";
import AdvancedHistoryModal from "./AdvancedHistoryModal";
import ContractReportsModal from "./ContractReportsModal"; // Importar el nuevo componente

const MenuButton = ({ selectedUnit }) => {
  const { state, dispatch } = useContextValue();
  const [anchorEl, setAnchorEl] = useState(null);
  const [ocultaUnidadesDeBaja, setOcultaUnidadesDeBaja] = useState(true);
  const [advancedHistoryOpen, setAdvancedHistoryOpen] = useState(false);
  const [contractReportsOpen, setContractReportsOpen] = useState(false); // Nuevo estado
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (state.ocultaUnidadesDeBaja !== undefined) {
      setOcultaUnidadesDeBaja(state.ocultaUnidadesDeBaja);
    }
  }, [state.ocultaUnidadesDeBaja]);

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

  // Nuevo manejador para abrir el modal de Informes Parciales
  const openContractReports = () => {
    setContractReportsOpen(true);
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
    },
    {
      icon: <BarChartIcon fontSize="small" />,
      label: "Informes",
      link: "https://plataforma.fullcontrolgps.com.ar/informes/",
      show: true,
      onClick: () => {
        window.open(
          "https://plataforma.fullcontrolgps.com.ar/informes/",
          "_blank"
        );
        handleClose();
      },
    },
    {
      icon: <SsidChartIcon fontSize="small" />,
      label: "Informes Parciales", // Cambiamos el texto del menú
      show: true,
      onClick: openContractReports, // Usamos el nuevo manejador
    },
    {
      icon: <SettingsIcon fontSize="small" />,
      label: "Administración",
      link: "https://plataforma.fullcontrolgps.com.ar/fulladm/#/",
      show: state.role === "Administrador" || state.role === "Proveedor",
      onClick: () => {
        const url = "https://plataforma.fullcontrolgps.com.ar/fulladm/#/";
        const options = "noopener,noreferrer";
        window.open(url, "_blank", options);
        handleClose();
      },
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
        />
      ),
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
        size="large"
        onClick={handleClick}
        sx={{
          backgroundColor: "white",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            backgroundColor: "lightgray",
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {menuItems
          .filter((item) => item.show)
          .map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.onClick}
              sx={{ paddingY: 1.5 }}
              disableRipple={!item.onClick}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
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
    </Box>
  );
};

export default MenuButton;
