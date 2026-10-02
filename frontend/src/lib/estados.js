export const ESTADOS = {
  recibido:           { id: 1, texto: 'Recibido',           clase: 'bg-gray-200 text-gray-800' },
  en_preparacion:     { id: 2, texto: 'En preparación',     clase: 'bg-yellow-200 text-yellow-900' },
  listo_para_retirar: { id: 3, texto: 'Listo para retirar', clase: 'bg-blue-200 text-blue-900' },
  en_camino:          { id: 4, texto: 'En camino',          clase: 'bg-purple-200 text-purple-900' },
  entregado:          { id: 5, texto: 'Entregado',          clase: 'bg-green-200 text-green-900' },
  cancelado:          { id: 6, texto: 'Cancelado',          clase: 'bg-red-200 text-red-900' }
};

export const ORDEN_ESTADOS = ['recibido', 'en_preparacion', 'listo_para_retirar', 'en_camino', 'entregado'];