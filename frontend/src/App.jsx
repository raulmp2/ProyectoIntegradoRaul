import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import OfertanteDashboard from "./pages/OfertanteDashboard";
import ConsumidorDashboard from "./pages/ConsumidorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CrearActividad from "./pages/CrearActividad";

function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-slate-950/70 text-slate-100 backdrop-blur">
      <div className="aurora fixed inset-0 -z-10" aria-hidden />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="page-transition"
        >
          <Routes location={location}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/ofertante"
              element={
                <ProtectedRoute allowed={["ofertante"]}>
                  <OfertanteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ofertante/crear"
              element={
                <ProtectedRoute allowed={["ofertante"]}>
                  <CrearActividad />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consumidor"
              element={
                <ProtectedRoute allowed={["consumidor"]}>
                  <ConsumidorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
