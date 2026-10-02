import { writable, derived } from 'svelte/store';
import { PEDIDOS as PEDIDOS_INICIALES } from '$lib/mock/pedidos.js';

export const pedidos = writable([...PEDIDOS_INICIALES]);

export function filtrarPorCategoria(categoria) {
	return derived(pedidos, ($p) => {
		if (!categoria || categoria === 'todos') return $p;
		if (categoria === 'activos') return $p.filter((x) => [1, 2, 3, 4].includes(x.id_estado));
		if (categoria === 'entregados') return $p.filter((x) => x.id_estado === 5);
		if (categoria === 'cancelados') return $p.filter((x) => x.id_estado === 6);
		return $p;
	});
}

export const conteos = derived(pedidos, ($p) => ({
	todos: $p.length,
	activos: $p.filter((x) => [1, 2, 3, 4].includes(x.id_estado)).length,
	entregados: $p.filter((x) => x.id_estado === 5).length,
	cancelados: $p.filter((x) => x.id_estado === 6).length
}));

export function agregarPedido(pedido) {
	pedidos.update((lista) => {
		if (lista.some((p) => p.id_pedido === pedido.id_pedido)) return lista;
		return [pedido, ...lista];
	});
}

export function obtenerPedidoPorId(id) {
	return derived(pedidos, ($p) => $p.find((x) => x.id_pedido === Number(id)));
}

// Cambiar estado. Extra permite asignar repartidor al pasar a "en_camino"
export function actualizarEstadoPedido(id_pedido, nuevo_estado_codigo, nuevo_estado_nombre, nuevo_id_estado, extra = {}) {
	pedidos.update((lista) =>
		lista.map((p) => {
			if (p.id_pedido !== id_pedido) return p;

			const historial = [
				...p.historial,
				{
					id_estado: nuevo_id_estado,
					estado_codigo: nuevo_estado_codigo,
					estado_nombre: nuevo_estado_nombre,
					fecha_hora: new Date().toISOString()
				}
			];

			return {
				...p,
				id_estado: nuevo_id_estado,
				estado_codigo: nuevo_estado_codigo,
				estado_nombre: nuevo_estado_nombre,
				historial,
				...(extra.repartidor !== undefined ? { repartidor: extra.repartidor } : {})
			};
		})
	);
}

// Cancelar pedido (solo si está en estado "recibido")
export function cancelarPedido(id_pedido, motivo) {
	pedidos.update((lista) =>
		lista.map((p) => {
			if (p.id_pedido !== id_pedido) return p;
			if (p.id_estado !== 1) return p; // seguridad: solo se puede cancelar en "recibido"

			const fecha = new Date().toISOString();
			return {
				...p,
				id_estado: 6,
				estado_codigo: 'cancelado',
				estado_nombre: 'Cancelado',
				motivo_cancelacion: motivo,
				historial: [
					...p.historial,
					{ id_estado: 6, estado_codigo: 'cancelado', estado_nombre: 'Cancelado', fecha_hora: fecha }
				]
			};
		})
	);
}

export function marcarCalificacionHecha(id_pedido, tipo) {
	pedidos.update((lista) =>
		lista.map((p) => {
			if (p.id_pedido !== id_pedido) return p;
			if (p.calificaciones_hechas?.includes(tipo)) return p;
			return {
				...p,
				calificaciones_hechas: [...(p.calificaciones_hechas || []), tipo]
			};
		})
	);
}