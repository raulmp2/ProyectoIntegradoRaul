import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import logo from "../assets/logo.png";

const allowedTipos = [
  "Ruta en bici por el río Guadalquivir",
  "Visita al Real Alcázar de Sevilla",
  "Partida de juegos de rol (D&D, Pathfinder, etc.)",
  "Paseo fotográfico por el Barrio de Santa Cruz",
  "Tarde de escape room",
  "Kayak o piragua por la dársena de Sevilla",
  "Tour gastronómico por tapas",
  "Tarde de juegos de mesa en cafetería temática",
  "Observación de estrellas en las afueras",
  "Clases o sesión de baile (sevillanas, salsa o bachata)",
];

function CrearActividad() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "",
    fecha: "",
    disponibilidad: "abierta",
    precio: "",
    plazas: "",
    horainicio: "",
    horafin: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const validate = () => {
    const errors = {};
    const requiredFields = [
      "titulo",
      "descripcion",
      "tipo",
      "fecha",
      "disponibilidad",
      "precio",
      "plazas",
      "horainicio",
      "horafin",
    ];
    requiredFields.forEach((field) => {
      if (!form[field] && form[field] !== 0) {
        errors[field] = "Este campo es obligatorio";
      }
    });
    if (form.tipo && !allowedTipos.includes(form.tipo)) {
      errors.tipo = "Selecciona un tipo válido de la lista";
    }
    // Fecha minima: manana
    if (form.fecha) {
      const selected = new Date(form.fecha);
      const today = new Date();
      const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      if (selected < minDate) {
        errors.fecha = "La fecha debe ser al menos un dia despues de hoy";
      }
      const y = selected.getFullYear();
      const currentYear = today.getFullYear();
      if (y < currentYear || y > currentYear + 2) {
        errors.fecha = "El año debe ser el actual o como máximo dos años más";
      }
    }
    if (form.horainicio && form.horafin && form.fecha) {
      const start = Date.parse(`${form.fecha}T${form.horainicio}`);
      const end = Date.parse(`${form.fecha}T${form.horafin}`);
      if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
        errors.horafin = "La hora de fin debe ser despues de la hora de inicio";
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo: form.tipo?.trim(),
        fecha: form.fecha || null,
        disponibilidad: form.disponibilidad,
        precio: form.precio ? Number(form.precio) : null,
        plazas: form.plazas ? Number(form.plazas) : null,
        horainicio: form.horainicio,
        horafin: form.horafin,
      };
      await api.post("/actividades", payload);
      navigate("/ofertante", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.mensaje || "No se pudo crear la actividad.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="aurora fixed inset-0 -z-10" aria-hidden />
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="RMP Actividades" className="h-10 w-auto" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Ofertante</p>
            <p className="text-lg font-semibold">RMP Actividades</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/ofertante")}
          className="rounded-md border border-slate-700 px-3 py-1 text-slate-200 transition hover:border-blue-500 hover:text-white"
        >
          Volver al panel
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-12">
        <section className="rounded-2xl border border-slate-800/40 bg-slate-900/70 p-6 shadow-lg shadow-blue-900/20 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Crear nueva actividad</h2>
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-100">Titulo</label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
              {fieldErrors.titulo && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.titulo}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-100">Descripcion</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                rows={2}
              />
              {fieldErrors.descripcion && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.descripcion}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-100">Tipo</label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Selecciona un tipo</option>
                {allowedTipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {fieldErrors.tipo && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.tipo}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-100">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                min={(() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  return d.toISOString().split("T")[0];
                })()}
                max={(() => {
                  const d = new Date();
                  d.setFullYear(d.getFullYear() + 2, 11, 31);
                  return d.toISOString().split("T")[0];
                })()}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
              {fieldErrors.fecha && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.fecha}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-100">Disponibilidad</label>
              <input
                name="disponibilidad"
                value={form.disponibilidad}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
              {fieldErrors.disponibilidad && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.disponibilidad}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-100">Precio</label>
              <input
                type="number"
                step="0.01"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
              {fieldErrors.precio && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.precio}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-100">Plazas</label>
              <input
                type="number"
                name="plazas"
                value={form.plazas}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
              {fieldErrors.plazas && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.plazas}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-100">Hora inicio</label>
              <input
                type="time"
                name="horainicio"
                value={form.horainicio}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
              {fieldErrors.horainicio && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.horainicio}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-100">Hora fin</label>
              <input
                type="time"
                name="horafin"
                value={form.horafin}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
              {fieldErrors.horafin && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.horafin}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
              >
                {loading ? "Creando..." : "Crear actividad"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CrearActividad;
