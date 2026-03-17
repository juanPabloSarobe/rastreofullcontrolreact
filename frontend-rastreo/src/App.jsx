import React from "react";
import Login from "./components/pages/Login";
import PrincipalPage from "./components/pages/PrincipalPage";
import AdminDashboard from "./components/pages/AdminDashboard";
import UpdateNotification from "./components/common/UpdateNotification";
import { useContextValue } from "./context/Context";

// Importamos UpdateTester solo en desarrollo
const UpdateTester =
  process.env.NODE_ENV === "development"
    ? React.lazy(() => import("./components/dev/UpdateTester"))
    : null;

function App() {
  const { state } = useContextValue();
  
  // Detectar si estamos en ruta del dashboard admin
  const isAdminDashboard = window.location.pathname === '/admin-dashboard';
  
  return (
    <>
      {isAdminDashboard ? (
        <AdminDashboard />
      ) : !state.accessGranted ? (
        <Login />
      ) : (
        <PrincipalPage />
      )}
      <UpdateNotification />

      {/* UpdateTester solo se muestra en entorno de desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <React.Suspense fallback={<></>}>
          {UpdateTester && <UpdateTester />}
        </React.Suspense>
      )}
    </>
  );
}

export default App;
