import React, { createContext, useContext, useReducer } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const initialState = {
    accessGranted: false, // Nuevo estado
    user: null, // Nuevo estado
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_ACCESS_GRANTED":
        return { ...state, accessGranted: action.payload };
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
