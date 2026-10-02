// Mock de POST /api/cliente/pedidos
// Simula fn_crear_pedido. Devuelve un pedido completo (sección 3 del roadmap_backend.txt).

import { get } from 'svelte/store';
import { carrito, precioTotal } from '$lib/stores/carrito.js';
import { RESTAURANTES } from './restaurantes.js';
import { cotizarMock } from './cotizacion.js';

export async function crearPedidoMock({ id_direccion, propina, moneda_pago, ultimos4 }) {
	await new Promise((r) => setTimeout(r, 900));

	const c = get(carrito);
	if (!c.id_restaurante || c.items.length === 0) {
		throw new Error('El carrito está vacío');
	}

	const rest = RESTAURANTES.find((r) => r.id_restaurante === c.id_restaurante);
	const cot = await cotizarMock({ propina, moneda_pago });

	// Simula rechazo del pago (5% de probabilidad)
	if (Math.random() < 0.05) {
		throw new Error('El pago fue rechazado. Intenta con otra tarjeta.');
	}

	const fecha = new Date().toISOString();
	const nuevoId = Math.floor(Math.random() * 1000) + 100;

	return {
		id_pedido: nuevoId,
		id_estado: 1,
		estado_codigo: 'recibido',
		estado_nombre: 'Recibido',
		fecha_creacion: fecha,
		subtotal: cot.subtotal,
		costo_envio: cot.costo_envio,
		propina: cot.propina,
		iva_total: cot.iva_total,
		igtf: cot.igtf,
		total: cot.total,
		moneda_pago,
		tasa_bcv_aplicada: cot.tasa_bcv,
		total_ves: cot.total_ves,
		id_factura: null,
		distancia_km: cot.distancia_km,
		tiempo_estimado_min: (rest?.tiempo_prep_min ?? 20) + 8,
		motivo_cancelacion: null,
		id_restaurante: rest.id_restaurante,
		nombre: rest.nombre,
		imagen: rest.imagen,
		detalle: c.items.map((i) => ({
			id_producto: i.id_producto,
			nombre: i.nombre,
			cantidad: i.cantidad,
			precio_unitario: i.precio,
			subtotal: +(i.cantidad * i.precio).toFixed(2)
		})),
		historial: [
			{
				id_estado: 1,
				estado_codigo: 'recibido',
				estado_nombre: 'Recibido',
				fecha_hora: fecha
			}
		],
		calificaciones_hechas: []
	};
}