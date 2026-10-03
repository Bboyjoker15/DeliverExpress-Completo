import { writable, derived } from 'svelte/store';
import { api } from '$lib/api.js';

export const menu = writable([]);

export async function cargarMenu() {
	const datos = await api('/api/restaurante/productos');
	menu.set(datos);
	return datos;
}

// Estadísticas
export const estadisticas = derived(menu, ($m) => ({
	total: $m.length,
	disponibles: $m.filter((p) => p.disponible).length,
	agotados: $m.filter((p) => !p.disponible).length
}));

export async function agregarProducto(prod) {
	await api('/api/restaurante/productos', {
		metodo: 'POST',
		cuerpo: {
			nombre: prod.nombre,
			descripcion: prod.descripcion || null,
			precio: Number(prod.precio),
			exento_iva: prod.exento_iva
		}
	});
	await cargarMenu();
}

function buscar(id) {
	let actual = null;
	menu.subscribe((lista) => {
		actual = lista.find((p) => p.id_producto === id);
	})();
	return actual;
}

// El PUT reemplaza el producto completo: siempre se mandan los 5 campos.
async function actualizarCompleto(id, cambios) {
	const base = buscar(id);
	if (!base) return;
	const datos = { ...base, ...cambios };
	await api(`/api/restaurante/productos/${id}`, {
		metodo: 'PUT',
		cuerpo: {
			nombre: datos.nombre,
			descripcion: datos.descripcion ?? null,
			precio: Number(datos.precio),
			exento_iva: datos.exento_iva,
			disponible: datos.disponible
		}
	});
	await cargarMenu();
}

export async function editarProducto(id, cambios) {
	await actualizarCompleto(id, cambios);
}

export async function toggleDisponible(id) {
	const actual = buscar(id);
	if (!actual) return;
	await actualizarCompleto(id, { disponible: !actual.disponible });
}

export async function toggleExentoIva(id) {
	const actual = buscar(id);
	if (!actual) return;
	await actualizarCompleto(id, { exento_iva: !actual.exento_iva });
}

// No existe DELETE en el contrato: los productos no se borran, se marcan
// no disponibles (asi los pedidos pasados que los referencian no se rompen).
export async function eliminarProducto(id) {
	await toggleDisponible(id);
}
