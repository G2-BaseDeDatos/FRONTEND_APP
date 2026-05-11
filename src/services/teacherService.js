import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// teacherService.js — Peticiones HTTP del panel docente
//
// Endpoints reales disponibles en el backend GITT para el rol Docente:
//
//   GET /api/categorias                      → { ID_CAT, NOM_CAT }[]
//   GET /api/articulos?responsable={id_usu}  → artículos asignados al docente
//   GET /api/articulos?categoria={id_cat}    → artículos de una categoría
//   GET /api/articulos?estado=Disponible     → artículos disponibles
//
// ⚠️  NO existe GET /api/prestamos/mis-prestamos todavía.
//      Se usa GET /api/articulos?responsable=:id como sustituto para
//      mostrar los artículos que el docente tiene asignados.
//      Cuando el módulo de préstamos se implemente, reemplazar
//      fetchArticulosAsignados() por fetchMisPrestamos() aquí.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene todas las categorías de equipos.
 * Endpoint: GET /api/categorias
 * Acceso: Administrador, Docente, Estudiante
 * Respuesta: [{ ID_CAT: number, NOM_CAT: string }, ...]
 */
export async function fetchCategorias() {
  const res = await api.get('/api/categorias');
  return res.data.data || [];
}

/**
 * Obtiene los artículos asignados al docente autenticado.
 * Sustituye a GET /api/prestamos/mis-prestamos (aún no implementado).
 * Usa el filtro ?responsable= de GET /api/articulos.
 *
 * Endpoint: GET /api/articulos?responsable={idUsuario}&estado=Prestado
 * Acceso: Administrador, Docente, Estudiante
 * Respuesta: [{ ID_ART, COD_ART, NOM_ART, EST_ART, VAL_ART,
 *               NOM_CAT, NOM_UBI, NOM_RESPONSABLE, ... }]
 *
 * @param {number} idUsuario  — extraído del AuthContext (usuario.id_usu)
 */
export async function fetchArticulosAsignados(idUsuario) {
  const res = await api.get('/api/articulos', {
    params: { responsable: idUsuario },
  });
  return res.data.data || [];
}

/**
 * Obtiene artículos disponibles de una categoría.
 * Usado al navegar a una categoría específica.
 *
 * Endpoint: GET /api/articulos?categoria={idCat}&estado=Disponible
 * @param {number} idCategoria
 */
export async function fetchArticulosPorCategoria(idCategoria) {
  const res = await api.get('/api/articulos', {
    params: { categoria: idCategoria, estado: 'Disponible' },
  });
  return res.data.data || [];
}

// ──────────────────────────────────────────────────────────────────────────────
// STUB — Para cuando el backend implemente el módulo de Préstamos
// ──────────────────────────────────────────────────────────────────────────────

/**
 * TODO: Implementar cuando exista GET /api/prestamos/mis-prestamos
 * La respuesta esperada incluirá: id_pre, nom_art, fec_ini_pre, fec_fin_pre, est_pre
 * Por ahora redirige a fetchArticulosAsignados().
 */
export async function fetchMisPrestamos(idUsuario) {
  // Cuando el backend lo implemente:
  // const res = await api.get('/api/prestamos/mis-prestamos');
  // return res.data.data || [];
  return fetchArticulosAsignados(idUsuario);
}
