<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import { api } from '$lib/api.js';

	let liquidaciones = $state(null);
	let cargando = $state(true);

	onMount(async () => {
		try {
			liquidaciones = await api('/api/repartidor/liquidaciones');
		} finally {
			cargando = false;
		}
	});

	function formatearFecha(iso) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Liquidaciones · Repartidor</title>
</svelte:head>

<div class="min-h-screen bg-surface">
	<main class="max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-5">

		<button
			type="button"
			onclick={() => goto('/repartidor')}
			class="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary-container self-start"
		>
			<span class="material-symbols-outlined text-[20px]">arrow_back</span>
			Volver al panel
		</button>

		<section class="bg-white rounded-2xl shadow-sm p-5">
			<h1 class="text-lg font-bold text-on-surface">Mis liquidaciones</h1>
			<p class="text-xs text-on-surface-variant mt-0.5">Pagos semanales por envíos y propinas</p>
		</section>

		{#if cargando}
			<div class="text-center py-16">
				<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
			</div>
		{:else if liquidaciones}
			<!-- Lista -->
			{#if liquidaciones.length === 0}
				<section class="bg-white rounded-2xl py-16 text-center">
					<p class="text-sm font-semibold text-on-surface">Aún no tienes liquidaciones</p>
					<p class="text-xs text-on-surface-variant mt-1">Aparecerán aquí al cierre de cada periodo</p>
				</section>
			{:else}
				<section class="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div class="divide-y divide-gray-100">
						{#each liquidaciones as l (l.id_liquidacion)}
							<div class="p-5 flex flex-col gap-3">
								<div class="flex items-start justify-between gap-3">
									<div>
										<p class="text-xs text-on-surface-variant">Periodo</p>
										<p class="text-sm font-bold text-on-surface">
											{formatearFecha(l.periodo_desde)} – {formatearFecha(l.periodo_hasta)}
										</p>
									</div>
									<span class="text-[11px] font-mono text-on-surface-variant">#{l.numero}</span>
								</div>

								<div class="grid grid-cols-4 gap-2 text-center text-xs bg-surface-container-low rounded-xl p-3">
									<div>
										<p class="text-on-surface-variant">Viajes</p>
										<p class="font-bold text-on-surface">{l.viajes}</p>
									</div>
									<div>
										<p class="text-on-surface-variant">Envíos</p>
										<p class="font-bold text-on-surface">{usd(l.total_envios)}</p>
									</div>
									<div>
										<p class="text-on-surface-variant">Propinas</p>
										<p class="font-bold text-on-surface">{usd(l.total_propinas)}</p>
									</div>
									<div>
										<p class="text-on-surface-variant">Total</p>
										<p class="font-bold text-primary-container">{usd(l.total)}</p>
									</div>
								</div>

								<p class="text-[11px] text-on-surface-variant flex items-center gap-1">
									<span class="material-symbols-outlined text-[14px]">check_circle</span>
									Emitida el {formatearFecha(l.fecha_emision)}
								</p>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/if}
	</main>
</div>