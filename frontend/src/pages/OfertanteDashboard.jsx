import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { clearSession, getStoredUser } from "../hooks/useAuth";
import ManageAccountModal from "../components/ManageAccountModal";
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

function OfertanteDashboard() {
  const [user, setUser] = useState(() => getStoredUser());
  const navigate = useNavigate();
  const [actividades, setActividades] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "",
    fecha: "",
    disponibilidad: "",
    precio: "",
    plazas: "",
    horainicio: "",
    horafin: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [showAccountModal, setShowAccountModal] = useState(false);

  const toHHMM = (t) => (typeof t === "string" && t.length >= 5 ? t.slice(0, 5) : "");

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    const fetchActividades = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/actividades/ofertante/${user.idusuario}`);
        setActividades(data);
        if (editing) {
          const current = data.find((a) => a.idactividad === editing);
          if (current) {
            setEditForm({
              titulo: current.titulo || "",
              descripcion: current.descripcion || "",
              tipo: current.tipo || "",
              fecha: current.fecha ? current.fecha.split("T")[0] : "",
              disponibilidad: current.disponibilidad || "",
              precio: current.precio ?? "",
              plazas: current.plazas ?? "",
              horainicio: toHHMM(current.horainicio),
              horafin: toHHMM(current.horafin),
            });
          }
        }
      } catch (err) {
        const msg = err.response?.data?.mensaje || "No se pudieron cargar tus actividades.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchActividades();
  }, [navigate, user?.idusuario, editing]);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const handleAccountUpdated = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleAccountDeleted = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const handleDelete = async (idactividad) => {
    const ok = window.confirm("¿Seguro que deseas eliminar esta actividad?");
    if (!ok) return;
    try {
      await api.delete(`/actividades/${idactividad}`);
      const { data } = await api.get(`/actividades/ofertante/${user.idusuario}`);
      setActividades(data);
    } catch (err) {
      const msg = err.response?.data?.mensaje || "No se pudo eliminar la actividad.";
      setError(msg);
    }
  };

  const openEdit = (act) => {
    setEditing(act.idactividad);
    setEditForm({
      titulo: act.titulo || "",
      descripcion: act.descripcion || "",
      tipo: act.tipo || "",
      fecha: act.fecha ? act.fecha.split("T")[0] : "",
      disponibilidad: act.disponibilidad || "",
      precio: act.precio ?? "",
      plazas: act.plazas ?? "",
      horainicio: toHHMM(act.horainicio),
      horafin: toHHMM(act.horafin),
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setEditErrors({ ...editErrors, [e.target.name]: "" });
  };

  const validateEdit = () => {
    const errors = {};
    const required = [
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
    required.forEach((field) => {
      if (!editForm[field] && editForm[field] !== 0) {
        errors[field] = "Este campo es obligatorio";
      }
    });
    if (editForm.tipo && !allowedTipos.includes(editForm.tipo)) {
      errors.tipo = "Selecciona un tipo válido de la lista";
    }
    if (editForm.fecha) {
      const selected = new Date(editForm.fecha);
      const today = new Date();
      const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      if (selected < minDate) {
        errors.fecha = "La fecha debe ser al menos un día después de hoy";
      }
      const y = selected.getFullYear();
      const currentYear = today.getFullYear();
      if (y < currentYear || y > currentYear + 2) {
        errors.fecha = "El año debe ser el actual o como máximo dos años más";
      }
    }
    if (editForm.horainicio && editForm.horafin && editForm.fecha) {
      const start = Date.parse(`${editForm.fecha}T${editForm.horainicio}`);
      const end = Date.parse(`${editForm.fecha}T${editForm.horafin}`);
      if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
        errors.horafin = "La hora de fin debe ser después de la hora de inicio";
      }
    }
    return errors;
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validateEdit();
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const current = actividades.find((a) => a.idactividad === editing);
      if (!current) {
        setEditing(null);
        return;
      }
      const payload = {
        titulo: editForm.titulo || current.titulo,
        descripcion: editForm.descripcion || current.descripcion,
        tipo: editForm.tipo ? editForm.tipo.trim() : current.tipo,
        fecha: editForm.fecha || current.fecha || null,
        disponibilidad: editForm.disponibilidad || current.disponibilidad || null,
        precio: editForm.precio !== "" ? Number(editForm.precio) : current.precio ?? null,
        plazas: editForm.plazas !== "" ? Number(editForm.plazas) : current.plazas ?? null,
        horainicio: editForm.horainicio || null,
        horafin: editForm.horafin || null,
      };
      await api.put(`/actividades/${editing}`, payload);
      const { data } = await api.get(`/actividades/ofertante/${user.idusuario}`);
      setActividades(data);
      setEditing(null);
    } catch (err) {
      const msg = err.response?.data?.mensaje || "No se pudo actualizar la actividad.";
      setError(msg);
    }
  };

  if (!user) return null;

  const minDateValue = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const maxDateValue = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2, 11, 31);
    return d.toISOString().split("T")[0];
  })();

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
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-300">Hola, {user?.nombre || "ofertante"}</span>
          <button
            onClick={() => setShowAccountModal(true)}
            className="rounded-md border border-slate-700 px-3 py-1 text-slate-200 transition hover:border-blue-500 hover:text-white"
          >
            Gestionar cuenta
          </button>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-700 px-3 py-1 text-slate-200 transition hover:border-blue-500 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-10">
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/ofertante/crear")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Crear nueva actividad
          </button>
        </div>

        <section className="rounded-2xl border border-slate-800/40 bg-slate-900/70 p-6 shadow-lg shadow-blue-900/20 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Tus actividades</h2>
          <p className="text-sm text-slate-300">
            {loading ? "Cargando..." : "Listado de actividades creadas."}
          </p>
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {actividades.map((act) => (
              <div
                key={act.idactividad}
                className="rounded-xl border border-slate-800/50 bg-slate-900/80 p-4 shadow"
              >
                <h3 className="text-lg font-semibold text-white">{act.titulo}</h3>
                <p className="text-sm text-slate-300">{act.descripcion || "Sin descripción"}</p>
                <div className="mt-2 text-xs text-slate-400">
                  <span>Tipo: {act.tipo || "N/D"}</span> ·{" "}
                  <span>Fecha: {act.fecha ? new Date(act.fecha).toLocaleDateString() : "N/D"}</span>
                  <div>
                    Precio: {act.precio ?? "0"} · Plazas: {act.plazas ?? "N/D"} · Horario:{" "}
                    {act.horainicio || "N/D"} - {act.horafin || "N/D"}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEdit(act)}
                    className="rounded-md border border-blue-400 px-3 py-1 text-xs font-semibold text-blue-200 transition hover:bg-blue-500 hover:text-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(act.idactividad)}
                    className="rounded-md border border-red-400 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500 hover:text-white"
                  >
                    Eliminar
                  </button>
                </div>
                <div className="mt-3 rounded-lg border border-slate-800/40 bg-slate-900/60 p-3">
                  <p className="text-sm font-semibold text-white">
                    Inscritos ({act.inscritos?.length || 0})
                  </p>
                  {act.inscritos && act.inscritos.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm text-slate-200">
                      {act.inscritos.map((ins) => (
                        <li key={ins.idinscripcion} className="flex justify-between">
                          <span>{ins.nombre || "Sin nombre"}</span>
                          <span className="text-slate-400 text-xs">{ins.email}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400">Sin inscripciones aún.</p>
                  )}
                </div>
              </div>
            ))}
            {actividades.length === 0 && !loading && (
              <p className="text-sm text-slate-400">Aún no tienes actividades.</p>
            )}
          </div>
        </section>
        </main>

      {showAccountModal && (
        <ManageAccountModal
          user={user}
          onClose={() => setShowAccountModal(false)}
          onUpdated={handleAccountUpdated}
          onDeleted={handleAccountDeleted}
        />
      )}

      {editing && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-blue-900/40">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Editar actividad</h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded-md border border-slate-700 px-2 py-1 text-sm text-slate-300 hover:border-blue-500 hover:text-white"
              >
                Cerrar
              </button>
            </div>
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleEditSave}>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-100">Título</label>
                <input
                  name="titulo"
                  value={editForm.titulo}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                {editErrors.titulo && <p className="mt-1 text-xs text-red-400">{editErrors.titulo}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-100">Descripción</label>
                <textarea
                  name="descripcion"
                  value={editForm.descripcion}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                />
                {editErrors.descripcion && (
                  <p className="mt-1 text-xs text-red-400">{editErrors.descripcion}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">Tipo</label>
                <select
                  name="tipo"
                  value={editForm.tipo}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecciona un tipo</option>
                  {allowedTipos.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  {!allowedTipos.includes(editForm.tipo) && editForm.tipo && (
                    <option value={editForm.tipo}>{`(Actual) ${editForm.tipo}`}</option>
                  )}
                </select>
                {editErrors.tipo && <p className="mt-1 text-xs text-red-400">{editErrors.tipo}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={editForm.fecha}
                  onChange={handleEditChange}
                  min={minDateValue}
                  max={maxDateValue}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
                {editErrors.fecha && <p className="mt-1 text-xs text-red-400">{editErrors.fecha}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">Disponibilidad</label>
                <input
                  name="disponibilidad"
                  value={editForm.disponibilidad}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
                {editErrors.disponibilidad && (
                  <p className="mt-1 text-xs text-red-400">{editErrors.disponibilidad}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  name="precio"
                  value={editForm.precio}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
                {editErrors.precio && <p className="mt-1 text-xs text-red-400">{editErrors.precio}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">Plazas</label>
                <input
                  type="number"
                  name="plazas"
                  value={editForm.plazas}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
                {editErrors.plazas && <p className="mt-1 text-xs text-red-400">{editErrors.plazas}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">Hora inicio</label>
                <input
                  type="time"
                  name="horainicio"
                  value={editForm.horainicio}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
                {editErrors.horainicio && (
                  <p className="mt-1 text-xs text-red-400">{editErrors.horainicio}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-100">Hora fin</label>
                <input
                  type="time"
                  name="horafin"
                  value={editForm.horafin}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
                {editErrors.horafin && <p className="mt-1 text-xs text-red-400">{editErrors.horafin}</p>}
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0.5"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfertanteDashboard;
