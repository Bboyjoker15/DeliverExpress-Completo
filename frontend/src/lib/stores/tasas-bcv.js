import { writable, derived } from 'svelte/store';
import { api } from '$lib/api.js';

// Tasas BCV desde la API real (GET /api/admin/tasas-bcv, últimas 60).
// No hay endpoint de borrado: las tasas cargadas no se eliminan.
export const tasasBcv = writable([]);

export async function cargarTasas() {
	const datos = await api('/api/admin/tasas-bcv');
	tasasBcv.set(datos);
	return datos;
}

// Última tasa disponible (la más reciente)
export const tasaActual = derived(tasasBcv, ($t) => {
	if ($t.length === 0) return null;
	return [...$t].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
});

// ¿Hay tasa para hoy?
export const tieneTasaHoy = derived(tasasBcv, ($t) => {
	const hoy = new Date().toISOString().split('T')[0];
	return $t.some((t) => String(t.fecha).startsWith(hoy));
});

export async function agregarTasa({ fecha, tasa_usd }) {
	const creada = await api('/api/admin/tasas-bcv', {
		metodo: 'POST',
		cuerpo: { fecha, tasa_usd: Number(tasa_usd) }
	});
	await cargarTasas();
	return creada;
}
