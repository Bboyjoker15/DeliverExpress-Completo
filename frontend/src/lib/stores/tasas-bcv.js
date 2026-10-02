import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { TASAS_BCV_INICIALES } from '$lib/mock/tasas-bcv.js';

const STORAGE_KEY = 'tasas_bcv';

function cargar() {
	if (!browser) return TASAS_BCV_INICIALES;
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return TASAS_BCV_INICIALES;
	try {
		return JSON.parse(raw);
	} catch {
		return TASAS_BCV_INICIALES;
	}
}

export const tasasBcv = writable(cargar());

if (browser) {
	tasasBcv.subscribe((v) => localStorage.setItem(STORAGE_KEY, JSON.stringify(v)));
}

// Última tasa disponible (la más reciente)
export const tasaActual = derived(tasasBcv, ($t) => {
	if ($t.length === 0) return null;
	return [...$t].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
});

// ¿Hay tasa para hoy?
export const tieneTasaHoy = derived(tasasBcv, ($t) => {
	const hoy = new Date().toISOString().split('T')[0];
	return $t.some((t) => t.fecha === hoy);
});

export function agregarTasa({ fecha, tasa_usd }) {
	tasasBcv.update((lista) => {
		if (lista.some((t) => t.fecha === fecha)) {
			throw new Error(`Ya existe una tasa cargada para el ${fecha}`);
		}
		return [
			{ fecha, tasa_usd: Number(tasa_usd), fecha_registro: new Date().toISOString() },
			...lista
		].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
	});
}

export function eliminarTasa(fecha) {
	tasasBcv.update((lista) => lista.filter((t) => t.fecha !== fecha));
}