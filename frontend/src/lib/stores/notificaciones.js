import { writable, derived } from 'svelte/store';

// Estructura:
// { id, titulo, mensaje, fecha (ISO), leida (bool), tipo, id_pedido, rol }

const iniciales = [
	{
		id: 1,
		titulo: 'Pedido confirmado',
		mensaje: 'Tu pedido #18 fue recibido por el restaurante',
		fecha: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
		leida: false,
		tipo: 'pedido',
		id_pedido: 18,
		rol: 'cliente'
	},
	{
		id: 2,
		titulo: 'Repartidor en camino',
		mensaje: 'Carlos M. retiró tu pedido y va hacia tu dirección',
		fecha: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		leida: false,
		tipo: 'pedido',
		id_pedido: 18,
		rol: 'cliente'
	}
];

export const notificaciones = writable(iniciales);

export const noLeidas = derived(notificaciones, ($n) => $n.filter((x) => !x.leida).length);

export function agregarNotificacion({ titulo, mensaje, tipo = 'info', id_pedido = null, rol = null }) {
	notificaciones.update((lista) => [
		{
			id: Date.now(),
			titulo,
			mensaje,
			fecha: new Date().toISOString(),
			leida: false,
			tipo,
			id_pedido,
			rol
		},
		...lista
	]);
}

export function marcarTodasLeidas() {
	notificaciones.update((lista) => lista.map((n) => ({ ...n, leida: true })));
}

export function eliminarNotificacion(id) {
	notificaciones.update((lista) => lista.filter((n) => n.id !== id));
}

export function vaciarNotificaciones() {
	notificaciones.set([]);
}

export function tiempoRelativo(iso) {
	const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
	if (diff < 60) return 'hace unos segundos';
	if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
	if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
	return `hace ${Math.floor(diff / 86400)} d`;
}