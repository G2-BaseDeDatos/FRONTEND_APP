import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// articulosService.js
// Servicios para el CRUD de Artículos y catálogos auxiliares
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene la lista completa de artículos (con filtros opcionales).
 * @param {Object} filtros - Ej: { categoria, estado, ubicacion, responsable }
 */
export async function fetchArticulos(filtros = {}) {
  // Construir query string a partir del objeto de filtros
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filtros)) {
    if (value) params.append(key, value);
  }
  const url = `/api/articulos${params.toString() ? '?' + params.toString() : ''}`;
  
  const res = await api.get(url);
  return res.data.data || [];
}

/**
 * Crea un nuevo artículo.
 */
export async function crearArticulo(articuloData) {
  // articuloData: { id_cat, id_ubi, id_usu, cod_art, nom_art, est_art, val_art }
  const res = await api.post('/api/articulos', articuloData);
  return res.data;
}

/**
 * Sube la imagen de un artículo (Multipart FormData).
 * @param {number} idArticulo 
 * @param {File} file 
 */
export async function subirImagenArticulo(idArticulo, file) {
  const formData = new FormData();
  formData.append('imagen', file);

  const res = await api.post(`/api/articulos/${idArticulo}/imagen`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

/**
 * Actualiza un artículo existente.
 */
export async function actualizarArticulo(id, articuloData) {
  const res = await api.put(`/api/articulos/${id}`, articuloData);
  return res.data;
}

/**
 * Da de baja (eliminación lógica) a un artículo.
 */
export async function eliminarArticulo(id) {
  const res = await api.delete(`/api/articulos/${id}`);
  return res.data;
}

// ──────────────────────────────────────────────────────────────────────────────
// Catálogos Auxiliares (Categorías y Ubicaciones)
// ──────────────────────────────────────────────────────────────────────────────

export async function fetchCategorias() {
  const res = await api.get('/api/categorias');
  return res.data.data || [];
}

export async function fetchUbicaciones() {
  const res = await api.get('/api/ubicaciones');
  return res.data.data || [];
}
