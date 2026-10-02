// Mock de GET /api/facturas/{id}
// Forma según roadmap_backend.txt sección 3.
// Cuando el backend esté listo, se cambia por api(`/facturas/${id}`) sin tocar pantallas.

const EMISOR = {
	rif: 'J-40892184-2',
	razon_social: 'DeliverExpress C.A.',
	direccion_fiscal: 'Av. Guayana, Torre DeliverExpress, Piso 4, Puerto Ordaz',
	telefono: '+58 286 0000000'
};

const FACTURAS = {
	// Factura al cliente por un pedido
	1: {
		id_factura: 1,
		tipo: 'factura',
		numero_factura: '00000123',
		numero_control: '00-0000123',
		fecha: '2026-10-01T14:35:00',
		anulada: false,
		motivo_anulacion: null,
		emisor: EMISOR,
		receptor: {
			rif: 'V-12345678',
			razon_social: 'María Pérez',
			direccion_fiscal: 'Calle Los Mangos, Casa 12, Puerto Ordaz'
		},
		lineas: [
			{
				descripcion: 'Hamburguesa Clásica',
				cantidad: 2,
				precio_unitario: 8.5,
				alicuota: 16,
				base_imponible: 17.0,
				iva: 2.72,
				total: 19.72
			},
			{
				descripcion: 'Papas Fritas Grandes',
				cantidad: 1,
				precio_unitario: 4.0,
				alicuota: 16,
				base_imponible: 4.0,
				iva: 0.64,
				total: 4.64
			},
			{
				descripcion: 'Refresco (exento)',
				cantidad: 2,
				precio_unitario: 1.5,
				alicuota: 0,
				base_imponible: 3.0,
				iva: 0,
				total: 3.0
			},
			{
				descripcion: 'Servicio de envío',
				cantidad: 1,
				precio_unitario: 3.0,
				alicuota: 16,
				base_imponible: 3.0,
				iva: 0.48,
				total: 3.48
			}
		],
		subtotal: 27.0,
		iva_16: 3.84,
		exento: 3.0,
		no_sujeto: 0,
		igtf: 1.01,
		total_usd: 31.85,
		tasa_bcv: 38.5,
		total_bs: 1226.23
	},

	// Factura de comisión al restaurante
	2: {
		id_factura: 2,
		tipo: 'factura',
		numero_factura: '00000124',
		numero_control: '00-0000124',
		fecha: '2026-10-01T18:00:00',
		anulada: false,
		motivo_anulacion: null,
		emisor: EMISOR,
		receptor: {
			rif: 'J-40892184-2',
			razon_social: 'Burger Artisan Lab C.A.',
			direccion_fiscal: 'Av. Principal, Local 3, Puerto Ordaz'
		},
		lineas: [
			{
				descripcion: 'Comisión 15% · Periodo 2026-09',
				cantidad: 1,
				precio_unitario: 245.0,
				alicuota: 16,
				base_imponible: 245.0,
				iva: 39.2,
				total: 284.2
			}
		],
		subtotal: 245.0,
		iva_16: 39.2,
		exento: 0,
		no_sujeto: 0,
		igtf: 0,
		total_usd: 284.2,
		tasa_bcv: 38.5,
		total_bs: 10941.7
	},

	// Nota de crédito (anulación)
	3: {
		id_factura: 3,
		tipo: 'nota_credito',
		numero_factura: '00000045',
		numero_control: '00-0000045',
		fecha: '2026-10-01T19:20:00',
		anulada: false,
		motivo_anulacion: null,
		emisor: EMISOR,
		receptor: {
			rif: 'J-40892184-2',
			razon_social: 'Burger Artisan Lab C.A.',
			direccion_fiscal: 'Av. Principal, Local 3, Puerto Ordaz'
		},
		lineas: [
			{
				descripcion: 'Anulación factura N° 00000120 (pedido cancelado)',
				cantidad: 1,
				precio_unitario: -45.0,
				alicuota: 16,
				base_imponible: -45.0,
				iva: -7.2,
				total: -52.2
			}
		],
		subtotal: -45.0,
		iva_16: -7.2,
		exento: 0,
		no_sujeto: 0,
		igtf: 0,
		total_usd: -52.2,
		tasa_bcv: 38.5,
		total_bs: -2009.7
	},

	// Factura anulada (con sello)
	4: {
		id_factura: 4,
		tipo: 'factura',
		numero_factura: '00000125',
		numero_control: '00-0000125',
		fecha: '2026-10-01T10:00:00',
		anulada: true,
		motivo_anulacion: 'Error en monto de comisión',
		emisor: EMISOR,
		receptor: {
			rif: 'J-40892184-2',
			razon_social: 'Pizzería Bella Napoli C.A.',
			direccion_fiscal: 'Calle Italia, Local 8, Puerto Ordaz'
		},
		lineas: [
			{
				descripcion: 'Comisión 15% · Periodo 2026-09',
				cantidad: 1,
				precio_unitario: 180.0,
				alicuota: 16,
				base_imponible: 180.0,
				iva: 28.8,
				total: 208.8
			}
		],
		subtotal: 180.0,
		iva_16: 28.8,
		exento: 0,
		no_sujeto: 0,
		igtf: 0,
		total_usd: 208.8,
		tasa_bcv: 38.5,
		total_bs: 8038.8
	}
};

// Simula GET /api/facturas/{id}
export async function obtenerFacturaMock(id) {
	await new Promise((r) => setTimeout(r, 200));
	const f = FACTURAS[String(id)];
	if (!f) {
		throw Object.assign(new Error('Factura no encontrada'), { codigo: 'NO_ENCONTRADA' });
	}
	return structuredClone(f);
}

export const FACTURAS_MOCK = FACTURAS;