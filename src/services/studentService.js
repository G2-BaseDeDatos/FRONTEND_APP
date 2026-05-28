import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// studentService.js — Peticiones HTTP del panel estudiante
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los artículos disponibles para préstamo.
 */
export async function fetchArticulosDisponibles() {
  const res = await api.get('/api/articulos', {
    params: { estado: 'Disponible' },
  });
  return res.data.data || [];
}

/**
 * Obtiene el catálogo completo con filtros opcionales (Categoría, Estado, Búsqueda).
 * Endpoint: GET /api/articulos
 */
export async function fetchArticulos(filtros = {}) {
  const res = await api.get('/api/articulos', { params: filtros });
  return res.data.data || [];
}

/**
 * Obtiene detalle de un artículo por ID.
 * Endpoint: GET /api/articulos/:id
 */
export async function fetchArticuloById(idArticulo) {
  const res = await api.get(`/api/articulos/${idArticulo}`);
  return res.data.data || null;
}

/**
 * Obtiene categorías para filtros del catálogo.
 */
export async function fetchCategorias() {
  const res = await api.get('/api/categorias');
  return res.data.data || [];
}

/**
 * Mis préstamos activos (o historial).
 * Si el backend soporta GET /api/prestamos/mis-prestamos, lo usaremos.
 * De lo contrario, usamos un filtro temporal.
 */
export async function fetchMisPrestamos(idUsuario) {
  try {
    // Intentar endpoint real si existe (Fase 2)
    // const res = await api.get('/api/prestamos/mis-prestamos');
    // return res.data.data || [];

    // Fallback: buscar artículos que el estudiante tiene asignados actualmente.
    const res = await api.get('/api/articulos', {
      params: { estado: 'Prestado', responsable: idUsuario },
    });
    // Formatear para que parezca un préstamo
    return (res.data.data || []).map(art => ({
      ID_PRE: `PRE-${art.ID_ART}`,
      ID_ART: art.ID_ART,
      NOM_ART: art.NOM_ART,
      COD_ART: art.COD_ART,
      FEC_INI_PRE: new Date().toISOString(), // Simulado
      FEC_FIN_PRE: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Simulado 3 días
      EST_PRE: 'Aprobado' // Simulado
    }));
  } catch {
    return [];
  }
}

/**
 * Solicita el préstamo de un artículo (STUB).
 */
export async function solicitarPrestamo(idArticulo) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { success: true, message: 'Solicitud enviada correctamente' };
}

/**
 * Obtiene las notificaciones del estudiante. (STUB)
 * Endpoint: GET /api/notificaciones/mis-notificaciones
 */
export async function fetchNotificaciones() {
  // Simulación temporal hasta que exista en el backend
  await new Promise(r => setTimeout(r, 400));
  return []; 
}

/**
 * Marca una notificación como leída. (STUB)
 * Endpoint: PUT /api/notificaciones/:id/leer
 */
export async function marcarNotificacionLeida(idNotificacion) {
  await new Promise(r => setTimeout(r, 300));
  return { success: true };
}
