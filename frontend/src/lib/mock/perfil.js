// Mock del perfil del cliente.
// Cuando el backend esté listo:
// - GET  → parte de GET /api/auth/yo
// - PUT  → PUT /api/cliente/datos-fiscales

let perfilCliente = {
	id_cliente: 1,
	nombre: 'Carlos Mendoza',
	email: 'carlos.mendoza@email.com',
	telefono: '0414 1234567',
	cedula_rif: 'V-18452903',
	foto_url: null
};

// GET — simula leer el perfil actual
export async function obtenerPerfilMock() {
	await new Promise((r) => setTimeout(r, 300));
	return { ...perfilCliente };
}

// PUT — simula PUT /api/cliente/datos-fiscales
export async function actualizarDatosFiscalesMock({ telefono, cedula_rif }) {
	await new Promise((r) => setTimeout(r, 600));

	// Simula validación del backend
	if (cedula_rif && !/^[VvJj]-?\d{6,9}(-\d)?$/.test(cedula_rif)) {
		throw new Error('Cédula/RIF inválido. Formato: V-12345678 o J-12345678-9');
	}

	perfilCliente.telefono = telefono;
	perfilCliente.cedula_rif = cedula_rif;

	return { ...perfilCliente };
}