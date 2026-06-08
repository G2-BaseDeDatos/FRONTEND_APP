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
 * Mis préstamos activos (historial real desde BD).
 */
export async function fetchMisPrestamos() {
  try {
    const res = await api.get('/api/prestamos/mis-prestamos');
    return res.data.data || [];
  } catch {
    return [];
  }
}

/**
 * Solicita el préstamo de un artículo para el usuario autenticado.
 * Endpoint: POST /api/prestamos/solicitar
 * @param {number} idArticulo
 * @param {string} fechaRetorno - YYYY-MM-DD (opcional, por defecto 7 días)
 */
export async function solicitarPrestamo(idArticulo, fechaRetorno = null) {
  const body = { id_art: idArticulo };
  if (fechaRetorno) body.fpr_pre = fechaRetorno;
  const res = await api.post('/api/prestamos/solicitar', body);
  return res.data;
}

/**
 * Obtiene las notificaciones del estudiante.
 * Endpoint: GET /api/notificaciones/mis-notificaciones
 */
export async function fetchNotificaciones() {
  const res = await api.get('/api/notificaciones/mis-notificaciones');
  return res.data.data || [];
}

/**
 * Marca una notificación como leída.
 * Endpoint: PUT /api/notificaciones/:id/leer
 */
export async function marcarNotificacionLeida(idNotificacion) {
  const res = await api.put(`/api/notificaciones/${idNotificacion}/leer`);
  return res.data;
}
