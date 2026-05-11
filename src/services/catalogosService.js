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
