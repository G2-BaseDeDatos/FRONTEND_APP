import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// dashboardService.js
//
// Endpoints reales disponibles en el backend GITT (Node + Oracle):
//   GET /api/articulos              → todos los artículos (con filtro ?estado=)
//   GET /api/articulos/estado/:est  → filtro rápido por estado
//   GET /api/usuarios               → lista de usuarios (Admin + Docente)
//
// ⚠️  NO existe /api/inventario/stats ni /api/prestamos/pendientes todavía.
//      Los KPIs se calculan en el frontend haciendo 3 peticiones paralelas.
//      Cuando el backend implemente esos endpoints, reemplazar aquí únicamente.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los artículos con sus estados.
 * Retorna: array de objetos con ID_ART, NOM_ART, EST_ART, NOM_CAT, NOM_UBI, etc.
 */
export async function fetchArticulos() {
  const res = await api.get('/api/articulos');
  return res.data.data || [];
}

/**
 * Obtiene artículos filtrados por estado.
 * @param {'Disponible'|'Prestado'|'Mantenimiento'|'Baja'} estado
 */
export async function fetchArticulosPorEstado(estado) {
  const res = await api.get(`/api/articulos/estado/${estado}`);
  return res.data.data || [];
}

/**
 * Calcula los KPIs del inventario haciendo una sola petición a /api/articulos.
 * Agrupa localmente por EST_ART para evitar 4 llamadas paralelas.
 * Retorna: { total, disponibles, prestados, enMantenimiento, baja }
 */
export async function fetchDashboardStats() {
  const articulos = await fetchArticulos();

  const stats = { total: 0, disponibles: 0, prestados: 0, enMantenimiento: 0, baja: 0 };
  for (const art of articulos) {
    stats.total++;
    const est = art.EST_ART;
    if (est === 'Disponible')    stats.disponibles++;
    else if (est === 'Prestado') stats.prestados++;
    else if (est === 'Mantenimiento') stats.enMantenimiento++;
    else if (est === 'Baja')     stats.baja++;
  }
  return { stats, articulos };
}

/**
 * Obtiene la lista completa de usuarios.
 * Retorna: array de { ID_USU, NOM_USU, COR_USU, NOM_ROL }
 */
export async function fetchUsuarios() {
  const res = await api.get('/api/usuarios');
  return res.data.data || [];
}

// ──────────────────────────────────────────────────────────────────────────────
// STUBS — Para cuando el backend implemente el módulo de Préstamos
// ──────────────────────────────────────────────────────────────────────────────

/**
 * TODO: Implementar cuando exista GET /api/prestamos?estado=Pendiente
 * Por ahora retorna array vacío para que la tabla muestre estado vacío.
 */
export async function fetchPrestamosPendientes() {
  try {
    const res = await api.get('/api/prestamos?estado=Pendiente');
    return res.data.data || [];
  } catch {
    // Endpoint aún no implementado → retorna vacío en lugar de reventar
    return [];
  }
}

/**
 * TODO: Implementar cuando exista PUT /api/prestamos/:id/aprobar
 */
export async function aprobarPrestamo(idPrestamo) {
  const res = await api.put(`/api/prestamos/${idPrestamo}/aprobar`);
  return res.data;
}

/**
 * TODO: Implementar cuando exista PUT /api/prestamos/:id/rechazar
 */
export async function rechazarPrestamo(idPrestamo) {
  const res = await api.put(`/api/prestamos/${idPrestamo}/rechazar`);
  return res.data;
}
