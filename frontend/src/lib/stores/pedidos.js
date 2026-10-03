import { writable, derived } from 'svelte/store';
import { api } from '$lib/api.js';

const ESTADOS_ACTIVOS = ['recibido', 'en_preparacion', 'listo_para_retirar', 'en_camino'];

// Historial resumido del cliente (GET /api/cliente/pedidos): no trae
// restaurante/repartidor/detalle completos, solo lo necesario para listar.
export const pedidos = writable([]);

export async function cargarPedidos() {
	const datos = await api('/api/cliente/pedidos');
	pedidos.set(datos);
	return datos;
}

export function filtrarPorCategoria(categoria) {
	return derived(pedidos, ($p) => {
		if (!categoria || categoria === 'todos') return $p;
		if (categoria === 'activos') return $p.filter((x) => ESTADOS_ACTIVOS.includes(x.estado_codigo));
		if (categoria === 'entregados') return $p.filter((x) => x.estado_codigo === 'entregado');
		if (categoria === 'cancelados') return $p.filter((x) => x.estado_codigo === 'cancelado');
		return $p;
	});
}

export const conteos = derived(pedidos, ($p) => ({
	todos: $p.length,
	activos: $p.filter((x) => ESTADOS_ACTIVOS.includes(x.estado_codigo)).length,
	entregados: $p.filter((x) => x.estado_codigo === 'entregado').length,
	cancelados: $p.filter((x) => x.estado_codigo === 'cancelado').length
}));

// Detalle completo de un pedido (GET /api/cliente/pedidos/{id}): la lista
// resumida no alcanza para la pantalla de seguimiento/detalle, asi que se
// pide aparte y se expone como un store propio que se puede refrescar.
export function obtenerPedidoPorId(id) {
	const detalle = writable(null);
	const cargar = () =>
		api(`/api/cliente/pedidos/${id}`)
			.then((d) => detalle.set(d))
			.catch(() => detalle.set(null));
	cargar();
	detalle.refrescar = cargar;
	return detalle;
}

export async function calificarPedido(id_pedido, tipo, puntaje, comentario) {
	return api(`/api/cliente/pedidos/${id_pedido}/calificar`, {
		metodo: 'POST',
		cuerpo: { tipo, puntaje, comentario }
	});
}
