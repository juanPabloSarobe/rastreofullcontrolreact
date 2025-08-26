import React, { createContext, useContext, useReducer } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const initialState = {
    accessGranted: false, // Estado para el acceso
    user: null, // Estado para el usuario
    role: null, // Estado para el rol del usuario
    viewMode: "rastreo", // Nuevo estado para controlar la vista actual
    unitData: null,
    hideLowUnits: true, // Valor por defecto
    selectedUnits: [], // Estado para las unidades seleccionadas
    idleTimers: new Map(), // Estado global para timers de ralentí
    // Estados para sistema de infracciones
    infractionHistory: [], // Historial de infracciones resueltas
    loadingInfractionUnits: new Set(), // Unidades consultando detalles de infracción
    previousActiveInfractions: [], // Estado previo para detectar transiciones
    // Estados para conductores
    conductores: [], // Lista global de conductores disponibles
    selectedConductor: null, // Conductor seleccionado actualmente
    conductorVehicles: [], // Vehículos del conductor seleccionado
    loadingConductorVehicles: false, // Estado de carga de vehículos
    loadingConductores: false, // Estado de carga inicial de conductores
    conductoresLoaded: false, // Si ya se intentó cargar conductores
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_ACCESS_GRANTED":
        return { ...state, accessGranted: action.payload };
      case "SET_USER":
        return { ...state, user: action.payload };
      case "SET_ROLE":
        return { ...state, role: action.payload };
      case "SET_VIEW_MODE":
        return { ...state, viewMode: action.payload }; // Actualiza la vista actual
      case "SET_HISTORY_UNIT":
        return { ...state, unitData: action.payload }; // Actualiza la vista actual
      case "SET_HIDE_LOW_UNITS":
        return { ...state, hideLowUnits: action.payload }; // Actualiza el estado de ocultar bajas
      case "SET_SELECTED_UNITS":
        return { ...state, selectedUnits: action.payload }; // Actualiza las unidades seleccionadas
      case "SET_IDLE_TIMERS":
        return { ...state, idleTimers: action.payload }; // Actualiza los timers de ralentí
      case "UPDATE_IDLE_TIMER": {
        const newTimers = new Map(state.idleTimers);
        if (action.payload.delete) {
          newTimers.delete(action.payload.unitId);
        } else {
          newTimers.set(action.payload.unitId, action.payload.timer);
        }
        return { ...state, idleTimers: newTimers };
      }
      // Acciones para sistema de infracciones
      case "SET_INFRACTION_HISTORY":
        return { ...state, infractionHistory: action.payload };
      case "SET_LOADING_INFRACTION_UNITS":
        return { ...state, loadingInfractionUnits: action.payload };
      case "SET_PREVIOUS_ACTIVE_INFRACTIONS":
        return { ...state, previousActiveInfractions: action.payload };
      case "UPDATE_INFRACTION_HISTORY": {
        // Actualizar una unidad específica en el historial
        const updatedHistory = state.infractionHistory.map((unit) =>
          unit.Movil_ID === action.payload.unitId
            ? { ...unit, ...action.payload.details }
            : unit
        );
        return { ...state, infractionHistory: updatedHistory };
      }
      case "REMOVE_FROM_INFRACTION_HISTORY": {
        // Eliminar una unidad específica del historial
        const filteredHistory = state.infractionHistory.filter(
          (unit) => unit.Movil_ID !== action.payload.unitId
        );
        return { ...state, infractionHistory: filteredHistory };
      }
      case "CLEAR_INFRACTION_HISTORY":
        return { ...state, infractionHistory: [] };
      case "ADD_LOADING_INFRACTION_UNIT": {
        const newLoadingUnits = new Set(state.loadingInfractionUnits);
        newLoadingUnits.add(action.payload.unitId);
        return { ...state, loadingInfractionUnits: newLoadingUnits };
      }
      case "REMOVE_LOADING_INFRACTION_UNIT": {
        const newLoadingUnits = new Set(state.loadingInfractionUnits);
        newLoadingUnits.delete(action.payload.unitId);
        return { ...state, loadingInfractionUnits: newLoadingUnits };
      }
      // Acciones para sistema de conductores
      case "SET_CONDUCTORES":
        return { ...state, conductores: action.payload };
      case "SET_SELECTED_CONDUCTOR":
        return { ...state, selectedConductor: action.payload };
      case "SET_CONDUCTOR_VEHICLES":
        return { ...state, conductorVehicles: action.payload };
      case "SET_LOADING_CONDUCTOR_VEHICLES":
        return { ...state, loadingConductorVehicles: action.payload };
      case "SET_LOADING_CONDUCTORES":
        return { ...state, loadingConductores: action.payload };
      case "SET_CONDUCTORES_LOADED":
        return { ...state, conductoresLoaded: action.payload };
      case "CLEAR_CONDUCTOR_DATA":
        return { 
          ...state, 
          selectedConductor: null, 
          conductorVehicles: [], 
          loadingConductorVehicles: false 
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

export const useContextValue = () => useContext(Context);
