import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { HORARIOS_INICIALES } from '$lib/mock/horarios.js';

const STORAGE_KEY = 'horarios';

function cargar() {
	if (!browser) return HORARIOS_INICIALES;
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return HORARIOS_INICIALES;
	try {
		return JSON.parse(raw);
	} catch {
		return HORARIOS_INICIALES;
	}
}

export const horarios = writable(cargar());

if (browser) {
	horarios.subscribe((valor) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(valor));
	});
}

export function actualizarHorarios(lista) {
	horarios.set(lista);
}

export function resetearHorarios() {
	horarios.set(HORARIOS_INICIALES);
}