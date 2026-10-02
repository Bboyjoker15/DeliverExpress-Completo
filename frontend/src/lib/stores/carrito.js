import { writable } from 'svelte/store';

const inicial = {
	id_restaurante: null,
	nombre_restaurante: null,
	items: [] // [{ id_producto, nombre, precio, cantidad, imagen }]
};

export const carrito = writable(inicial);

// Agregar un producto. Retorna false si hay conflicto con otro restaurante.
export function agregarAlCarrito(restaurante, producto) {
	let hayConflicto = false;

	carrito.update((c) => {
		// Si ya hay carrito de OTRO restaurante, marcamos conflicto y NO tocamos nada
		if (c.id_restaurante && c.id_restaurante !== restaurante.id_restaurante) {
			hayConflicto = true;
			return c;
		}

		// Mismo restaurante (o carrito vacío): agregar normalmente
		const existe = c.items.find((i) => i.id_producto === producto.id_producto);
		if (existe) {
			existe.cantidad += 1;
		} else {
			c.items.push({
				id_producto: producto.id_producto,
				nombre: producto.nombre,
				precio: producto.precio,
				imagen: producto.imagen,
				cantidad: 1
			});
		}

		c.id_restaurante = restaurante.id_restaurante;
		c.nombre_restaurante = restaurante.nombre;
		return { ...c };
	});

	return !hayConflicto; // true = se agregó, false = hay que confirmar
}

// Fuerza el reemplazo del carrito (usado después de confirmar el modal)
export function reemplazarCarrito(restaurante, producto) {
	carrito.set({
		id_restaurante: restaurante.id_restaurante,
		nombre_restaurante: restaurante.nombre,
		items: [
			{
				id_producto: producto.id_producto,
				nombre: producto.nombre,
				precio: producto.precio,
				imagen: producto.imagen,
				cantidad: 1
			}
		]
	});
}

export function quitarDelCarrito(id_producto) {
	carrito.update((c) => {
		const item = c.items.find((i) => i.id_producto === id_producto);
		if (!item) return c;

		if (item.cantidad > 1) {
			item.cantidad -= 1;
		} else {
			c.items = c.items.filter((i) => i.id_producto !== id_producto);
		}

		if (c.items.length === 0) {
			c.id_restaurante = null;
			c.nombre_restaurante = null;
		}
		return { ...c };
	});
}

export function vaciarCarrito() {
	carrito.set({ id_restaurante: null, nombre_restaurante: null, items: [] });
}

export function cantidadTotal(items) {
	return items.reduce((acc, i) => acc + i.cantidad, 0);
}

export function precioTotal(items) {
	return items.reduce((acc, i) => acc + i.cantidad * i.precio, 0);
}