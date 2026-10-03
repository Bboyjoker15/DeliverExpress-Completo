import { writable, derived } from 'svelte/store';
import { api } from '$lib/api.js';

export const direcciones = writable([]);

export async function cargarDirecciones() {
	const datos = await api('/api/cliente/direcciones');
	direcciones.set(datos);
	return datos;
}

export const direccionPrincipal = derived(
	direcciones,
	($d) => $d.find((x) => x.principal) || $d[0] || null
);

export async function agregarDireccion(dir) {
	const creada = await api('/api/cliente/direcciones', { metodo: 'POST', cuerpo: dir });
	await cargarDirecciones();
	return creada;
}

// No existe un endpoint para marcar principal o eliminar: se actualiza solo
// en memoria (no persiste si se recarga la pagina).
export function marcarPrincipal(id) {
	direcciones.update((lista) => lista.map((d) => ({ ...d, principal: d.id_direccion === id })));
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
