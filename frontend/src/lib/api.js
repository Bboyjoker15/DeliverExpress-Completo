import { get } from 'svelte/store';
import { sesion, cerrarSesion } from './stores/sesion.js';

const API = import.meta.env.VITE_API_URL;

export async function api(ruta, { metodo = 'GET', cuerpo, señal } = {}) {
  const s = get(sesion);
  const res = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(s.token ? { Authorization: `Bearer ${s.token}` } : {})
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    signal: señal
  });

  if (res.status === 401) {
    cerrarSesion();
    throw Object.assign(new Error('Sesión expirada'), { codigo: 'NO_AUTENTICADO' });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.mensaje || 'Error de red');
    e.codigo = data.error;
    throw e;
  }
  return data;
}