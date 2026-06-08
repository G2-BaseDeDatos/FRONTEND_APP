import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// catalogosService.js
// Servicios para la lectura de Catálogos (Categorías, Ubicaciones, Departamentos)
// ──────────────────────────────────────────────────────────────────────────────

export async function fetchCategorias() {
  const res = await api.get('/api/categorias');
  return res.data.data || [];
}

export async function fetchUbicaciones() {
  const res = await api.get('/api/ubicaciones');
  return res.data.data || [];
}

export async function fetchDepartamentos() {
  const res = await api.get('/api/departamentos');
  return res.data.data || [];
}

// ── CRUD Categorías ───────────────────────────────────────────────────────────
export async function crearCategoria(data) {
  const res = await api.post('/api/categorias', data);
  return res.data;
}

export async function actualizarCategoria(id, data) {
  const res = await api.put(`/api/categorias/${id}`, data);
  return res.data;
}

export async function eliminarCategoria(id) {
  const res = await api.delete(`/api/categorias/${id}`);
  return res.data;
}

// ── CRUD Ubicaciones ──────────────────────────────────────────────────────────
export async function crearUbicacion(data) {
  const res = await api.post('/api/ubicaciones', data);
  return res.data;
}

export async function actualizarUbicacion(id, data) {
  const res = await api.put(`/api/ubicaciones/${id}`, data);
  return res.data;
}

export async function eliminarUbicacion(id) {
  const res = await api.delete(`/api/ubicaciones/${id}`);
  return res.data;
}
