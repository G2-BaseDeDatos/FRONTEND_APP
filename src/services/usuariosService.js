import api from './axiosClient';

// ──────────────────────────────────────────────────────────────────────────────
// usuariosService.js
// Servicios para el CRUD de Usuarios
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene la lista completa de usuarios.
 */
export async function fetchUsuarios() {
  const res = await api.get('/api/usuarios');
  return res.data.data || [];
}

/**
 * Obtiene la lista de roles disponibles.
 */
export async function fetchRoles() {
  const res = await api.get('/api/roles');
  return res.data.data || [];
}

/**
 * Crea un nuevo usuario.
 */
export async function crearUsuario(usuarioData) {
  // usuarioData debe contener: id_rol, ced_usu, nom_usu, cor_usu, pas_usu
  const res = await api.post('/api/usuarios', usuarioData);
  return res.data;
}

/**
 * Actualiza un usuario existente.
 */
export async function actualizarUsuario(id, usuarioData) {
  // usuarioData no incluirá pas_usu ya que el PUT no lo soporta en el backend actual
  const res = await api.put(`/api/usuarios/${id}`, usuarioData);
  return res.data;
}

/**
 * Elimina un usuario (y sus datos relacionados si la BD lo permite/en cascada).
 */
export async function eliminarUsuario(id) {
  const res = await api.delete(`/api/usuarios/${id}`);
  return res.data;
}
