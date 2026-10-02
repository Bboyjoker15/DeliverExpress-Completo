import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const inicial = { token: null, rol: null, id_perfil: null, nombre: null };

export const sesion = writable(inicial);

// Lee de 'sesion' o 'session' (compatibilidad)
function leerDeStorage() {
	if (!browser) return null;
	const raw = localStorage.getItem('sesion') || localStorage.getItem('session');
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function cargarSesion() {
	const data = leerDeStorage();
	if (data) {
		// Normalizar: asegurar que tenga los campos correctos
		sesion.set({
			token: data.token || null,
			rol: data.rol || null,
			id_perfil: data.id_perfil ?? null,
			nombre: data.nombre || data.email || 'Usuario'
		});
	}
}

export function iniciarSesion(data) {
	const limpio = {
		token: data.token,
		rol: data.rol,
		id_perfil: data.id_perfil,
		nombre: data.nombre
	};
	sesion.set(limpio);
	if (browser) {
		// Guardar con la clave correcta
		localStorage.setItem('sesion', JSON.stringify(limpio));
		// Limpiar la clave vieja si existe
		localStorage.removeItem('session');
	}
}

export function cerrarSesion() {
	sesion.set(inicial);
	if (browser) {
		localStorage.removeItem('sesion');
		localStorage.removeItem('session');
	}
}

export const RUTA_POR_ROL = {
	cliente: '/cliente',
	restaurante: '/restaurante',
	repartidor: '/repartidor',
	coordinador: '/coordinador',
	admin: '/admin'
};