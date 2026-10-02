<script>
	import { usd, bs } from '$lib/formato.js';

	let { factura } = $props();

	let esNotaCredito = $derived(factura?.tipo === 'nota_credito');
	let titulo = $derived(esNotaCredito ? 'NOTA DE CRÉDITO' : 'FACTURA');

	function fechaBonita(iso) {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString('es-VE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function horaBonita(iso) {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
	}

	function etiquetaAlicuota(a) {
		if (a === 0) return 'Exento';
		return `${a}%`;
	}
</script>

<article
	class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-4xl mx-auto relative print:shadow-none print:border-none print:rounded-none print:max-w-none print:p-0"
>
	<!-- Sello ANULADA -->
	{#if factura.anulada}
		<div
			class="absolute top-24 right-6 sm:right-12 rotate-[-18deg] border-4 border-red-500 text-red-500 font-black text-3xl sm:text-5xl px-6 py-2 rounded-lg opacity-80 pointer-events-none select-none print:opacity-100"
		>
			ANULADA
		</div>
	{/if}

	<!-- ═══════ ENCABEZADO ═══════ -->
	<header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b-2 border-gray-800">
		<div>
			<h1 class="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
				{titulo}
			</h1>
			<p class="text-xs text-on-surface-variant mt-1">
				{esNotaCredito ? 'Documento de anulación' : 'Documento fiscal'}
			</p>
		</div>
		<div class="text-left sm:text-right text-sm">
			<div class="font-mono">
				<span class="text-on-surface-variant">N°:</span>
				<span class="font-bold text-on-surface">{factura.numero_factura}</span>
			</div>
			<div class="font-mono mt-0.5">
				<span class="text-on-surface-variant">Control:</span>
				<span class="font-bold text-on-surface">{factura.numero_control}</span>
			</div>
			<div class="mt-2 text-xs text-on-surface-variant">
				<div>Fecha: <span class="font-semibold text-on-surface">{fechaBonita(factura.fecha)}</span></div>
				<div>Hora: <span class="font-semibold text-on-surface">{horaBonita(factura.fecha)}</span></div>
			</div>
		</div>
	</header>

	<!-- ═══════ EMISOR / RECEPTOR ═══════ -->
	<section class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-gray-200">
		<div>
			<h2 class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
				Emisor
			</h2>
			<div class="text-sm space-y-0.5">
				<p class="font-bold text-on-surface">{factura.emisor.razon_social}</p>
				<p class="font-mono text-xs text-on-surface-variant">RIF: {factura.emisor.rif}</p>
				<p class="text-xs text-on-surface-variant leading-snug">{factura.emisor.direccion_fiscal}</p>
				<p class="text-xs text-on-surface-variant">{factura.emisor.telefono}</p>
			</div>
		</div>
		<div>
			<h2 class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
				Receptor
			</h2>
			<div class="text-sm space-y-0.5">
				<p class="font-bold text-on-surface">{factura.receptor.razon_social}</p>
				<p class="font-mono text-xs text-on-surface-variant">
					{factura.receptor.rif.startsWith('J') ? 'RIF' : 'C.I.'}: {factura.receptor.rif}
				</p>
				<p class="text-xs text-on-surface-variant leading-snug">{factura.receptor.direccion_fiscal}</p>
			</div>
		</div>
	</section>

	<!-- ═══════ LÍNEAS ═══════ -->
	<section class="py-4 overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="text-left text-[11px] text-on-surface-variant uppercase tracking-wide border-b border-gray-300">
					<th class="py-2 pr-2">Descripción</th>
					<th class="py-2 px-2 text-center w-14">Cant.</th>
					<th class="py-2 px-2 text-right w-24">P. Unit.</th>
					<th class="py-2 px-2 text-center w-16">Alíc.</th>
					<th class="py-2 px-2 text-right w-24">Base</th>
					<th class="py-2 px-2 text-right w-20">IVA</th>
					<th class="py-2 pl-2 text-right w-24">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each factura.lineas as l, i (i)}
					<tr class="border-b border-gray-100">
						<td class="py-2 pr-2 text-on-surface">{l.descripcion}</td>
						<td class="py-2 px-2 text-center text-on-surface">{l.cantidad}</td>
						<td class="py-2 px-2 text-right font-mono text-on-surface">{usd(l.precio_unitario)}</td>
						<td class="py-2 px-2 text-center text-xs text-on-surface-variant">
							{etiquetaAlicuota(l.alicuota)}
						</td>
						<td class="py-2 px-2 text-right font-mono text-on-surface">{usd(l.base_imponible)}</td>
						<td class="py-2 px-2 text-right font-mono text-on-surface">{usd(l.iva)}</td>
						<td class="py-2 pl-2 text-right font-mono font-semibold text-on-surface">
							{usd(l.total)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<!-- ═══════ TOTALES ═══════ -->
	<section class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-gray-800">
		<div class="text-xs text-on-surface-variant space-y-1">
			<div class="flex items-center gap-2">
				<span class="w-2 h-2 rounded-full bg-primary-container"></span>
				<span>Tasa BCV aplicada:</span>
				<span class="font-mono font-bold text-on-surface">Bs. {factura.tasa_bcv.toFixed(2)}</span>
			</div>
			<p class="leading-snug pt-1">
				Documento generado por DeliverExpress. Esta factura cumple con las especificaciones
				de la Providencia Administrativa del SENIAT.
			</p>
		</div>
		<div class="space-y-1.5 text-sm">
			<div class="flex justify-between">
				<span class="text-on-surface-variant">Subtotal</span>
				<span class="font-mono text-on-surface">{usd(factura.subtotal)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-on-surface-variant">IVA 16%</span>
				<span class="font-mono text-on-surface">{usd(factura.iva_16)}</span>
			</div>
			{#if factura.exento !== 0}
				<div class="flex justify-between">
					<span class="text-on-surface-variant">Exento</span>
					<span class="font-mono text-on-surface">{usd(factura.exento)}</span>
				</div>
			{/if}
			{#if factura.no_sujeto !== 0}
				<div class="flex justify-between">
					<span class="text-on-surface-variant">No sujeto</span>
					<span class="font-mono text-on-surface">{usd(factura.no_sujeto)}</span>
				</div>
			{/if}
			{#if factura.igtf !== 0}
				<div class="flex justify-between">
					<span class="text-on-surface-variant">IGTF 3%</span>
					<span class="font-mono text-on-surface">{usd(factura.igtf)}</span>
				</div>
			{/if}
			<div class="flex justify-between pt-2 border-t border-gray-300">
				<span class="font-bold text-on-surface">TOTAL USD</span>
				<span class="font-mono font-bold text-on-surface text-base">{usd(factura.total_usd)}</span>
			</div>
			<div class="flex justify-between pt-1">
				<span class="text-on-surface-variant text-xs">TOTAL Bs.</span>
				<span class="font-mono font-bold text-primary-container text-base">{bs(factura.total_bs)}</span>
			</div>
		</div>
	</section>

	<!-- ═══════ MOTIVO ANULACIÓN ═══════ -->
	{#if factura.anulada && factura.motivo_anulacion}
		<section class="mt-6 pt-4 border-t border-red-200">
			<p class="text-xs text-red-700">
				<strong>Motivo de anulación:</strong> {factura.motivo_anulacion}
			</p>
		</section>
	{/if}

	<footer class="pt-6 mt-6 border-t border-gray-200 text-center text-[10px] text-on-surface-variant print:pt-4">
		<p>DeliverExpress C.A. · RIF {factura.emisor.rif} · Documento generado electrónicamente</p>
	</footer>
</article>