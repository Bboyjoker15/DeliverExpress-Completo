// Mocks del módulo Repartidor y datos del mapa para el coordinador.
// Cuando el backend esté listo, se reemplazan por las rutas reales.

// ══════════════════════════════════════════════
// REPARTIDORES Y RESTAURANTES PARA EL MAPA
// (los usa el panel del coordinador)
// GET /api/coordinador/repartidores
// ══════════════════════════════════════════════
export const REPARTIDORES_DISPONIBLES_DEMO = [
	{
		id_repartidor: 1,
		nombre: 'Carlos Mendoza',
		iniciales: 'CM',
		vehiculo: 'moto',
		zona: 'Zona Centro',
		disponibilidad: 'libre',
		calificacion_promedio: 4.9,
		latitud_actual: 8.29,
		longitud_actual: -62.715
	},
	{
		id_repartidor: 2,
		nombre: 'Lucía Rodríguez',
		iniciales: 'LR',
		vehiculo: 'bicicleta',
		zona: 'Zona Palermo / Norte',
		disponibilidad: 'libre',
		calificacion_promedio: 4.8,
		latitud_actual: 8.295,
		longitud_actual: -62.72
	},
	{
		id_repartidor: 3,
		nombre: 'Mateo Gómez',
		iniciales: 'MG',
		vehiculo: 'moto',
		zona: 'Zona Oeste',
		disponibilidad: 'ocupado',
		calificacion_promedio: 4.7,
		latitud_actual: 8.288,
		longitud_actual: -62.728
	},
	{
		id_repartidor: 4,
		nombre: 'Sofía Peralta',
		iniciales: 'SP',
		vehiculo: 'auto',
		zona: 'Zona Sur',
		disponibilidad: 'libre',
		calificacion_promedio: 5.0,
		latitud_actual: 8.282,
		longitud_actual: -62.71
	},
	{
		id_repartidor: 5,
		nombre: 'Andrés Vargas',
		iniciales: 'AV',
		vehiculo: 'bicicleta',
		zona: 'Zona Centro',
		disponibilidad: 'libre',
		calificacion_promedio: 4.8,
		latitud_actual: 8.293,
		longitud_actual: -62.708
	},
	{
		id_repartidor: 6,
		nombre: 'Diego Silva',
		iniciales: 'DS',
		vehiculo: 'moto',
		zona: 'Zona Este',
		disponibilidad: 'ocupado',
		calificacion_promedio: 4.6,
		latitud_actual: 8.286,
		longitud_actual: -62.705
	},
	{
		id_repartidor: 7,
		nombre: 'Elena Torres',
		iniciales: 'ET',
		vehiculo: 'bicicleta',
		zona: 'Zona Norte',
		disponibilidad: 'libre',
		calificacion_promedio: 4.9,
		latitud_actual: 8.298,
		longitud_actual: -62.718
	}
];

export const RESTAURANTES_MAPA_DEMO = [
	{ id_restaurante: 1, nombre: 'Pizzería Bella', latitud: 8.291, longitud: -62.715, categoria: 'Italiana' },
	{ id_restaurante: 2, nombre: 'Burger Craze', latitud: 8.285, longitud: -62.708, categoria: 'Hamburguesas' },
	{ id_restaurante: 3, nombre: 'Sushi Master', latitud: 8.296, longitud: -62.722, categoria: 'Sushi' },
	{ id_restaurante: 4, nombre: 'Tacos El Rey', latitud: 8.283, longitud: -62.714, categoria: 'Mexicana' },
	{ id_restaurante: 5, nombre: 'Green Bowl Deli', latitud: 8.29, longitud: -62.706, categoria: 'Saludable' }
];

// ══════════════════════════════════════════════
// MÓDULO REPARTIDOR (página /repartidor)
// GET /api/repartidor/yo
// ══════════════════════════════════════════════
export const YO_MOCK = {
	id_repartidor: 1,
	nombre: 'Carlos Mendoza',
	calificacion_promedio: 4.9,
	prioridad: 'alta', // 'alta' | 'media' | 'baja'
	disponibilidad: 'libre', // 'libre' | 'ocupado' | 'desconectado'
	vehiculo: 'moto',
	zona: 'Zona Centro',
	viajes_hoy: 3,
	ganancias_hoy: 24.5
};

// Oferta: WS "oferta" o GET /api/repartidor/oferta-pendiente
export const OFERTA_MOCK = {
	id_oferta: 10,
	id_pedido: 5,
	id_repartidor: 1,
	restaurante: {
		id_restaurante: 1,
		nombre: 'Pizzería Bella',
		direccion: 'Av. Guayana, Torre Bella, Local 2',
		latitud: 8.291,
		longitud: -62.715
	},
	cliente: {
		nombre: 'María Pérez',
		direccion: 'Calle Los Mangos, Casa 12',
		referencia: 'Portón negro, timbre azul',
		latitud: 8.283,
		longitud: -62.708
	},
	distancia_km: 2.5,
	costo_envio: 3.0,
	propina: 2.0,
	segundos_restantes: 30,
	respuesta: 'pendiente'
};

// GET /api/repartidor/pedido-actual
export const PEDIDO_ACTUAL_MOCK = {
	id_pedido: 5,
	estado: 'listo_para_retirar',
	restaurante: {
		nombre: 'Pizzería Bella',
		direccion: 'Av. Guayana, Torre Bella, Local 2',
		latitud: 8.291,
		longitud: -62.715
	},
	cliente: {
		nombre: 'María Pérez',
		direccion: 'Calle Los Mangos, Casa 12',
		referencia: 'Portón negro, timbre azul',
		telefono: '+58 414 1234567',
		latitud: 8.283,
		longitud: -62.708
	},
	productos: [
		{ cantidad: 1, nombre: 'Pizza Margarita Grande' },
		{ cantidad: 1, nombre: 'Refresco 2L' }
	],
	costo_envio: 3.0,
	propina: 2.0,
	total: 25.0,
	tiempo_estimado_min: 25,
	repartidor: { latitud_actual: 8.29, longitud_actual: -62.71 }
};

// GET /api/repartidor/historial
export const HISTORIAL_MOCK = {
	total_ganado: 145.5,
	total_viajes: 32,
	pedidos: [
		{
			id_pedido: 4,
			fecha: '2026-09-30T19:20:00',
			restaurante: { nombre: 'Burger Craze' },
			cliente: { nombre: 'Juan L.' },
			costo_envio: 3.0,
			propina: 2.5,
			ganancia: 5.5,
			estado: 'entregado'
		},
		{
			id_pedido: 3,
			fecha: '2026-09-30T13:05:00',
			restaurante: { nombre: 'Sushi Master' },
			cliente: { nombre: 'Ana G.' },
			costo_envio: 4.0,
			propina: 3.0,
			ganancia: 7.0,
			estado: 'entregado'
		},
		{
			id_pedido: 2,
			fecha: '2026-09-29T20:45:00',
			restaurante: { nombre: 'Tacos El Rey' },
			cliente: { nombre: 'Luis M.' },
			costo_envio: 3.0,
			propina: 1.0,
			ganancia: 4.0,
			estado: 'entregado'
		},
		{
			id_pedido: 1,
			fecha: '2026-09-29T12:10:00',
			restaurante: { nombre: 'Green Bowl Deli' },
			cliente: { nombre: 'Pedro S.' },
			costo_envio: 2.5,
			propina: 0,
			ganancia: 2.5,
			estado: 'cancelado'
		}
	]
};

// GET /api/repartidor/liquidaciones
export const LIQUIDACIONES_MOCK = {
	liquidaciones: [
		{
			id_liquidacion: 3,
			periodo: '2026-09-23 al 2026-09-29',
			viajes: 18,
			envios: 54.0,
			propinas: 22.5,
			total: 76.5,
			estado: 'pendiente',
			fecha_pago: null
		},
		{
			id_liquidacion: 2,
			periodo: '2026-09-16 al 2026-09-22',
			viajes: 22,
			envios: 66.0,
			propinas: 31.0,
			total: 97.0,
			estado: 'pagada',
			fecha_pago: '2026-09-23'
		},
		{
			id_liquidacion: 1,
			periodo: '2026-09-09 al 2026-09-15',
			viajes: 15,
			envios: 45.0,
			propinas: 18.0,
			total: 63.0,
			estado: 'pagada',
			fecha_pago: '2026-09-16'
		}
	]
};

// ══════════════════════════════════════════════
// "Endpoints" mock (con latencia simulada)
// ══════════════════════════════════════════════
const esperar = (ms = 150) => new Promise((r) => setTimeout(r, ms));

export async function obtenerYoMock() {
	await esperar();
	return structuredClone(YO_MOCK);
}

export async function obtenerOfertaPendienteMock() {
	await esperar();
	// Para probar la oferta, descomenta la siguiente línea:
	// return structuredClone(OFERTA_MOCK);
	return null;
}

export async function obtenerPedidoActualMock() {
	await esperar();
	return structuredClone(PEDIDO_ACTUAL_MOCK);
}

export async function obtenerHistorialMock() {
	await esperar();
	return structuredClone(HISTORIAL_MOCK);
}

export async function obtenerLiquidacionesMock() {
	await esperar();
	return structuredClone(LIQUIDACIONES_MOCK);
}

export async function responderOfertaMock(idOferta, respuesta) {
	await esperar(300);
	if (!['aceptada', 'rechazada'].includes(respuesta)) {
		throw new Error('Respuesta inválida');
	}
	return { ok: true };
}

export async function cambiarDisponibilidadMock(disponibilidad) {
	await esperar(200);
	if (!['libre', 'desconectado'].includes(disponibilidad)) {
		throw new Error('Disponibilidad inválida');
	}
	YO_MOCK.disponibilidad = disponibilidad;
	return { ok: true, disponibilidad };
}

export async function retirarPedidoMock(id) {
	await esperar(300);
	PEDIDO_ACTUAL_MOCK.estado = 'en_camino';
	return { ok: true };
}

export async function entregarPedidoMock(id) {
	await esperar(300);
	PEDIDO_ACTUAL_MOCK.estado = 'entregado';
	return { ok: true };
}

export async function calificarClienteMock(id, estrellas, comentario) {
	await esperar(200);
	return { ok: true };
}

export async function enviarUbicacionMock(lat, lon) {
	return { ok: true };
}