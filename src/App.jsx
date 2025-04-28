import Login from "./components/pages/Login";
import PrincipalPage from "./components/pages/PrincipalPage";

// Removed unused import
import { useContextValue } from "./context/Context";

function App() {
  const { state } = useContextValue();
  return <>{!state.accessGranted ? <Login /> : <PrincipalPage />}</>;
}

export default App;
