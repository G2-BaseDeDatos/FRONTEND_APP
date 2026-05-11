import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// mantenimientosService.js
// Servicios para la gestión de equipos en reparación
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene la lista de mantenimientos activos (equipos actualmente en reparación).
 */
export async function fetchMantenimientosActivos() {
  const res = await api.get('/api/mantenimientos');
  return res.data.data || [];
}

/**
 * Registra un nuevo mantenimiento (el equipo pasará a estado 'Mantenimiento').
 * @param {Object} data - { id_art, tip_man, fec_man, des_man }
 */
export async function registrarMantenimiento(data) {
  const res = await api.post('/api/mantenimientos', data);
  return res.data;
}

/**
 * Finaliza un mantenimiento (el equipo pasará a estado 'Disponible').
 * @param {number} id_man - ID del registro de mantenimiento.
 * @param {Object} data   - { id_art, notas_adicionales (opcional) }
 */
export async function finalizarMantenimiento(id_man, data) {
  const res = await api.put(`/api/mantenimientos/${id_man}/finalizar`, data);
  return res.data;
}
