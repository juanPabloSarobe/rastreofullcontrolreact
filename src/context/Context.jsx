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
