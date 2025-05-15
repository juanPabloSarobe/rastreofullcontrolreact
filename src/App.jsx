import React from "react";
import Login from "./components/pages/Login";
import PrincipalPage from "./components/pages/PrincipalPage";
import UpdateNotification from "./components/common/UpdateNotification";
import { useContextValue } from "./context/Context";

// Importamos UpdateTester solo en desarrollo
const UpdateTester =
  process.env.NODE_ENV === "development"
    ? React.lazy(() => import("./components/dev/UpdateTester"))
    : null;

function App() {
  const { state } = useContextValue();
  return (
    <>
      {!state.accessGranted ? <Login /> : <PrincipalPage />}
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
