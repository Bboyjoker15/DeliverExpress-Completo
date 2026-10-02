import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { sesion, cerrarSesion } from './stores/sesion.js';

const WS_URL = import.meta.env.VITE_WS_URL;

// Último mensaje recibido: { tipo, datos }
export const ultimoMensaje = writable(null);

// Estado de la conexión: 'desconectado' | 'conectando' | 'conectado'
export const estadoWs = writable('desconectado');

let socket = null;
let reintento = null;
let tokenActual = null;

// ══════════════════════════════════════════════
// CONECTAR
// ══════════════════════════════════════════════
function conectar(token) {
	if (!browser || !token) return;

	// Si ya hay conexión activa con el mismo token, no hacer nada
	if (socket && socket.readyState === WebSocket.OPEN && tokenActual === token) return;

	// Cerrar cualquier conexión previa
	if (socket) {
		try { socket.close(); } catch { /* ignorar */ }
		socket = null;
	}

	tokenActual = token;
	estadoWs.set('conectando');

	try {
		socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
	} catch (err) {
		console.error('[ws] error al crear WebSocket:', err);
		estadoWs.set('desconectado');
		programarReintento();
		return;
	}

	socket.onopen = () => {
		estadoWs.set('conectado');
		if (reintento) {
			clearTimeout(reintento);
			reintento = null;
		}
	};

	socket.onmessage = (evento) => {
		try {
			const msg = JSON.parse(evento.data);
			// Formato esperado: { tipo, datos }
			ultimoMensaje.set({
				tipo: msg.tipo,
				datos: msg.datos ?? msg.data ?? msg
			});
		} catch (err) {
			console.warn('[ws] mensaje no es JSON:', evento.data);
		}
	};

	socket.onerror = (err) => {
		console.error('[ws] error:', err);
	};

	socket.onclose = (evento) => {
		estadoWs.set('desconectado');
		socket = null;

		// Si fue cierre "limpio" (cerramos nosotros), no reintentar
		if (evento.code === 1000) return;

		// Si el token ya no existe (logout), no reintentar
		const s = get(sesion);
		if (!s.token) return;

		programarReintento();
	};
}

// ══════════════════════════════════════════════
// RECONEXIÓN cada 5s
// ══════════════════════════════════════════════
function programarReintento() {
	if (reintento) return;
	reintento = setTimeout(() => {
		reintento = null;
		const s = get(sesion);
		if (s.token) {
			conectar(s.token);
		}
	}, 5000);
}

// ══════════════════════════════════════════════
// DESCONECTAR
// ══════════════════════════════════════════════
export function desconectar() {
	if (reintento) {
		clearTimeout(reintento);
		reintento = null;
	}
	if (socket) {
		try { socket.close(1000, 'logout'); } catch { /* ignorar */ }
		socket = null;
	}
	tokenActual = null;
	estadoWs.set('desconectado');
	ultimoMensaje.set(null);
}

// ══════════════════════════════════════════════
// SUSCRIPCIÓN AUTOMÁTICA AL STORE DE SESIÓN
// ══════════════════════════════════════════════
if (browser) {
	sesion.subscribe((s) => {
		if (s.token) {
			conectar(s.token);
		} else {
			desconectar();
		}
	});
}

// ══════════════════════════════════════════════
// HELPER OPCIONAL: escuchar un tipo específico
// ══════════════════════════════════════════════
/**
 * Se suscribe a mensajes de un tipo específico. Devuelve una función
 * para desuscribirse (útil en onDestroy de Svelte).
 *
 * Uso:
 *   const off = escuchar('pedido', (datos) => { ... });
 *   onDestroy(off);
 */
export function escuchar(tipo, callback) {
	const unsub = ultimoMensaje.subscribe((msg) => {
		if (msg && msg.tipo === tipo) {
			callback(msg.datos);
		}
	});
	return unsub;
}