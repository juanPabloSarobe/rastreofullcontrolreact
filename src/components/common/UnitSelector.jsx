import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch"; // Importa el componente Switch
import SearchIcon from "@mui/icons-material/Search"; // Importa el ícono de lupa

const UnitSelector = ({ liteData = {}, onUnitSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState(""); // Estado para el texto de búsqueda
  const [selectedUnits, setSelectedUnits] = useState([]); // Estado para los elementos seleccionados
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchToggle = (unitId) => {
    setSelectedUnits(
      (prevSelected) =>
        prevSelected.includes(unitId)
          ? prevSelected.filter((id) => id !== unitId) // Deselecciona si ya está seleccionado
          : [...prevSelected, unitId] // Selecciona si no está seleccionado
    );

    // Envía la lista actualizada de unidades seleccionadas al componente padre
    onUnitSelect(
      selectedUnits.includes(unitId)
        ? selectedUnits.filter((id) => id !== unitId)
        : [...selectedUnits, unitId]
    );

    // Cierra el menú después de 1 segundo
    setTimeout(() => {
      handleClose();
    }, 200);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value); // Actualiza el texto de búsqueda
  };

  // Procesa los datos de liteData.GPS
  const groupedUnits = liteData.GPS || {};

  // Crea un nuevo array con los datos filtrados
  const filteredUnits = useMemo(() => {
    if (!searchText) return groupedUnits;

    return Object.keys(groupedUnits).reduce((acc, empresa) => {
      const filteredVehicles = groupedUnits[empresa].filter((unit) =>
        Object.values(unit).some((value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      );
      if (filteredVehicles.length > 0) {
        acc[empresa] = filteredVehicles; // Solo agrega empresas con coincidencias
      }
      return acc;
    }, {});
  }, [groupedUnits, searchText]);

  return (
    <Box
      position="absolute"
      top="16px"
      left="16px"
      sx={{
        width: { xs: "75%", sm: "400px" }, // 75% del ancho en mobile, máximo 400px en pantallas grandes
        maxWidth: "400px", // Asegura que no exceda los 400px
        minHeight: "48px", // Altura mínima de 48px
        zIndex: 1000,
        bgcolor: "white",
        borderRadius: open ? "24px 24px 0px 0px" : "24px", // Bordes inferiores rectos si el menú está abierto
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
          borderRadius: open ? "24px 24px 0px 0px" : "24px", // Esquinas redondeadas para el botón
          minHeight: "48px", // Altura mínima de 48px
          "&:hover": {
            backgroundColor: "lightgray",
          },
          paddingLeft: "28px",
        }}
      >
        Seleccionar Unidades
        <SearchIcon sx={{ marginLeft: "8px" }} />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableAutoFocusItem // Desactiva el autoenfoque en los elementos del menú
        disableScrollLock // Evita el desplazamiento automático
        slotProps={{
          paper: {
            style: {
              maxHeight: 400,
              width: anchorEl
                ? `${anchorEl.offsetWidth}px`
                : { xs: "75%", sm: "400px" }, // Ajusta el ancho al del botón o un valor predeterminado
              borderRadius: "0px 0px 24px 24px", // Bordes superiores rectos para el menú
              overflowY: "auto", // Permite el desplazamiento vertical
              paddingRight: "8px", // Agrega espacio para evitar que la scrollbar interfiera
            },
          },
          list: {
            sx: {
              "&::-webkit-scrollbar": {
                width: "6px", // Ajusta el ancho de la scrollbar
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0, 0, 0, 0.2)", // Color de la scrollbar
                borderRadius: "4px", // Bordes redondeados para la scrollbar
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent", // Fondo de la scrollbar
              },
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
            value={searchText}
            onChange={handleSearchChange}
            autoFocus // Asegura que el campo de búsqueda mantenga el foco
            onKeyDown={(event) => {
              event.stopPropagation(); // Detiene la propagación del evento
            }}
          />
        </Box>
        {/* Lista de unidades filtradas */}
        {Object.keys(filteredUnits).length > 0 ? (
          Object.keys(filteredUnits).flatMap((empresa) => [
            <ListSubheader key={`${empresa}-header`}>{empresa}</ListSubheader>,
            ...filteredUnits[empresa].map((unit) => (
              <MenuItem
                key={unit.Movil_ID}
                onClick={() => handleSwitchToggle(unit.Movil_ID)} // Alterna el estado al hacer clic en el elemento
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <span>{unit.patente}</span>
                  <Switch
                    checked={selectedUnits.includes(unit.Movil_ID)} // Marca si está seleccionado
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que el evento se propague al `MenuItem`
                    }}
                    onChange={() => {
                      handleSwitchToggle(unit.Movil_ID); // Alterna el estado
                    }}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "green", // Cambia el color del ícono cuando está activado
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "green", // Cambia el color del track cuando está activado
                        },
                    }}
                  />
                </Box>
              </MenuItem>
            )),
          ])
        ) : (
          <MenuItem disabled>No se encontraron resultados</MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default UnitSelector;
