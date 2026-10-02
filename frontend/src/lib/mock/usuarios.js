// Usuarios demo mientras el backend no esté listo.
// Estos datos coinciden con roadmap_backend.txt sección 11.

export const USUARIOS_DEMO = [
    {
        email: 'cliente01@demo.com',
        password: 'demo1234',
        token: 'fake-jwt-cliente-01',
        rol: 'cliente',
        id_perfil: 1,
        nombre: 'Carlos Mendoza'
    },
    {
        email: 'restaurante01@demo.com',
        password: 'demo1234',
        token: 'fake-jwt-restaurante-01',
        rol: 'restaurante',
        id_perfil: 3,
        nombre: 'Burger Artisan Lab'
    },
    {
        email: 'repartidor01@demo.com',
        password: 'demo1234',
        token: 'fake-jwt-repartidor-01',
        rol: 'repartidor',
        id_perfil: 5,
        nombre: 'Carlos Méndez'
    },
    {
        email: 'coordinador01@demo.com',
        password: 'demo1234',
        token: 'fake-jwt-coordinador-01',
        rol: 'coordinador',
        id_perfil: 1,
        nombre: 'Coordinador Demo'
    },
    {
        email: 'admin@demo.com',
        password: 'demo1234',
        token: 'fake-jwt-admin-01',
        rol: 'admin',
        id_perfil: 1,
        nombre: 'Admin Demo'
    }
];

// Simula POST /api/auth/login con un retraso de red
export async function loginMock(email, password) {
  await new Promise(r => setTimeout(r, 600));

  const usuario = USUARIOS_DEMO.find(
    u => u.email === email && u.password === password
  );

  if (!usuario) {
    const error = new Error('Credenciales incorrectas');
    error.codigo = 'CREDENCIALES_INVALIDAS';
    throw error;
  }

  const { password: _, ...respuesta } = usuario;
  return respuesta;
}