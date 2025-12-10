import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { clearSession, getStoredUser } from "../hooks/useAuth";
import logo from "../assets/logo.png";

function ConsumidorDashboard() {
  const [user] = useState(() => getStoredUser());
  const navigate = useNavigate();
  const [actividades, setActividades] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchActividades = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/actividades");
      setActividades(data);
    } catch (err) {
      const msg = err.response?.data?.mensaje || "No se pudieron cargar las actividades.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchInscripciones = async () => {
    try {
      const { data } = await api.get(`/inscripciones/consumidor/${user.idusuario}`);
      setInscripciones(data);
    } catch (err) {
      // silencioso
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    fetchActividades();
    fetchInscripciones();
  }, [navigate, user?.idusuario, user]);

  const handleInscribir = async (idactividad) => {
    setError("");
    try {
      await api.post("/inscripciones", { idactividad });
      await fetchInscripciones();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "No se pudo realizar la inscripción.";
      setError(msg);
    }
  };

  const handleCancelar = async (idinscripcion) => {
    setError("");
    try {
      await api.delete(`/inscripciones/${idinscripcion}`);
      await fetchInscripciones();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "No se pudo cancelar la inscripción.";
      setError(msg);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const inscritosSet = new Set(inscripciones.map((i) => i.idactividad));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="aurora fixed inset-0 -z-10" aria-hidden />
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="RMP Actividades" className="h-10 w-auto" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Consumidor</p>
            <p className="text-lg font-semibold">RMP Actividades</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-300">Hola, {user?.nombre || "consumidor"}</span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-700 px-3 py-1 text-slate-200 transition hover:border-blue-500 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-10">
        <section className="rounded-2xl border border-slate-800/40 bg-slate-900/70 p-6 shadow-lg shadow-blue-900/20 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Actividades disponibles</h2>
          <p className="text-sm text-slate-300">
            {loading ? "Cargando..." : "Explora y apúntate a nuevas actividades."}
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
                  <div>Precio: {act.precio ?? "0"} · Plazas: {act.plazas ?? "N/D"}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Ofertante: {act.ofertante_nombre || "N/D"} ({act.ofertante_email || "N/D"})
                  </div>
                </div>
                {inscritosSet.has(act.idactividad) ? (
                  <button
                    disabled
                    className="mt-3 w-full rounded-lg border border-green-500/60 bg-green-600/50 px-3 py-2 text-sm font-semibold text-white/80 shadow"
                  >
                    Ya inscrito
                  </button>
                ) : (
                  <button
                    onClick={() => handleInscribir(act.idactividad)}
                    className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
                  >
                    Inscribirme
                  </button>
                )}
              </div>
            ))}
            {actividades.length === 0 && !loading && (
              <p className="text-sm text-slate-400">No hay actividades disponibles.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/40 bg-slate-900/70 p-6 shadow-lg shadow-blue-900/20 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Mis inscripciones</h2>
          <p className="text-sm text-slate-300">Actividades a las que te has apuntado.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {inscripciones.map((ins) => (
              <div
                key={ins.idinscripcion}
                className="rounded-xl border border-slate-800/50 bg-slate-900/80 p-4 shadow"
              >
                <h3 className="text-lg font-semibold text-white">{ins.titulo}</h3>
                <p className="text-sm text-slate-300">
                  Fecha: {ins.fecha ? new Date(ins.fecha).toLocaleDateString() : "N/D"}
                </p>
                <p className="text-sm text-slate-400">Precio: {ins.precio ?? "0"}</p>
                <p className="text-xs text-slate-500">
                  Inscrito el:{" "}
                  {ins.fechainscripcion
                    ? new Date(ins.fechainscripcion).toLocaleDateString()
                    : "N/D"}
                </p>
                <button
                  onClick={() => handleCancelar(ins.idinscripcion)}
                  className="mt-3 w-full rounded-lg border border-red-400 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500 hover:text-white"
                >
                  Cancelar inscripción
                </button>
              </div>
            ))}
            {inscripciones.length === 0 && (
              <p className="text-sm text-slate-400">No tienes inscripciones todavía.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ConsumidorDashboard;
