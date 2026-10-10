import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/dm-sans";
import "./styles.css";
const App = lazy(() => import("./App"));
const RealEntry = lazy(() =>
  import("./services/RealEntry").then((module) => ({
    default: module.RealEntry,
  })),
);
const mode = import.meta.env.VITE_APP_MODE;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="startup-error" role="status">
          Cargando Occidental…
        </div>
      }
    >
      {mode === "demo" ? (
        <App />
      ) : mode === "real" ? (
        <RealEntry />
      ) : (
        <div className="startup-error">
          <h1>Modo de aplicación no definido</h1>
          <p>
            Configurá VITE_APP_MODE=demo para la demostración o real para
            Supabase. No se activan fixtures automáticamente.
          </p>
        </div>
      )}
    </Suspense>
  </StrictMode>,
);
