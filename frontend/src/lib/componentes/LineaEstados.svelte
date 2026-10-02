<script>
	import { ESTADOS, ORDEN_ESTADOS } from '$lib/estados.js';
	import { hora } from '$lib/formato.js';

	let { historial = [], estadoActual = 'recibido' } = $props();

	let indiceActual = $derived(ORDEN_ESTADOS.indexOf(estadoActual));

	function fechaDeEstado(codigo) {
		const h = historial.find((x) => x.estado_codigo === codigo);
		return h ? hora(h.fecha_hora) : '--:--';
	}
</script>

<div class="w-full py-4">
	<div class="relative flex items-start justify-between">
		<!-- Línea conectora base -->
		<div class="absolute top-5 left-[6%] right-[6%] h-1 bg-surface-container rounded-full -z-0"></div>

		<!-- Línea activa -->
		<div
			class="absolute top-5 left-[6%] h-1 bg-primary-container rounded-full -z-0 transition-all duration-500"
			style="width: {indiceActual > 0 ? (indiceActual / (ORDEN_ESTADOS.length - 1)) * 88 : 0}%"
		></div>

		{#each ORDEN_ESTADOS as codigo, i (codigo)}
			{@const estado = ESTADOS[codigo]}
			{@const alcanzado = i <= indiceActual}
			{@const esActual = i === indiceActual}

			<div class="flex flex-col items-center text-center z-10" style="flex: 1;">
				{#if esActual}
					<!-- Estado actual con pulso -->
					<div class="relative flex items-center justify-center">
						<span class="absolute inline-flex h-12 w-12 rounded-full bg-primary-fixed animate-ping opacity-60"></span>
						<div class="relative w-11 h-11 rounded-full bg-white border-4 border-primary-container flex items-center justify-center text-primary-container shadow-md">
							<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">
								{codigo === 'recibido' ? 'receipt_long' : ''}
								{codigo === 'en_preparacion' ? 'soup_kitchen' : ''}
								{codigo === 'listo_para_retirar' ? 'inventory_2' : ''}
								{codigo === 'en_camino' ? 'two_wheeler' : ''}
								{codigo === 'entregado' ? 'check_circle' : ''}
							</span>
						</div>
					</div>
				{:else if alcanzado}
					<!-- Alcanzado -->
					<div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white shadow-sm ring-4 ring-white">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
							<path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</div>
				{:else}
					<!-- Futuro -->
					<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-sm ring-4 ring-white">
						{i + 1}
					</div>
				{/if}

				<p class="mt-2 text-xs font-semibold leading-tight
					{esActual ? 'text-primary-container' : alcanzado ? 'text-on-surface' : 'text-on-surface-variant'}">
					{estado.texto}
				</p>
				<p class="text-[11px] mt-0.5
					{esActual ? 'text-primary-container font-semibold' : 'text-on-surface-variant'}">
					{fechaDeEstado(codigo)}
				</p>
			</div>
		{/each}
	</div>
</div>