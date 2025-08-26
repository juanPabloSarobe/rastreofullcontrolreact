import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  ListItemIcon,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import { useDebounce } from "use-debounce";

// Componente memoizado para cada elemento de conductor
const ConductorItem = React.memo(({ conductor, isSelected, onSelect }) => {
  return (
    <MenuItem onClick={() => onSelect(conductor)}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Box display="flex" alignItems="center" flex={1}>
          <ListItemIcon>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "green" }}>
              <PersonIcon sx={{ fontSize: 18 }} />
            </Avatar>
          </ListItemIcon>
          <Box sx={{ ml: 1 }}>
            <Typography variant="body2" sx={{ fontSize: "14px", fontWeight: "medium" }}>
              {conductor.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "12px" }}>
              {conductor.empresa} • DNI: {conductor.dni}
            </Typography>
          </Box>
        </Box>
        {isSelected && (
          <CheckIcon sx={{ color: "green", fontSize: 20, ml: 1 }} />
        )}
      </Box>
    </MenuItem>
  );
});

const ConductorSelector = React.memo(({ 
  conductores = [], 
  selectedConductor = null, 
  onConductorSelect,
  disabled = false,
  placeholder = "Seleccionar Conductor"
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchText] = useDebounce(searchInput, 300);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setSearchInput(""); // Limpiar búsqueda al cerrar
  }, []);

  const handleConductorSelect = useCallback((conductor) => {
    onConductorSelect(conductor);
    setTimeout(() => {
      handleClose();
    }, 200);
  }, [onConductorSelect, handleClose]);

  const handleSearchChange = useCallback((event) => {
    setSearchInput(event.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  // Filtrar conductores basado en la búsqueda
  const filteredConductores = useMemo(() => {
    if (!searchText) {
      return conductores;
    }

    return conductores.filter((conductor) =>
      conductor.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
      conductor.empresa?.toLowerCase().includes(searchText.toLowerCase()) ||
      conductor.dni?.toString().includes(searchText) ||
      conductor.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [conductores, searchText]);

  // Texto del botón principal
  const buttonText = selectedConductor 
    ? `${selectedConductor.nombre} - ${selectedConductor.empresa}`
    : placeholder;

  return (
    <Box sx={{ width: "100%", maxWidth: "530px" }}>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={disabled}
        fullWidth
        sx={{
          justifyContent: "space-between",
          backgroundColor: "white",
          color: disabled ? "text.disabled" : "text.primary",
          borderColor: disabled ? "rgba(0, 0, 0, 0.23)" : "rgba(0, 0, 0, 0.23)",
          borderRadius: "4px",
          minHeight: "40px",
          textTransform: "none",
          "&:hover": {
            backgroundColor: disabled ? "white" : "rgba(0, 0, 0, 0.04)",
            borderColor: disabled ? "rgba(0, 0, 0, 0.23)" : "rgba(0, 0, 0, 0.87)",
          },
          paddingLeft: "14px",
          paddingRight: "14px",
        }}
      >
        <Box display="flex" alignItems="center" flex={1}>
          {selectedConductor ? (
            <Avatar sx={{ width: 24, height: 24, bgcolor: "green", mr: 1 }}>
              <PersonIcon sx={{ fontSize: 14 }} />
            </Avatar>
          ) : (
            <PersonIcon sx={{ mr: 1, color: disabled ? "text.disabled" : "text.secondary" }} />
          )}
          <Typography
            variant="body2"
            sx={{
              flexGrow: 1,
              textAlign: "left",
              fontSize: "14px",
              color: selectedConductor ? "text.primary" : "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {buttonText}
          </Typography>
        </Box>
        <SearchIcon sx={{ ml: 1, color: disabled ? "text.disabled" : "text.secondary" }} />
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
              width: anchorEl ? `${anchorEl.offsetWidth}px` : "530px",
              borderRadius: "4px",
              marginTop: "4px",
            },
          },
        }}
      >
        {/* Campo de búsqueda */}
        <Box sx={{ padding: "8px" }}>
          <TextField
            size="small"
            placeholder="Buscar conductores..."
            value={searchInput}
            onChange={handleSearchChange}
            autoFocus
            fullWidth
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

        {/* Lista de conductores */}
        {filteredConductores.length > 0 ? (
          <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
            {filteredConductores.map((conductor) => (
              <ConductorItem
                key={conductor.idCon}
                conductor={conductor}
                isSelected={selectedConductor?.idCon === conductor.idCon}
                onSelect={handleConductorSelect}
              />
            ))}
          </Box>
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No se encontraron conductores
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
});

export default ConductorSelector;
