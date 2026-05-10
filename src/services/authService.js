import api from './axiosClient';

/**
 * authService — Lógica de comunicación con el backend de autenticación.
 *
 * Endpoint real (backend Node/Express):
 *   POST /api/auth/login
 *   Body: { cor_usu: string, pas_usu: string }
 *   Respuesta exitosa (200):
 *     {
 *       success: true,
 *       data: {
 *         token: "jwt...",
 *         usuario: { id_usu, nom_usu, cor_usu, rol }
 *       },
 *       message: "Inicio de sesión exitoso"
 *     }
 *   Error (401): credenciales incorrectas
 *   Error (400): validación (correo inválido / contraseña vacía)
 */
export async function loginUsuario(correo, contrasena) {
  // IMPORTANTE: el backend espera "cor_usu" y "pas_usu", no "email"/"password"
  const response = await api.post('/api/auth/login', {
    cor_usu: correo,
    pas_usu: contrasena,
  });
  // response.data tiene la forma { success, data, message }
  return response.data.data; // → { token, usuario }
}
