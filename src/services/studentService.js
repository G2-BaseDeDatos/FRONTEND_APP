import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// studentService.js — Peticiones HTTP del panel estudiante
//
// Endpoints REALES disponibles en el backend GITT para el rol Estudiante:
//
//   GET /api/articulos?estado=Disponible       → catálogo de equipos disponibles
//   GET /api/articulos?estado=Disponible&categoria={id} → filtrar por categoría
//   GET /api/articulos/:id                     → detalle de un artículo
//   GET /api/categorias                        → filtros del catálogo
//
// ⚠️  MÓDULOS FUTUROS (comentados en app.js del backend):
//   GET  /api/prestamos/mis-prestamos   → préstamos activos del estudiante
//   POST /api/prestamos/solicitar       → solicitar un equipo
//
// Estrategia actual:
//   - Catálogo = artículos con estado "Disponible" (GET /api/articulos)
//   - Búsqueda = filtro LOCAL sobre el array ya cargado (debounce 300ms)
//   - Mis préstamos = artículos con estado "Prestado" y responsable = id_usu
//   - Solicitar = stub que simula éxito (devuelve promise resuelta)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los artículos disponibles para préstamo.
 * Endpoint: GET /api/articulos?estado=Disponible
 * Acceso: Administrador, Docente, Estudiante
 * Respuesta: [{ ID_ART, COD_ART, NOM_ART, EST_ART, VAL_ART,
 *               NOM_CAT, NOM_UBI, NOM_RESPONSABLE }]
 */
export async function fetchArticulosDisponibles() {
  const res = await api.get('/api/articulos', {
    params: { estado: 'Disponible' },
  });
  return res.data.data || [];
}

/**
 * Obtiene artículos disponibles filtrados por categoría.
 * Endpoint: GET /api/articulos?estado=Disponible&categoria={id}
 * @param {number} idCategoria
 */
export async function fetchDisponiblesPorCategoria(idCategoria) {
  const res = await api.get('/api/articulos', {
    params: { estado: 'Disponible', categoria: idCategoria },
  });
  return res.data.data || [];
}

/**
 * Obtiene categorías para filtros del catálogo.
 * Endpoint: GET /api/categorias
 */
export async function fetchCategorias() {
  const res = await api.get('/api/categorias');
  return res.data.data || [];
}

/**
 * Mis préstamos activos (artículos "Prestado" asignados al estudiante).
 * Sustituye a GET /api/prestamos/mis-prestamos (futuro).
 * Endpoint real: GET /api/articulos?estado=Prestado&responsable={id}
 * @param {number} idUsuario
 */
export async function fetchMisPrestamos(idUsuario) {
  // TODO (Fase 7): reemplazar por GET /api/prestamos/mis-prestamos
  // que incluirá fec_ini_pre y fec_fin_pre para el contador.
  try {
    const res = await api.get('/api/articulos', {
      params: { estado: 'Prestado', responsable: idUsuario },
    });
    return res.data.data || [];
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// STUB — Para cuando el backend implemente POST /api/prestamos/solicitar
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Solicita el préstamo de un artículo.
 * TODO: Implementar cuando exista POST /api/prestamos/solicitar
 * Body esperado: { equipoId: number }
 *
 * Por ahora simula un delay de red y devuelve éxito ficticio para
 * demostrar el flujo de UX sin romper la interfaz.
 *
 * @param {number} idArticulo
 */
export async function solicitarPrestamo(idArticulo) {
  // Cuando el backend lo implemente:
  // const res = await api.post('/api/prestamos/solicitar', { equipoId: idArticulo });
  // return res.data;

  // Simulación temporal:
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { success: true, message: 'Solicitud enviada correctamente' };
}
