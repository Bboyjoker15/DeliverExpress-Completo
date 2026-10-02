import { writable } from 'svelte/store';

export const toasts = writable([]);

let id = 0;

export function mostrarToast(tipo, mensaje, duracion = 4000) {
  const toast = { id: ++id, tipo, mensaje };
  toasts.update(t => [...t, toast]);
  setTimeout(() => {
    toasts.update(t => t.filter(x => x.id !== toast.id));
  }, duracion);
}