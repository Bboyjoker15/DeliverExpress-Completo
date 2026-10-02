import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { DIRECCIONES as DIRECCIONES_INICIALES } from '$lib/mock/direcciones.js';

const STORAGE_KEY = 'direcciones';

function cargar() {
	if (!browser) return DIRECCIONES_INICIALES;
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return DIRECCIONES_INICIALES;
	try {
		return JSON.parse(raw);
	} catch {
		return DIRECCIONES_INICIALES;
	}
}

export const direcciones = writable(cargar());

// Persistir cambios en localStorage
if (browser) {
	direcciones.subscribe((valor) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(valor));
	});
}

// Store derivado con la principal
export const direccionPrincipal = derived(
	direcciones,
	($d) => $d.find((x) => x.principal) || $d[0] || null
);

export function agregarDireccion(dir) {
	direcciones.update((lista) => {
		const nuevoId = Math.max(0, ...lista.map((d) => d.id_direccion)) + 1;
		// Si la nueva es principal, desmarcar las demás
		let nueva = dir.principal ? lista.map((d) => ({ ...d, principal: false })) : [...lista];
		nueva.push({ ...dir, id_direccion: nuevoId });
		return nueva;
	});
}

export function marcarPrincipal(id) {
	direcciones.update((lista) =>
		lista.map((d) => ({ ...d, principal: d.id_direccion === id }))
	);
}

export function eliminarDireccion(id) {
	direcciones.update((lista) => {
		const nueva = lista.filter((d) => d.id_direccion !== id);
		if (nueva.length > 0 && !nueva.some((d) => d.principal)) {
			nueva[0].principal = true;
		}
		return nueva;
	});
}