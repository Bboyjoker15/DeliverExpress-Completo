// Mock de POST /api/cliente/pedidos/cotizar
// Simula el cálculo que hace fn_cotizar_pedido en PostgreSQL.
// Cuando el backend esté listo, esto se reemplaza por la llamada real.

import { get } from 'svelte/store';
import { carrito, precioTotal } from '$lib/stores/carrito.js';
import { RESTAURANTES } from './restaurantes.js';

const TASA_BCV = 38.50;
const IVA_RATE = 0.16;
const IGTF_RATE = 0.03;

export async function cotizarMock({ propina, moneda_pago }) {
	// Simula latencia de red
	await new Promise((r) => setTimeout(r, 200));

	const c = get(carrito);
	if (!c.id_restaurante) {
		throw new Error('El carrito está vacío');
	}

	const rest = RESTAURANTES.find((r) => r.id_restaurante === c.id_restaurante);
	const subtotal = precioTotal(c.items);
	const costo_envio = rest?.costo_envio ?? 0;

	// IVA 16% sobre (subtotal + envío)
	const iva_total = +(subtotal + costo_envio) * IVA_RATE;

	// IGTF 3% solo si paga en USD, sobre (subtotal + envío + iva + propina)
	const base_igtf = subtotal + costo_envio + iva_total + propina;
	const igtf = moneda_pago === 'USD' ? +(base_igtf * IGTF_RATE) : 0;

	const total = +(subtotal + costo_envio + propina + iva_total + igtf);
	const total_ves = +(total * TASA_BCV);

	return {
		distancia_km: rest?.distancia_km ?? 0,
		subtotal: +subtotal.toFixed(2),
		costo_envio: +costo_envio.toFixed(2),
		propina: +propina.toFixed(2),
		iva_total: +iva_total.toFixed(2),
		igtf: +igtf.toFixed(2),
		total: +total.toFixed(2),
		tasa_bcv: TASA_BCV,
		total_ves: +total_ves.toFixed(2)
	};
}