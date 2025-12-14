import { useState } from "react";
import api from "../api/client";
import { clearSession } from "../hooks/useAuth";

function ManageAccountModal({ user, onClose, onUpdated, onDeleted }) {
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback({ error: "", success: "" });

    const nuevoNombre = nombre.trim();
    if (!nuevoNombre) {
      setFeedback({ error: "El nombre es obligatorio", success: "" });
      return;
    }

    try {
      setSaving(true);
      const { data } = await api.put(`/usuarios/${user.idusuario}`, {
        nombre: nuevoNombre,
      });
      const updatedUser = data.usuario || { ...user, nombre: nuevoNombre };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (onUpdated) onUpdated(updatedUser);
      setFeedback({ error: "", success: "Nombre actualizado correctamente" });
    } catch (err) {
      const msg =
        err.response?.data?.mensaje || "No se pudo actualizar el nombre.";
      setFeedback({ error: msg, success: "" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setFeedback({ error: "", success: "" });
    const confirmDelete = window.confirm(
      "Esta accion borrara tu cuenta y todos los datos asociados (actividades, inscripciones, etc.). Seguro que deseas continuar?"
    );
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/usuarios/${user.idusuario}`);
      clearSession();
      if (onDeleted) onDeleted();
    } catch (err) {
      const msg =
        err.response?.data?.mensaje || "No se pudo eliminar la cuenta.";
      setFeedback({ error: msg, success: "" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-blue-900/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Gestionar cuenta</h3>
            <p className="text-sm text-slate-400">
              Actualiza tu nombre o elimina tu cuenta y datos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-700 px-2 py-1 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        {feedback.error && (
          <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {feedback.error}
          </div>
        )}
        {feedback.success && (
          <div className="mt-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {feedback.success}
          </div>
        )}

        <form className="mt-4 space-y-3" onSubmit={handleSave}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-100">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Tu nombre"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar nombre"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white"
            >
              Cerrar
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-red-100">Eliminar cuenta</p>
              <p className="text-xs text-red-200/90">
                Se borraran tambien actividades, inscripciones y datos vinculados.
              </p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-400 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500 hover:text-white disabled:opacity-60"
            >
              {deleting ? "Borrando..." : "Borrar cuenta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageAccountModal;
