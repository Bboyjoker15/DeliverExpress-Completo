import { redirect } from '@sveltejs/kit';

export function load({ cookies }) {
	// No podemos leer localStorage desde el servidor,
	// así que siempre redirigimos a /login.
	// El login detectará si ya hay sesión y redirigirá al rol correcto.
	throw redirect(302, '/login');
}