import React, { useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import SearchIcon from "@mui/icons-material/Search";
import ListItemIcon from "@mui/material/ListItemIcon";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { FixedSizeList as List } from "react-window";
import { useDebounce } from "use-debounce";
import Tooltip from "@mui/material/Tooltip";

import StatusIcon from "./StatusIcon";
import logoFullControl from "../../assets/LogoFullcontrolSoloGota.webp";
import { Typography } from "@mui/material";
import { useContextValue } from "../../context/Context";

// Componente memoizado para cada elemento de unidad
const UnitItem = React.memo(({ unit, isSelected, onToggle }) => {
  return (
    <MenuItem onClick={() => onToggle(unit.Movil_ID)}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <ListItemIcon>
          <StatusIcon mot={unit.mot} fec={unit.fec} />
        </ListItemIcon>
        <span>{unit.patente}</span>
        <Switch
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggle(unit.Movil_ID)}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: "green" },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "green",
            },
          }}
        />
      </Box>
    </MenuItem>
  );
});

// Componente memoizado para renderizar cada ítem en la lista virtualizada
const VirtualizedItem = React.memo(({ index, style, data }) => {
  const { items, selectedUnits, onToggle } = data;
  const item = items[index];

  // Renderiza un encabezado
  if (item.type === "header") {
    return <ListSubheader style={style}>{item.label}</ListSubheader>;
  }

  // Renderiza un elemento de unidad
  return (
    <div style={style}>
      <UnitItem
        unit={item.unit}
        isSelected={selectedUnits.includes(item.unit.Movil_ID)}
        onToggle={onToggle}
      />
    </div>
  );
});

// Componente principal
const UnitSelector = React.memo(({ liteData = {}, onUnitSelect }) => {
  const { state, dispatch } = useContextValue();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchText] = useDebounce(searchInput, 300); // Aplica debounce de 300ms
  const [selectAll, setSelectAll] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSwitchToggle = useCallback(
    (unitId) => {
      const updatedUnits = state.selectedUnits.includes(unitId)
        ? state.selectedUnits.filter((id) => id !== unitId)
        : [...state.selectedUnits, unitId];

      dispatch({ type: "SET_SELECTED_UNITS", payload: updatedUnits });
      onUnitSelect(updatedUnits);

      setTimeout(() => {
        handleClose();
      }, 200);
    },
    [state.selectedUnits, dispatch, onUnitSelect, handleClose]
  );

  const handleSearchChange = useCallback((event) => {
    setSearchInput(event.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  // Función para seleccionar/deseleccionar todas las unidades
  const handleSelectAll = useCallback(() => {
    const newSelectAllState = !selectAll;
    setSelectAll(newSelectAllState);

    // Obtener todas las unidades disponibles
    const allUnits = [];
    Object.keys(liteData.GPS || {}).forEach((empresa) => {
      // Para usuarios no administradores, excluimos unidades de "De Baja" o empresa vacía
      if (
        state.role !== "Administrador" &&
        (empresa === "De Baja" || empresa === "")
      ) {
        return; // Saltar esta empresa
      }

      liteData.GPS[empresa].forEach((unit) => {
        if (unit && unit.Movil_ID) {
          allUnits.push(unit.Movil_ID);
        }
      });
    });

    // Actualizar selección basada en el estado del switch
    const updatedUnits = newSelectAllState ? allUnits : [];

    dispatch({ type: "SET_SELECTED_UNITS", payload: updatedUnits });
    onUnitSelect(updatedUnits);

    // Si seleccionamos todas, cerramos el selector para que se vean seleccionadas
    if (newSelectAllState) {
      setTimeout(() => {
        handleClose();
      }, 200);
    }
  }, [selectAll, liteData, dispatch, onUnitSelect, handleClose, state.role]);

  // Procesa los datos
  const groupedUnits = liteData.GPS || {};

  // Filtra las unidades usando el texto de búsqueda con debounce
  const filteredUnits = useMemo(() => {
    if (!searchText) {
      // Si no hay texto de búsqueda, aplicamos filtros según el rol del usuario
      if (state.role !== "Administrador") {
        // Para usuarios no administradores, filtramos empresas "De Baja" y con nombres vacíos
        const filteredGroups = {};

        Object.keys(groupedUnits).forEach((empresa) => {
          // Excluimos las empresas "De Baja" o con nombre vacío
          if (empresa !== "De Baja" && empresa !== "") {
            filteredGroups[empresa] = groupedUnits[empresa];
          }
        });

        return filteredGroups;
      }
      return groupedUnits;
    }

    // Si hay texto de búsqueda, filtramos por texto pero manteniendo la lógica de filtrado por rol
    return Object.keys(groupedUnits).reduce((acc, empresa) => {
      // Para usuarios no administradores, excluimos empresas "De Baja" o con nombre vacío
      if (
        state.role !== "Administrador" &&
        (empresa === "De Baja" || empresa === "")
      ) {
        return acc;
      }

      // Filtrado por texto de búsqueda
      const filteredVehicles = groupedUnits[empresa].filter(
        (unit) =>
          unit.patente?.toLowerCase().includes(searchText.toLowerCase()) ||
          unit.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
          unit.empr?.toLowerCase().includes(searchText.toLowerCase()) ||
          unit.id?.toLowerCase().includes(searchText.toLowerCase()) ||
          (unit.alias &&
            unit.alias.toLowerCase().includes(searchText.toLowerCase()))
      );

      if (filteredVehicles.length > 0) {
        acc[empresa] = filteredVehicles;
      }
      return acc;
    }, {});
  }, [groupedUnits, searchText, state.role]);

  // Prepara los datos para la lista virtualizada
  const listItems = useMemo(() => {
    const items = [];
    Object.keys(filteredUnits).forEach((empresa) => {
      // Agrega el encabezado de la empresa
      items.push({ type: "header", label: empresa });
      // Agrega las unidades de esta empresa
      filteredUnits[empresa].forEach((unit) => {
        items.push({ type: "unit", unit });
      });
    });
    return items;
  }, [filteredUnits]);

  // Altura aproximada de cada elemento
  const itemHeight = 48;
  // Altura del campo de búsqueda
  const searchFieldHeight = 64;
  // Altura máxima para la lista
  const maxListHeight = 336; // 400 - searchFieldHeight

  return (
    <Box
      position="absolute"
      top="16px"
      left="16px"
      sx={{
        width: { xs: "75%", sm: "400px" },
        maxWidth: "400px",
        minHeight: "48px",
        zIndex: 1000,
        bgcolor: "white",
        borderRadius: open ? "24px 24px 0px 0px" : "24px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Button
        variant="contained"
        onClick={handleClick}
        fullWidth
        sx={{
          justifyContent: "space-between",
          backgroundColor: "white",
          color: "black",
          borderRadius: open ? "24px 24px 0px 0px" : "24px",
          minHeight: "48px",
          "&:hover": {
            backgroundColor: "lightgray",
          },
          paddingLeft: "8px",
        }}
      >
        <Box
          component="img"
          src={logoFullControl}
          alt="Logo FullControl"
          sx={{
            height: "32px",
            width: "20px",
            marginLeft: "12px",
          }}
        />
        <Typography
          variant="body1"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            fontSize: { xs: "12px", sm: "16px" },
          }}
        >
          Seleccionar Unidades
        </Typography>
        <SearchIcon sx={{ marginLeft: "8px" }} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableAutoFocusItem
        disableScrollLock
        slotProps={{
          paper: {
            style: {
              maxHeight: 400,
              width: anchorEl
                ? `${anchorEl.offsetWidth}px`
                : { xs: "75%", sm: "400px" },
              borderRadius: "0px 0px 24px 24px",
              overflowY: "hidden", // Cambiado a hidden para dejar que react-window maneje el scroll
              paddingRight: "0px", // Eliminado el padding extra
            },
          },
        }}
      >
        {/* Campo de búsqueda con switch para seleccionar todos */}
        <Box
          sx={{
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar unidades..."
            value={searchInput}
            onChange={handleSearchChange}
            autoFocus
            onKeyDown={(event) => {
              event.stopPropagation();
            }}
            sx={{ flexGrow: 1, mr: 1 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {searchInput && (
                      <IconButton onClick={handleClearSearch} size="small">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              },
            }}
          />
          <Tooltip title="Seleccionar todos">
            <Switch
              checked={selectAll}
              onChange={handleSelectAll}
              color="success"
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "green" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "green",
                },
              }}
            />
          </Tooltip>
        </Box>

        {/* Lista virtualizada de unidades */}
        {listItems.length > 0 ? (
          <List
            height={Math.min(maxListHeight, listItems.length * itemHeight)}
            width="100%"
            itemCount={listItems.length}
            itemSize={itemHeight}
            itemData={{
              items: listItems,
              selectedUnits: state.selectedUnits,
              onToggle: handleSwitchToggle,
            }}
          >
            {VirtualizedItem}
          </List>
        ) : (
          <MenuItem disabled>No se encontraron resultados</MenuItem>
        )}
      </Menu>
    </Box>
  );
});

export default UnitSelector;
