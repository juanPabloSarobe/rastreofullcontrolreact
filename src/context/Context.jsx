import React, { createContext, useContext, useReducer } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const initialState = {
    accessGranted: false, // Estado para el acceso
    user: null, // Estado para el usuario
    role: null, // Nuevo estado para el rol del usuario
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_ACCESS_GRANTED":
        return { ...state, accessGranted: action.payload };
      case "SET_USER":
        return { ...state, user: action.payload }; // Maneja el usuario
      case "SET_ROLE":
        return { ...state, role: action.payload }; // Maneja el rol
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
