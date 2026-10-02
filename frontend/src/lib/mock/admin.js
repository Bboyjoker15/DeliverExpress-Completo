// Datos mock del panel de administración.
// Cuando el backend esté listo, se reemplaza por GET /api/admin/*

export const TARIFAS_ENVIO = [
  { id_tarifa: 1, km_desde: 0,  km_hasta: 2,  precio: 1.50 },
  { id_tarifa: 2, km_desde: 2,  km_hasta: 5,  precio: 2.50 },
  { id_tarifa: 3, km_desde: 5,  km_hasta: 8,  precio: 3.50 },
  { id_tarifa: 4, km_desde: 8,  km_hasta: 12, precio: 5.00 },
  { id_tarifa: 5, km_desde: 12, km_hasta: 999, precio: 7.00 }
];

export const PARAMETROS_SISTEMA = [
  { clave: 'comision_plataforma',   valor: '15',  descripcion: 'Porcentaje de comision de la plataforma' },
  { clave: 'rechazo_maximo_pct',    valor: '30',  descripcion: 'Porcentaje de rechazo antes de bajar prioridad' },
  { clave: 'calificacion_minima',   valor: '3.0', descripcion: 'Calificacion minima antes de marcar en revision' },
  { clave: 'calificaciones_minimas',valor: '10',  descripcion: 'Calificaciones minimas para calcular promedio' },
  { clave: 'comision_igtf_pct',     valor: '3',   descripcion: 'IGTF aplicable a pagos en USDT' },
  { clave: 'iva_pct',               valor: '16',  descripcion: 'IVA aplicable a productos no exentos' }
];
