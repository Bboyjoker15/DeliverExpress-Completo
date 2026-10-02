const nf = new Intl.NumberFormat('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const usd = (n) => `$ ${nf.format(Number(n ?? 0))}`;
export const bs = (n) => `Bs. ${nf.format(Number(n ?? 0))}`;

export const fechaHora = (iso) =>
  iso ? new Date(iso).toLocaleString('es-VE') : '—';

export const hora = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : '—';