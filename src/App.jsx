import ExamplePage from "./components/pages/ExamplePage";
import Login from "./components/pages/Login";

// Removed unused import
import { useContextValue } from "./context/Context";

function App() {
  const { state } = useContextValue();
  return (
    <>
      {!state.accessGranted ? <Login /> : <ExamplePage />}
      <p>{state.accessGranted ? "Acceso concedido" : "Acceso denegado"}</p>
    </>
  );
}

export default App;
