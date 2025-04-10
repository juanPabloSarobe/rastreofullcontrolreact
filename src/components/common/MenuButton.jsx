import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import ReportIcon from "@mui/icons-material/Report";
import LogoutIcon from "@mui/icons-material/Logout";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch"; // Importa el componente Switch
import { useContextValue } from "../../context/Context";

const MenuButton = () => {
  const { state, dispatch } = useContextValue(); // Accede al estado y dispatch del contexto
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Estado local para manejar "ocultaUnidadesDeBaja"
  const [ocultaUnidadesDeBaja, setOcultaUnidadesDeBaja] = useState(true);

  useEffect(() => {
    // Inicializa el estado local con el valor del estado global
    if (state.ocultaUnidadesDeBaja !== undefined) {
      setOcultaUnidadesDeBaja(state.ocultaUnidadesDeBaja);
    }
  }, [state.ocultaUnidadesDeBaja]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget); // Establece el elemento de anclaje para el menú
  };

  const handleClose = () => {
    setAnchorEl(null); // Cierra el menú
  };

  const changeToHistorico = () => {
    dispatch({ type: "SET_VIEW_MODE", payload: "historico" }); // Cambia la vista a "historico"
    handleClose();
  };

  const changeToRastreo = () => {
    dispatch({ type: "SET_VIEW_MODE", payload: "rastreo" }); // Cambia la vista a "rastreo"
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
  };

  const toggleOcultarBajas = () => {
    const newValue = !ocultaUnidadesDeBaja;
    setOcultaUnidadesDeBaja(newValue); // Actualiza el estado local
    dispatch({
      type: "SET_HIDE_LOW_UNITS",
      payload: newValue, // Actualiza el estado global
    });
  };

  const menuItems = [
    {
      icon: <EventIcon fontSize="small" />,
      label: "Rastreo",
      show: true,
      onClick: changeToRastreo, // Cambia la vista al hacer clic
    },
    {
      icon: <EventIcon fontSize="small" />,
      label: "Histórico",
      show: true,
      onClick: changeToHistorico, // Cambia la vista al hacer clic
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
      label: "Parciales",
      link: "/parciales",
      show: true,
      onClick: handleClose,
    },
    {
      icon: <SettingsIcon fontSize="small" />,
      label: "Administración",
      link: "https://plataforma.fullcontrolgps.com.ar/fulladm/#/",
      show: state.role === "Administrador" || state.role === "Proveedor", // Verifica si el rol es "Administrador" o "Proveedor"
      onClick: () => {
        // Abre la nueva página y asegura que las cookies se envíen automáticamente
        const url = "https://plataforma.fullcontrolgps.com.ar/fulladm/#/";
        const options = "noopener,noreferrer";

        // Abre la página en una nueva ventana
        window.open(url, "_blank", options);

        handleClose();
      },
    },
    {
      icon: <ReportIcon fontSize="small" />, // No necesita ícono
      label: "Ocultar Bajas",
      show: state.role === "Administrador", // Solo visible para el administrador
      onClick: toggleOcultarBajas, // No necesita acción al hacer clic
      renderRight: (
        <Switch
          checked={ocultaUnidadesDeBaja} // Usa el estado local
          onChange={toggleOcultarBajas} // Alterna el estado
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
              disableRipple={!item.onClick} // Desactiva el efecto de clic si no hay acción
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.label}
              {item.renderRight && (
                <Box sx={{ marginLeft: "auto" }}>{item.renderRight}</Box>
              )}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};

export default MenuButton;
