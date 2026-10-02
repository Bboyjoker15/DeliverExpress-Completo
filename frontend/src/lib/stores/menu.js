import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { PRODUCTOS_POR_RESTAURANTE } from '$lib/mock/productos.js';

const STORAGE_KEY = 'menu_restaurante';

// Inicial: los productos del restaurante 1
function cargar() {
	if (!browser) return PRODUCTOS_POR_RESTAURANTE[1] || [];
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return PRODUCTOS_POR_RESTAURANTE[1] || [];
	try {
		return JSON.parse(raw);
	} catch {
		return PRODUCTOS_POR_RESTAURANTE[1] || [];
	}
}

export const menu = writable(cargar());

if (browser) {
	menu.subscribe((valor) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(valor));
	});
}

// Estadísticas
export const estadisticas = derived(menu, ($m) => ({
	total: $m.length,
	disponibles: $m.filter((p) => p.disponible).length,
	agotados: $m.filter((p) => !p.disponible).length
}));

// Agregar producto nuevo
export function agregarProducto(prod) {
	menu.update((lista) => {
		const nuevoId = Math.max(0, ...lista.map((p) => p.id_producto)) + 1;
		return [
			...lista,
			{
				id_producto: nuevoId,
				nombre: prod.nombre,
				descripcion: prod.descripcion || '',
				precio: Number(prod.precio),
				exento_iva: prod.exento_iva,
				disponible: true,
				categoria: prod.categoria || 'Populares',
				imagen:
					prod.imagen ||
					'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'
			}
		];
	});
}

// Editar producto existente
export function editarProducto(id, cambios) {
	menu.update((lista) =>
		lista.map((p) => (p.id_producto === id ? { ...p, ...cambios } : p))
	);
}

// Toggle disponible
export function toggleDisponible(id) {
	menu.update((lista) =>
		lista.map((p) =>
			p.id_producto === id ? { ...p, disponible: !p.disponible } : p
		)
	);
}

// Toggle exento_iva
export function toggleExentoIva(id) {
	menu.update((lista) =>
		lista.map((p) =>
			p.id_producto === id ? { ...p, exento_iva: !p.exento_iva } : p
		)
	);
}

// Eliminar
export function eliminarProducto(id) {
	menu.update((lista) => lista.filter((p) => p.id_producto !== id));
}