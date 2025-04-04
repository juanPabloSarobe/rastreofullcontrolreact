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
import { useContextValue } from "../../context/Context";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const MenuButton = () => {
  const { dispatch } = useContextValue();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Detecta si la pantalla es móvil o escritorio
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const menuItems = [
    {
      icon: <EventIcon fontSize="small" />,
      label: "Histórico Avanzado",
      link: "/historico",
      show: true,
      onClick: handleClose,
    },
    {
      icon: <BarChartIcon fontSize="small" />,
      label: "Informes",
      link: "https://plataforma.fullcontrolgps.com.ar/informes/",
      show: true,
      onClick: () => {
        handleClose();
        window.open(
          "https://plataforma.fullcontrolgps.com.ar/informes/",
          "_blank"
        );
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
      show: true,
      onClick: () => {
        handleClose();
        window.open(
          "https://plataforma.fullcontrolgps.com.ar/fulladm/#/",
          "_blank"
        );
      },
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
    <>
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

      {/* Menú desplegable */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: isMobile ? "top" : "bottom", // En móviles, el menú se abre hacia arriba
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: isMobile ? "bottom" : "top", // En móviles, el menú aparece desde abajo
          horizontal: "center",
        }}
      >
        {menuItems
          .filter((item) => item.show)
          .map((item, index) => (
            <MenuItem key={index} onClick={item.onClick} sx={{ paddingY: 1.5 }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.label}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default MenuButton;
