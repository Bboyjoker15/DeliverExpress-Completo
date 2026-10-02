<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import { obtenerLiquidacionesMock } from '$lib/mock/repartidores.js';

	let datos = $state(null);
	let cargando = $state(true);

	onMount(async () => {
		try {
			datos = await obtenerLiquidacionesMock();
		} finally {
			cargando = false;
		}
	});

	let totalPendiente = $derived(
		datos?.liquidaciones
			?.filter((l) => l.estado === 'pendiente')
			.reduce((acc, l) => acc + l.total, 0) ?? 0
	);

	function colorEstado(estado) {
		if (estado === 'pagada') return 'bg-green-100 text-green-800';
		if (estado === 'pendiente') return 'bg-yellow-100 text-yellow-900';
		return 'bg-gray-200 text-gray-800';
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
		{:else if datos}
			<!-- Total pendiente -->
			{#if totalPendiente > 0}
				<section class="bg-gradient-to-br from-primary-container to-primary text-white rounded-2xl shadow-lg p-5">
					<p class="text-xs uppercase opacity-80 font-semibold tracking-wider">Por cobrar</p>
					<p class="text-3xl font-bold mt-1">{usd(totalPendiente)}</p>
					<p class="text-xs opacity-80 mt-1">Se paga al cierre del periodo</p>
				</section>
			{/if}

			<!-- Lista -->
			<section class="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div class="divide-y divide-gray-100">
					{#each datos.liquidaciones as l (l.id_liquidacion)}
						<div class="p-5 flex flex-col gap-3">
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class="text-xs text-on-surface-variant">Periodo</p>
									<p class="text-sm font-bold text-on-surface">{l.periodo}</p>
								</div>
								<span class="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase {colorEstado(l.estado)}">
									{l.estado}
								</span>
							</div>

							<div class="grid grid-cols-4 gap-2 text-center text-xs bg-surface-container-low rounded-xl p-3">
								<div>
									<p class="text-on-surface-variant">Viajes</p>
									<p class="font-bold text-on-surface">{l.viajes}</p>
								</div>
								<div>
									<p class="text-on-surface-variant">Envíos</p>
									<p class="font-bold text-on-surface">{usd(l.envios)}</p>
								</div>
								<div>
									<p class="text-on-surface-variant">Propinas</p>
									<p class="font-bold text-on-surface">{usd(l.propinas)}</p>
								</div>
								<div>
									<p class="text-on-surface-variant">Total</p>
									<p class="font-bold text-primary-container">{usd(l.total)}</p>
								</div>
							</div>

							{#if l.estado === 'pagada' && l.fecha_pago}
								<p class="text-[11px] text-green-700 flex items-center gap-1">
									<span class="material-symbols-outlined text-[14px]">check_circle</span>
									Pagada el {l.fecha_pago}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>