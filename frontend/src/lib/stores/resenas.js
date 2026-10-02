import { writable, derived } from 'svelte/store';

// Reseñas iniciales por restaurante (mock)
const iniciales = {
	1: [
		{
			id: 1,
			cliente_nombre: 'María Fernández',
			puntaje: 5,
			comentario: 'Las mejores hamburguesas que he probado en Lechería.',
			fecha: '2026-09-20T19:30:00-04:00'
		},
		{
			id: 2,
			cliente_nombre: 'Luis Gómez',
			puntaje: 4,
			comentario: 'Muy buenas, aunque la última vez llegaron un poco frías.',
			fecha: '2026-09-15T20:10:00-04:00'
		}
	],
	4: [
		{
			id: 10,
			cliente_nombre: 'Carlos Mendoza',
			puntaje: 5,
			comentario: 'La pizza margherita es auténtica napolitana.',
			fecha: '2026-09-22T21:00:00-04:00'
		}
	],
	8: [
		{
			id: 20,
			cliente_nombre: 'Daniela Pérez',
			puntaje: 5,
			comentario: 'Sushi fresco y bien presentado.',
			fecha: '2026-09-12T19:00:00-04:00'
		}
	]
};

export const resenas = writable(iniciales);

// Obtener reseñas de un restaurante como store derivado
export function obtenerResenasDe(id_restaurante) {
	return derived(resenas, ($r) => $r[id_restaurante] || []);
}

// Agregar una reseña nueva (se llama al calificar)
export function agregarResena(id_restaurante, { cliente_nombre, puntaje, comentario }) {
	resenas.update((r) => {
		const lista = r[id_restaurante] || [];
		return {
			...r,
			[id_restaurante]: [
				{
					id: Date.now(),
					cliente_nombre,
					puntaje,
					comentario: comentario?.trim() || 'Sin comentario',
					fecha: new Date().toISOString()
				},
				...lista
			]
		};
	});
}