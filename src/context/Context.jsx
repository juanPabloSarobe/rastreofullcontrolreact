import React, { createContext, useContext, useReducer } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const initialState = {
    accessGranted: false, // Estado para el acceso
    user: null, // Estado para el usuario
    role: null, // Estado para el rol del usuario
    viewMode: "rastreo", // Nuevo estado para controlar la vista actual
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
