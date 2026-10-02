// Horarios del restaurante.
// Cuando el backend esté listo: GET/PUT /api/restaurante/horarios
// dia_semana: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

export const HORARIOS_INICIALES = [
	{ dia_semana: 1, abierto: true, hora_apertura: '09:00', hora_cierre: '22:00' },
	{ dia_semana: 2, abierto: true, hora_apertura: '09:00', hora_cierre: '22:00' },
	{ dia_semana: 3, abierto: true, hora_apertura: '09:00', hora_cierre: '22:00' },
	{ dia_semana: 4, abierto: true, hora_apertura: '09:00', hora_cierre: '23:00' },
	{ dia_semana: 5, abierto: true, hora_apertura: '09:00', hora_cierre: '23:59' },
	{ dia_semana: 6, abierto: true, hora_apertura: '11:00', hora_cierre: '23:59' },
	{ dia_semana: 0, abierto: false, hora_apertura: '09:00', hora_cierre: '22:00' }
];

export const NOMBRES_DIAS = {
	0: 'Domingo',
	1: 'Lunes',
	2: 'Martes',
	3: 'Miércoles',
	4: 'Jueves',
	5: 'Viernes',
	6: 'Sábado'
};

// Orden para mostrar: Lunes primero
export const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];