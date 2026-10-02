// Tasa BCV. Cuando el backend esté listo:
// GET  → /api/admin/tasas-bcv (últimas 60)
// POST → /api/admin/tasas-bcv {fecha, tasa_usd}

const hoy = new Date().toISOString().split('T')[0];
const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const antes = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const TASAS_BCV_INICIALES = [
	{ fecha: hoy, tasa_usd: 38.5, fecha_registro: new Date().toISOString() },
	{ fecha: ayer, tasa_usd: 38.2, fecha_registro: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
	{ fecha: antes, tasa_usd: 38.0, fecha_registro: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
];

export function getTasaHoy(tasas) {
	const hoy = new Date().toISOString().split('T')[0];
	return tasas.find((t) => t.fecha === hoy) || null;
}