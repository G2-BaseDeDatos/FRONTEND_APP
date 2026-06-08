import api from './axiosClient';

export async function fetchNotificaciones() {
  const res = await api.get('/api/notificaciones/mis-notificaciones');
  return res.data.data || [];
}

export async function marcarNotificacionLeida(idNotificacion) {
  const res = await api.put(`/api/notificaciones/${idNotificacion}/leer`);
  return res.data;
}
