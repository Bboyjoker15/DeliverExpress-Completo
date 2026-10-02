// Mocks del módulo Coordinador (usuarios + reportes + revisión + facturación).

// ══════════════════════════════════════════════
// USUARIOS COORDINADORES (los usa Admin)
// ══════════════════════════════════════════════
export const COORDINADORES_INICIALES = [
	{
		id_coordinador: 1,
		nombre: 'Coordinador Demo',
		email: 'coordinador01@demo.com',
		telefono: '+58 414 111-2233',
		activo: true
	},
	{
		id_coordinador: 2,
		nombre: 'María González',
		email: 'coordinador02@demo.com',
		telefono: '+58 414 222-3344',
		activo: true
	}
];

// ══════════════════════════════════════════════
// REPORTES
// ══════════════════════════════════════════════
export const REPORTE_TIEMPOS = {
	promedio_total_min: 32,
	por_estado: [
		{ estado: 'Recibido', promedio_min: 3, total: 12 },
		{ estado: 'En preparación', promedio_min: 14, total: 12 },
		{ estado: 'Listo para retirar', promedio_min: 6, total: 12 },
		{ estado: 'En camino', promedio_min: 9, total: 12 }
	],
	pedidos: [
		{ id_pedido: 25, restaurante: 'Burger Artisan Lab', tiempo_total_min: 26, tiempo_prep_min: 12, tiempo_entrega_min: 8 },
		{ id_pedido: 24, restaurante: 'Burger Artisan Lab', tiempo_total_min: 31, tiempo_prep_min: 15, tiempo_entrega_min: 10 },
		{ id_pedido: 23, restaurante: 'Burger Artisan Lab', tiempo_total_min: 24, tiempo_prep_min: 11, tiempo_entrega_min: 7 },
		{ id_pedido: 18, restaurante: 'Burger Artisan Lab', tiempo_total_min: 35, tiempo_prep_min: 18, tiempo_entrega_min: 12 },
		{ id_pedido: 17, restaurante: 'Bella Napoli Trattoria', tiempo_total_min: 42, tiempo_prep_min: 22, tiempo_entrega_min: 15 }
	]
};

export const REPORTE_RESTAURANTES = [
	{ id_restaurante: 1, nombre: 'Burger Artisan Lab', pedidos: 12, ingresos: 245.8, comision: 36.87, tiempo_promedio_min: 28, rating: 4.8 },
	{ id_restaurante: 4, nombre: 'Bella Napoli Trattoria', pedidos: 8, ingresos: 178.5, comision: 26.78, tiempo_promedio_min: 35, rating: 4.6 },
	{ id_restaurante: 6, nombre: 'Tacos El Auténtico', pedidos: 15, ingresos: 210.0, comision: 31.5, tiempo_promedio_min: 26, rating: 4.7 },
	{ id_restaurante: 8, nombre: 'Tokyo Sushi Bar', pedidos: 6, ingresos: 145.2, comision: 21.78, tiempo_promedio_min: 38, rating: 4.9 },
	{ id_restaurante: 10, nombre: 'Green Bowl Deli', pedidos: 4, ingresos: 78.4, comision: 11.76, tiempo_promedio_min: 24, rating: 4.5 }
];

export const REPORTE_REPARTIDORES = [
	{ id_repartidor: 1, nombre: 'Carlos Mendoza', viajes: 32, ganancias: 145.5, propinas: 52.0, rating: 4.9, rechazos: 1 },
	{ id_repartidor: 2, nombre: 'Lucía Rodríguez', viajes: 28, ganancias: 128.0, propinas: 41.5, rating: 4.8, rechazos: 0 },
	{ id_repartidor: 3, nombre: 'Mateo Gómez', viajes: 22, ganancias: 98.5, propinas: 28.0, rating: 4.7, rechazos: 3 },
	{ id_repartidor: 4, nombre: 'Sofía Peralta', viajes: 35, ganancias: 162.5, propinas: 58.5, rating: 5.0, rechazos: 0 },
	{ id_repartidor: 5, nombre: 'Andrés Vargas', viajes: 18, ganancias: 82.0, propinas: 22.0, rating: 4.8, rechazos: 2 }
];

export const REPORTE_LIQUIDACION = {
	periodo: '2026-09-23 al 2026-09-29',
	total_envios: 162.0,
	total_propinas: 62.0,
	total_comisiones: 128.65,
	liquidaciones: [
		{ id_repartidor: 1, nombre: 'Carlos Mendoza', viajes: 32, envios: 96.0, propinas: 52.0, total: 148.0 },
		{ id_repartidor: 2, nombre: 'Lucía Rodríguez', viajes: 28, envios: 84.0, propinas: 41.5, total: 125.5 },
		{ id_repartidor: 3, nombre: 'Mateo Gómez', viajes: 22, envios: 66.0, propinas: 28.0, total: 94.0 },
		{ id_repartidor: 4, nombre: 'Sofía Peralta', viajes: 35, envios: 105.0, propinas: 58.5, total: 163.5 }
	]
};

// ══════════════════════════════════════════════
// REVISIÓN
// ══════════════════════════════════════════════
export const REVISION_CLIENTES = [
	{ id_cliente: 12, nombre: 'Pedro Sánchez', rating: 2.1, pedidos: 8, cancelaciones: 3, motivo: 'Múltiples cancelaciones tardías' },
	{ id_cliente: 34, nombre: 'Lucía Fernández', rating: 2.4, pedidos: 5, cancelaciones: 2, motivo: 'Calificación baja recurrente' },
	{ id_cliente: 51, nombre: 'Manuel Rodríguez', rating: 2.6, pedidos: 12, cancelaciones: 4, motivo: 'Cancelaciones + rating bajo' }
];

export const REVISION_REPARTIDORES = [
	{ id_repartidor: 8, nombre: 'José Pérez', rating: 2.8, viajes: 15, rechazos: 8, motivo: 'Alto índice de rechazos' },
	{ id_repartidor: 11, nombre: 'María González', rating: 3.1, viajes: 22, rechazos: 5, motivo: 'Rating bajo' },
	{ id_repartidor: 15, nombre: 'Ricardo López', rating: 2.9, viajes: 10, rechazos: 6, motivo: 'Quejas de clientes' }
];

// ══════════════════════════════════════════════
// FACTURACIÓN
// ══════════════════════════════════════════════
export const FACTURAS_COORDINADOR = [
	{ id_factura: 1001, tipo: 'factura', numero_factura: '00001001', numero_control: '00-0001001', fecha: '2026-09-29T18:00:00', receptor: 'Tokyo Sushi Bar C.A.', rif: 'J-40123456-7', total_usd: 21.78, total_bs: 838.53, anulada: false },
	{ id_factura: 1002, tipo: 'factura', numero_factura: '00001002', numero_control: '00-0001002', fecha: '2026-09-27T18:00:00', receptor: 'Green Bowl Deli C.A.', rif: 'J-40987654-3', total_usd: 11.76, total_bs: 452.76, anulada: false },
	{ id_factura: 1003, tipo: 'factura', numero_factura: '00001003', numero_control: '00-0001003', fecha: '2026-09-25T18:00:00', receptor: 'Crispy Chicken Co. C.A.', rif: 'J-40778899-1', total_usd: 24.5, total_bs: 943.25, anulada: false },
	{ id_factura: 1004, tipo: 'factura', numero_factura: '00001004', numero_control: '00-0001004', fecha: '2026-09-22T18:00:00', receptor: 'Cafeína Roast & Bakery C.A.', rif: 'J-40665544-2', total_usd: 15.3, total_bs: 588.05, anulada: true },
	{ id_factura: 1005, tipo: 'nota_credito', numero_factura: '00000500', numero_control: '00-0000500', fecha: '2026-09-22T19:00:00', receptor: 'Cafeína Roast & Bakery C.A.', rif: 'J-40665544-2', total_usd: -15.3, total_bs: -588.05, anulada: false }
];

export const LIBRO_VENTAS = {
	periodo: '2026-09',
	total_ventas: 1589.4,
	total_notas_credito: -15.3,
	total_neto: 1574.1,
	por_mes: [
		{ mes: '2026-09', ventas_netas: 1574.1, iva_16: 251.85, igtf: 42.5 },
		{ mes: '2026-08', ventas_netas: 1423.0, iva_16: 227.68, igtf: 38.4 },
		{ mes: '2026-07', ventas_netas: 1298.7, iva_16: 207.79, igtf: 35.1 }
	],
	resumen_iva: [
		{ mes: '2026-09', base: 1574.1, iva: 251.85, exento: 45.0, no_sujeto: 0, igtf: 42.5 },
		{ mes: '2026-08', base: 1423.0, iva: 227.68, exento: 32.0, no_sujeto: 0, igtf: 38.4 },
		{ mes: '2026-07', base: 1298.7, iva: 207.79, exento: 28.5, no_sujeto: 0, igtf: 35.1 }
	]
};

export const LIQUIDACIONES_COORDINADOR = [
	{ id_liquidacion: 3, repartidor: 'Carlos Mendoza', periodo: '2026-09-23 al 2026-09-29', viajes: 18, envios: 54.0, propinas: 22.5, total: 76.5, estado: 'pendiente', fecha_pago: null },
	{ id_liquidacion: 2, repartidor: 'Carlos Mendoza', periodo: '2026-09-16 al 2026-09-22', viajes: 22, envios: 66.0, propinas: 31.0, total: 97.0, estado: 'pagada', fecha_pago: '2026-09-23' },
	{ id_liquidacion: 4, repartidor: 'Lucía Rodríguez', periodo: '2026-09-23 al 2026-09-29', viajes: 15, envios: 45.0, propinas: 18.0, total: 63.0, estado: 'pendiente', fecha_pago: null },
	{ id_liquidacion: 5, repartidor: 'Sofía Peralta', periodo: '2026-09-23 al 2026-09-29', viajes: 20, envios: 60.0, propinas: 25.0, total: 85.0, estado: 'pagada', fecha_pago: '2026-09-30' }
];

// ══════════════════════════════════════════════
// "Endpoints" mock
// ══════════════════════════════════════════════
const esperar = (ms = 150) => new Promise((r) => setTimeout(r, ms));

export async function obtenerReporteTiemposMock() {
	await esperar();
	return structuredClone(REPORTE_TIEMPOS);
}
export async function obtenerReporteRestaurantesMock() {
	await esperar();
	return structuredClone(REPORTE_RESTAURANTES);
}
export async function obtenerReporteRepartidoresMock() {
	await esperar();
	return structuredClone(REPORTE_REPARTIDORES);
}
export async function obtenerReporteLiquidacionMock() {
	await esperar();
	return structuredClone(REPORTE_LIQUIDACION);
}
export async function obtenerRevisionMock() {
	await esperar();
	return {
		clientes: structuredClone(REVISION_CLIENTES),
		repartidores: structuredClone(REVISION_REPARTIDORES)
	};
}
export async function obtenerFacturasMock() {
	await esperar();
	return structuredClone(FACTURAS_COORDINADOR);
}
export async function obtenerLibroVentasMock() {
	await esperar();
	return structuredClone(LIBRO_VENTAS);
}
export async function obtenerLiquidacionesCoordMock() {
	await esperar();
	return structuredClone(LIQUIDACIONES_COORDINADOR);
}
export async function anularFacturaMock(id, motivo) {
	await esperar(300);
	return { ok: true };
}