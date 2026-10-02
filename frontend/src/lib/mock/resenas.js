// Reseñas de restaurantes (las que ven los clientes en el detalle).
// Cuando el backend esté listo: GET /api/cliente/restaurantes/{id}/resenas

export const RESENAS_POR_RESTAURANTE = {
	1: [
		{
			id: 1,
			cliente_nombre: 'María Fernández',
			puntaje: 5,
			comentario: 'Las mejores hamburguesas que he probado en Lechería. El bacon smash es una obra de arte.',
			fecha: '2026-09-20T19:30:00-04:00'
		},
		{
			id: 2,
			cliente_nombre: 'Luis Gómez',
			puntaje: 4,
			comentario: 'Muy buenas, aunque la última vez llegaron un poco frías. El sabor sigue siendo top.',
			fecha: '2026-09-15T20:10:00-04:00'
		},
		{
			id: 3,
			cliente_nombre: 'Andreína Rojas',
			puntaje: 5,
			comentario: 'Las papas trufadas son adictivas. Pedido llegó rapidísimo.',
			fecha: '2026-09-10T13:00:00-04:00'
		}
	],
	4: [
		{
			id: 10,
			cliente_nombre: 'Carlos Mendoza',
			puntaje: 5,
			comentario: 'La pizza margherita es auténtica napolitana. Se siente el horno de leña.',
			fecha: '2026-09-22T21:00:00-04:00'
		},
		{
			id: 11,
			cliente_nombre: 'Sofía Valenzuela',
			puntaje: 5,
			comentario: 'La mejor focaccia que he comido. Y el servicio es impecable.',
			fecha: '2026-09-18T20:30:00-04:00'
		}
	],
	8: [
		{
			id: 20,
			cliente_nombre: 'Daniela Pérez',
			puntaje: 5,
			comentario: 'Sushi fresco y bien presentado. El roll California es mi favorito.',
			fecha: '2026-09-12T19:00:00-04:00'
		},
		{
			id: 21,
			cliente_nombre: 'Ricardo Salazar',
			puntaje: 4,
			comentario: 'Buen sushi pero un poco caro. La calidad lo justifica.',
			fecha: '2026-09-05T21:30:00-04:00'
		}
	]
};

// Fallback para restaurantes sin reseñas
const RESENAS_DEFAULT = [
	{
		id: 999,
		cliente_nombre: 'Cliente Demo',
		puntaje: 4,
		comentario: 'Buena experiencia en general. Lo recomiendo.',
		fecha: '2026-09-01T12:00:00-04:00'
	}
];

export function obtenerResenas(idRestaurante) {
	return RESENAS_POR_RESTAURANTE[idRestaurante] || RESENAS_DEFAULT;
}