import { writable } from 'svelte/store';
import { api } from '$lib/api.js';

// La API solo devuelve los dias ABIERTOS ({dia_semana, hora_apertura,
// hora_cierre}); un dia sin fila = cerrado todo el dia. Aqui se reconstruyen
// los 7 dias con un flag "abierto" para la UI.
export const horarios = writable(
	Array.from({ length: 7 }, (_, dia_semana) => ({
		dia_semana,
		abierto: false,
		hora_apertura: '08:00',
		hora_cierre: '22:00'
	}))
);

export async function cargarHorarios() {
	const abiertos = await api('/api/restaurante/horarios');
	const porDia = new Map(abiertos.map((h) => [h.dia_semana, h]));
	horarios.set(
		Array.from({ length: 7 }, (_, dia_semana) => {
			const h = porDia.get(dia_semana);
			return h
				? { dia_semana, abierto: true, hora_apertura: h.hora_apertura, hora_cierre: h.hora_cierre }
				: { dia_semana, abierto: false, hora_apertura: '08:00', hora_cierre: '22:00' };
		})
	);
}

// Reemplaza el horario completo: solo se mandan los dias marcados "abierto".
export async function actualizarHorarios(lista) {
	const cuerpo = lista
		.filter((h) => h.abierto)
		.map((h) => ({ dia_semana: h.dia_semana, hora_apertura: h.hora_apertura, hora_cierre: h.hora_cierre }));
	await api('/api/restaurante/horarios', { metodo: 'PUT', cuerpo });
	await cargarHorarios();
}

export async function resetearHorarios() {
	await cargarHorarios();
}
