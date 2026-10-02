// Los 20 restaurantes de prueba.
// Cuando el backend esté listo, esto se reemplaza por GET /api/cliente/restaurantes

export const RESTAURANTES = [
	// 🍔 HAMBURGUESAS (3)
	{
		id_restaurante: 1,
		nombre: 'Burger Artisan Lab',
		categoria: 'Hamburguesas',
		id_categoria: 1,
		direccion: 'Av. Francisco de Miranda, Torre Delta, Piso 4',
		calificacion_promedio: 4.8,
		tiempo_prep_min: 22,
		abierto_ahora: true,
		distancia_km: 1.4,
		costo_envio: 0,
		imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80'
	},
	{
		id_restaurante: 2,
		nombre: 'Burger District Co.',
		categoria: 'Hamburguesas',
		id_categoria: 1,
		direccion: 'Av. Principal de Lechería, CC Costa Azul',
		calificacion_promedio: 4.6,
		tiempo_prep_min: 18,
		abierto_ahora: true,
		distancia_km: 2.1,
		costo_envio: 1.5,
		imagen: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80'
	},
	{
		id_restaurante: 3,
		nombre: 'La Birra Bar',
		categoria: 'Hamburguesas',
		id_categoria: 1,
		direccion: 'Av. 5 de Julio, Maracaibo',
		calificacion_promedio: 4.7,
		tiempo_prep_min: 25,
		abierto_ahora: true,
		distancia_km: 3.8,
		costo_envio: 2.0,
		imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80'
	},

	// 🍕 ITALIANA & PIZZA (2)
	{
		id_restaurante: 4,
		nombre: 'Bella Napoli Trattoria',
		categoria: 'Italiana & Pizza',
		id_categoria: 2,
		direccion: 'Calle Los Samanes, Torre Italia',
		calificacion_promedio: 4.9,
		tiempo_prep_min: 28,
		abierto_ahora: true,
		distancia_km: 2.6,
		costo_envio: 1.5,
		imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80'
	},
	{
		id_restaurante: 5,
		nombre: 'Napoletana Forno',
		categoria: 'Italiana & Pizza',
		id_categoria: 2,
		direccion: 'Av. Las Mercedes, CC Paseo Las Mercedes',
		calificacion_promedio: 4.7,
		tiempo_prep_min: 30,
		abierto_ahora: true,
		distancia_km: 4.2,
		costo_envio: 2.0,
		imagen: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80'
	},

	// 🌮 TACOS & MEXICANA (2)
	{
		id_restaurante: 6,
		nombre: 'Tacos El Auténtico',
		categoria: 'Tacos & Mexicana',
		id_categoria: 3,
		direccion: 'Av. Andrés Bello, Chacao',
		calificacion_promedio: 4.6,
		tiempo_prep_min: 15,
		abierto_ahora: true,
		distancia_km: 1.8,
		costo_envio: 1.2,
		imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80'
	},
	{
		id_restaurante: 7,
		nombre: 'La Taquería',
		categoria: 'Tacos & Mexicana',
		id_categoria: 3,
		direccion: 'Av. Libertador, Edif. La Previsora',
		calificacion_promedio: 4.5,
		tiempo_prep_min: 20,
		abierto_ahora: true,
		distancia_km: 2.9,
		costo_envio: 1.5,
		imagen: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=600&q=80'
	},

	// 🍣 SUSHI & NIKKEI (2)
	{
		id_restaurante: 8,
		nombre: 'Tokyo Sushi Bar',
		categoria: 'Sushi & Nikkei',
		id_categoria: 4,
		direccion: 'Av. El Parque, Torre América',
		calificacion_promedio: 4.7,
		tiempo_prep_min: 32,
		abierto_ahora: false,
		distancia_km: 3.5,
		costo_envio: 2.0,
		imagen: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80'
	},
	{
		id_restaurante: 9,
		nombre: 'Haru Sushi Bar',
		categoria: 'Sushi & Nikkei',
		id_categoria: 4,
		direccion: 'Calle Madrid, Las Mercedes',
		calificacion_promedio: 4.8,
		tiempo_prep_min: 30,
		abierto_ahora: true,
		distancia_km: 4.0,
		costo_envio: 2.0,
		imagen: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=80'
	},

	// 🥗 BOWLS & SALUDABLE (2)
	{
		id_restaurante: 10,
		nombre: 'Green Bowl Deli',
		categoria: 'Bowls & Saludable',
		id_categoria: 5,
		direccion: 'Av. Principal de Los Palos Grandes',
		calificacion_promedio: 4.8,
		tiempo_prep_min: 18,
		abierto_ahora: true,
		distancia_km: 2.2,
		costo_envio: 0,
		imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'
	},
	{
		id_restaurante: 11,
		nombre: 'Poke Life',
		categoria: 'Bowls & Saludable',
		id_categoria: 5,
		direccion: 'Av. Luis Roche, Altamira',
		calificacion_promedio: 4.6,
		tiempo_prep_min: 22,
		abierto_ahora: true,
		distancia_km: 3.1,
		costo_envio: 1.5,
		imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'
	},

	// ☕ CAFÉ & POSTRES (2)
	{
		id_restaurante: 12,
		nombre: 'Cafeína Roast & Bakery',
		categoria: 'Café & Postres',
		id_categoria: 6,
		direccion: 'Calle Madrid con Nueva York',
		calificacion_promedio: 4.9,
		tiempo_prep_min: 12,
		abierto_ahora: true,
		distancia_km: 1.5,
		costo_envio: 0,
		imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80'
	},
	{
		id_restaurante: 13,
		nombre: 'Dulce Deleite Bakery',
		categoria: 'Café & Postres',
		id_categoria: 6,
		direccion: 'Av. San Felipe, La Castellana',
		calificacion_promedio: 4.7,
		tiempo_prep_min: 15,
		abierto_ahora: true,
		distancia_km: 2.4,
		costo_envio: 1.2,
		imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80'
	},

	// 🍗 POLLO CRISPY (2)
	{
		id_restaurante: 14,
		nombre: 'Crispy Chicken Co.',
		categoria: 'Pollo Crispy',
		id_categoria: 7,
		direccion: 'Av. Rómulo Gallegos, CC Los Chaguaramos',
		calificacion_promedio: 4.5,
		tiempo_prep_min: 20,
		abierto_ahora: true,
		distancia_km: 3.3,
		costo_envio: 1.5,
		imagen: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80'
	},
	{
		id_restaurante: 15,
		nombre: 'Pollo Frito Express',
		categoria: 'Pollo Crispy',
		id_categoria: 7,
		direccion: 'Av. Intercomunal, El Valle',
		calificacion_promedio: 4.4,
		tiempo_prep_min: 18,
		abierto_ahora: false,
		distancia_km: 5.2,
		costo_envio: 2.0,
		imagen: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=600&q=80'
	},

	// 🥟 ASIÁTICA (2)
	{
		id_restaurante: 16,
		nombre: 'Wok Express Asiático',
		categoria: 'Asiática',
		id_categoria: 8,
		direccion: 'Av. Libertador, CC Centro Lido',
		calificacion_promedio: 4.5,
		tiempo_prep_min: 25,
		abierto_ahora: true,
		distancia_km: 2.7,
		costo_envio: 1.5,
		imagen: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80'
	},
	{
		id_restaurante: 17,
		nombre: 'Tokyo Ramen Bar',
		categoria: 'Asiática',
		id_categoria: 8,
		direccion: 'Calle La Guairita, Chuao',
		calificacion_promedio: 4.9,
		tiempo_prep_min: 30,
		abierto_ahora: false,
		distancia_km: 4.5,
		costo_envio: 2.0,
		imagen: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&q=80'
	},

	// 🇻🇪 VENEZOLANA (2)
	{
		id_restaurante: 18,
		nombre: 'Arepa House',
		categoria: 'Venezolana',
		id_categoria: 9,
		direccion: 'Av. Sucre, Catia',
		calificacion_promedio: 4.7,
		tiempo_prep_min: 15,
		abierto_ahora: true,
		distancia_km: 2.0,
		costo_envio: 1.0,
		imagen: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80'
	},
	{
		id_restaurante: 19,
		nombre: 'El Rincón Criollo',
		categoria: 'Venezolana',
		id_categoria: 9,
		direccion: 'Av. Baralt, Esquina La Bolsa',
		calificacion_promedio: 4.6,
		tiempo_prep_min: 20,
		abierto_ahora: true,
		distancia_km: 3.6,
		costo_envio: 1.5,
		imagen: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80'
	},

	// 🦐 MARISCOS (1)
	{
		id_restaurante: 20,
		nombre: 'Mariscos del Caribe',
		categoria: 'Mariscos',
		id_categoria: 10,
		direccion: 'Av. La Armada, Sector El Morro',
		calificacion_promedio: 4.8,
		tiempo_prep_min: 35,
		abierto_ahora: true,
		distancia_km: 5.8,
		costo_envio: 2.5,
		imagen: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80'
	}
];

// ══════════════════════════════════════════════
// FACTURAS DE COMISIÓN DEL RESTAURANTE
// GET /api/restaurante/facturas
// ══════════════════════════════════════════════
export const FACTURAS_COMISION = [
	{
		id_factura: 2001,
		tipo: 'factura',
		numero_factura: '00002001',
		numero_control: '00-0002001',
		fecha: '2026-10-01T10:00:00',
		periodo: '2026-09',
		base_imponible: 245.80,
		iva_16: 39.33,
		igtf: 0,
		total_usd: 285.13,
		total_bs: 10977.51,
		anulada: false,
		estado_pago: 'pendiente',
		fecha_pago: null
	},
	{
		id_factura: 2002,
		tipo: 'factura',
		numero_factura: '00002002',
		numero_control: '00-0002002',
		fecha: '2026-09-01T10:00:00',
		periodo: '2026-08',
		base_imponible: 218.40,
		iva_16: 34.94,
		igtf: 0,
		total_usd: 253.34,
		total_bs: 9753.59,
		anulada: false,
		estado_pago: 'pagada',
		fecha_pago: '2026-09-05'
	},
	{
		id_factura: 2003,
		tipo: 'factura',
		numero_factura: '00002003',
		numero_control: '00-0002003',
		fecha: '2026-08-01T10:00:00',
		periodo: '2026-07',
		base_imponible: 198.20,
		iva_16: 31.71,
		igtf: 0,
		total_usd: 229.91,
		total_bs: 8851.54,
		anulada: false,
		estado_pago: 'pagada',
		fecha_pago: '2026-08-06'
	},
	{
		id_factura: 2004,
		tipo: 'nota_credito',
		numero_factura: '00000501',
		numero_control: '00-0000501',
		fecha: '2026-07-15T11:30:00',
		periodo: '2026-06',
		base_imponible: -45.00,
		iva_16: -7.20,
		igtf: 0,
		total_usd: -52.20,
		total_bs: -2009.70,
		anulada: false,
		estado_pago: 'aplicada',
		fecha_pago: null,
		motivo: 'Ajuste por pedidos cancelados del periodo 2026-06'
	},
	{
		id_factura: 2005,
		tipo: 'factura',
		numero_factura: '00002004',
		numero_control: '00-0002004',
		fecha: '2026-07-01T10:00:00',
		periodo: '2026-06',
		base_imponible: 178.50,
		iva_16: 28.56,
		igtf: 0,
		total_usd: 207.06,
		total_bs: 7971.81,
		anulada: false,
		estado_pago: 'pagada',
		fecha_pago: '2026-07-05'
	},
	{
		id_factura: 2006,
		tipo: 'factura',
		numero_factura: '00002005',
		numero_control: '00-0002005',
		fecha: '2026-06-15T10:00:00',
		periodo: '2026-05',
		base_imponible: 165.00,
		iva_16: 26.40,
		igtf: 0,
		total_usd: 191.40,
		total_bs: 7368.90,
		anulada: true,
		estado_pago: 'anulada',
		fecha_pago: null
	}
];

// ══════════════════════════════════════════════
// "Endpoint" mock
// ══════════════════════════════════════════════
const esperar = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export async function obtenerFacturasComisionMock() {
	await esperar();
	return structuredClone(FACTURAS_COMISION);
}