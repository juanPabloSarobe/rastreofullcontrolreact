import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import LogoutIcon from "@mui/icons-material/Logout";
import { useContextValue } from "../../context/Context"; // Importa el contexto

const MenuButton = () => {
  const { dispatch } = useContextValue(); // Accede al dispatch del contexto
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Obtén las variables del contexto
  const {
    state: { role, user },
  } = useContextValue();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget); // Establece el elemento de anclaje para el menú
  };

  const handleClose = () => {
    setAnchorEl(null); // Cierra el menú
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

  // Array de opciones del menú
  const menuItems = [
    {
      icon: <EventIcon fontSize="small" />,
      label: "Histórico Avanzado",
      link: "/historico",
      show: role === "Administrador" || role === "usuarioNormal", // Mostrar según el rol
      onClick: handleClose,
    },
    {
      icon: <BarChartIcon fontSize="small" />,
      label: "Informes",
      link: "/informes",
      show: role === "Administrador" || role === "usuarioNormal", // Solo para administradores
      onClick: handleClose,
    },
    {
      icon: <SsidChartIcon fontSize="small" />,
      label: "Parciales",
      link: "/parciales",
      show: role === "Administrador" || role === "usuarioNormal", // Solo para usuarios
      onClick: handleClose,
    },
    {
      icon: <SettingsIcon fontSize="small" />,
      label: "Administración",
      link: "https://plataforma.fullcontrolgps.com.ar/fulladm/#/",
      show: role === "Administrador" || role === "Proveedor", // Siempre visible
      onClick: () => {
        handleClose(); // Cierra el menú
        window.open(
          "https://plataforma.fullcontrolgps.com.ar/fulladm/#/",
          "_blank"
        ); // Abre la URL en una nueva pestaña
      },
    },
    {
      icon: <LogoutIcon fontSize="small" />,
      label: `Cerrar Sesión`, // Muestra el nombre del usuario o "Invitado"
      link: "/logout",
      show: true,
      onClick: () => {
        handleClose(); // Cierra el menú
        Logout();
      },
    },
  ];

  return (
    <>
      <IconButton
        color="black"
        aria-label="menu"
        size="large"
        onClick={handleClick} // Abre el menú al hacer clic
        sx={{
          backgroundColor: "white",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            backgroundColor: "lightgray", // Cambia el color a gris al hacer hover
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Menú desplegable */}
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
        {/* Generar opciones del menú dinámicamente */}
        {menuItems
          .filter((item) => item.show) // Filtrar los ítems que deben mostrarse
          .map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.onClick} // Ejecuta la acción específica del ítem
              sx={{ paddingY: 1.5 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.label}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default MenuButton;
