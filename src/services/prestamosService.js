import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// prestamosService.js
// Servicios para la gestión de préstamos
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene la lista global de préstamos (Solo Admin y Docente).
 * Retorna: [{ ID_PRE, FSA_PRE, FPR_PRE, EST_PRE, ID_USU, NOM_USU, COR_USU }, ...]
 */
export async function fetchPrestamos() {
  const res = await api.get('/api/prestamos');
  return res.data.data || [];
}

/**
 * Crea un préstamo manual.
 * @param {Object} data - { id_usu, fsa_pre, fpr_pre, articulos_ids: [1, 2, ...] }
 */
export async function crearPrestamo(data) {
  const res = await api.post('/api/prestamos', data);
  return res.data;
}

/**
 * Registra la devolución de un préstamo.
 * Pasa los artículos a 'Disponible' y el préstamo a 'Devuelto'.
 * @param {number} id - ID del préstamo
 */
export async function devolverPrestamo(id) {
  const res = await api.put(`/api/prestamos/${id}/devolucion`);
  return res.data;
}

/**
 * Aprueba un préstamo pendiente.
 * Pasa el préstamo de 'Pendiente' a 'Activo'.
 * @param {number} id - ID del préstamo
 */
export async function aprobarPrestamo(id) {
  const res = await api.put(`/api/prestamos/${id}/aprobar`);
  return res.data;
}
