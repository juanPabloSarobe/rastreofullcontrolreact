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

  // Procesa los datos
  const groupedUnits = liteData.GPS || {};

  // Filtra las unidades usando el texto de búsqueda con debounce
  const filteredUnits = useMemo(() => {
    if (!searchText) return groupedUnits;

    return Object.keys(groupedUnits).reduce((acc, empresa) => {
      // Optimiza el filtrado para solo verificar campos relevantes
      const filteredVehicles = groupedUnits[empresa].filter(
        (unit) =>
          unit.patente?.toLowerCase().includes(searchText.toLowerCase()) ||
          unit.id?.toLowerCase().includes(searchText) ||
          (unit.alias &&
            unit.alias.toLowerCase().includes(searchText.toLowerCase()))
      );

      if (filteredVehicles.length > 0) {
        acc[empresa] = filteredVehicles;
      }
      return acc;
    }, {});
  }, [groupedUnits, searchText]);

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
        {/* Campo de búsqueda */}
        <Box sx={{ padding: "8px" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar unidades..."
            value={searchInput}
            onChange={handleSearchChange}
            autoFocus
            onKeyDown={(event) => {
              event.stopPropagation();
            }}
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
