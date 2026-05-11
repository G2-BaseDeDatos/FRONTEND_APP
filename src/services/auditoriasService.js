import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// auditoriasService.js
// Servicios para la gestión de logs del sistema (Movimientos)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene el registro global de auditorías.
 * Retorna: [{ ID_AUD, ACC_AUD, FEC_AUD, ID_USU, NOM_USU, COR_USU, NOM_ROL }, ...]
 */
export async function fetchAuditorias() {
  const res = await api.get('/api/auditorias');
  return res.data.data || [];
}
