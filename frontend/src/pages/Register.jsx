import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/client";
import logo from "../assets/logo.png";

const initialState = {
  nombre: "",
  email: "",
  contrasena: "",
  tipousuario: "consumidor",
};

function RegisterPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/usuarios", form);
      navigate("/login", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        "No se pudo registrar. Revisa los datos.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
      <div className="absolute inset-0 bg-slate-950/60" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950/80" />

      <div className="relative z-10 flex items-center justify-start px-8 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          <div className="mb-8 flex items-center gap-3 text-white">
            <img src={logo} alt="RMP Actividades" className="h-14 w-auto" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">
                Bienvenido
              </p>
              <p className="text-lg font-semibold leading-tight">
                RMP ACTIVIDADES
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-white">Crear cuenta</h1>
            <p className="text-sm text-slate-300">
              Regístrate como ofertante o consumidor para empezar.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800/40 bg-slate-900/70 p-6 shadow-xl shadow-blue-900/30 backdrop-blur-xl">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-blue-400 focus:ring-blue-500/20"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-blue-400 focus:ring-blue-500/20"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="contrasena"
                  value={form.contrasena}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-blue-400 focus:ring-blue-500/20"
                  placeholder="********"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">
                  Tipo de usuario
                </label>
                <select
                  name="tipousuario"
                  value={form.tipousuario}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-blue-400 focus:ring-blue-500/20"
                >
                  <option value="consumidor">Consumidor</option>
                  <option value="ofertante">Ofertante</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
              >
                {loading ? "Creando..." : "Crear cuenta"}
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-300">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-300 hover:text-blue-200 hover:underline"
              >
                Inicia sesión
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950/65 via-slate-950/35 to-transparent" />
      </div>
    </div>
  );
}

export default RegisterPage;
