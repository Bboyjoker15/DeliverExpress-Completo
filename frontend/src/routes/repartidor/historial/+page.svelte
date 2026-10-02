<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import EstadoBadge from '$lib/componentes/EstadoBadge.svelte';
	import { obtenerHistorialMock } from '$lib/mock/repartidores.js';

	let datos = $state(null);
	let cargando = $state(true);

	onMount(async () => {
		try {
			datos = await obtenerHistorialMock();
		} finally {
			cargando = false;
		}
	});

	function fechaBonita(iso) {
		const d = new Date(iso);
		return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }) +
			' · ' +
			d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Historial · Repartidor</title>
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
			<h1 class="text-lg font-bold text-on-surface">Mi historial</h1>
			<p class="text-xs text-on-surface-variant mt-0.5">Todos los pedidos que has realizado</p>
		</section>

		{#if cargando}
			<div class="text-center py-16">
				<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
			</div>
		{:else if datos}
			<!-- Stats -->
			<section class="grid grid-cols-2 gap-3">
				<div class="bg-white rounded-2xl shadow-sm p-4">
					<p class="text-xs text-on-surface-variant">Total viajes</p>
					<p class="text-2xl font-bold text-on-surface mt-1">{datos.total_viajes}</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm p-4">
					<p class="text-xs text-on-surface-variant">Total ganado</p>
					<p class="text-2xl font-bold text-primary-container mt-1">{usd(datos.total_ganado)}</p>
				</div>
			</section>

			<!-- Lista -->
			<section class="bg-white rounded-2xl shadow-sm overflow-hidden">
				<div class="divide-y divide-gray-100">
					{#each datos.pedidos as p (p.id_pedido)}
						<div class="p-4 flex items-center justify-between gap-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="font-bold text-sm text-on-surface">#{p.id_pedido}</span>
									<EstadoBadge codigo={p.estado} />
								</div>
								<p class="text-xs text-on-surface-variant mt-1 truncate">
									{p.restaurante.nombre} → {p.cliente.nombre}
								</p>
								<p class="text-[10px] text-on-surface-variant/70 mt-0.5">
									{fechaBonita(p.fecha)}
								</p>
							</div>
							<div class="text-right shrink-0">
								<p class="font-bold text-primary-container">{usd(p.ganancia)}</p>
								<p class="text-[10px] text-on-surface-variant">
									{usd(p.costo_envio)} + {usd(p.propina)}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>