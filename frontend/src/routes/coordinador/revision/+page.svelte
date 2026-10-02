<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { mostrarToast } from '$lib/toast.js';
	import { obtenerRevisionMock } from '$lib/mock/coordinadores.js';

	let datos = $state(null);
	let cargando = $state(true);

	onMount(async () => {
		try {
			datos = await obtenerRevisionMock();
		} finally {
			cargando = false;
		}
	});

	function aprobar(tipo, id) {
		mostrarToast('exito', 'Usuario aprobado');
	}

	function suspender(tipo, id) {
		mostrarToast('info', 'Usuario suspendido');
	}
</script>

<svelte:head><title>Revisión · Coordinador</title></svelte:head>

<div class="min-h-screen bg-surface">
	<main class="max-w-[900px] mx-auto px-4 py-5 flex flex-col gap-5">

		<button
			type="button"
			onclick={() => goto('/coordinador')}
			class="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary-container self-start"
		>
			<span class="material-symbols-outlined text-[20px]">arrow_back</span>
			Volver al panel
		</button>

		<section class="bg-white rounded-2xl shadow-sm p-5">
			<h1 class="text-lg font-bold text-on-surface">Revisión de usuarios</h1>
			<p class="text-xs text-on-surface-variant mt-0.5">
				Clientes y repartidores con rating bajo o múltiples incidencias
			</p>
		</section>

		{#if cargando}
			<div class="text-center py-16">
				<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
			</div>
		{:else if datos}
			<section class="bg-white rounded-2xl shadow-sm">
				<div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
					<h2 class="text-sm font-bold text-on-surface">Clientes en revisión</h2>
					<span class="text-xs text-on-surface-variant">{datos.clientes.length} usuarios</span>
				</div>
				{#if datos.clientes.length === 0}
					<p class="text-xs text-on-surface-variant py-6 text-center">Sin clientes en revisión</p>
				{:else}
					<div class="divide-y divide-gray-100">
						{#each datos.clientes as c (c.id_cliente)}
							<div class="p-4 flex items-start justify-between gap-3">
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<span class="font-semibold text-sm text-on-surface">{c.nombre}</span>
										<span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
											★ {c.rating}
										</span>
									</div>
									<p class="text-xs text-on-surface-variant mt-0.5">{c.motivo}</p>
									<p class="text-[11px] text-on-surface-variant/70 mt-1">
										{c.pedidos} pedidos · {c.cancelaciones} cancelaciones
									</p>
								</div>
								<div class="flex gap-2 shrink-0">
									<button
										onclick={() => aprobar('cliente', c.id_cliente)}
										class="text-[11px] font-semibold text-green-700 border border-green-200 rounded-md px-2.5 py-1 hover:bg-green-50"
									>
										Aprobar
									</button>
									<button
										onclick={() => suspender('cliente', c.id_cliente)}
										class="text-[11px] font-semibold text-red-600 border border-red-200 rounded-md px-2.5 py-1 hover:bg-red-50"
									>
										Suspender
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<section class="bg-white rounded-2xl shadow-sm">
				<div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
					<h2 class="text-sm font-bold text-on-surface">Repartidores en revisión</h2>
					<span class="text-xs text-on-surface-variant">{datos.repartidores.length} usuarios</span>
				</div>
				{#if datos.repartidores.length === 0}
					<p class="text-xs text-on-surface-variant py-6 text-center">Sin repartidores en revisión</p>
				{:else}
					<div class="divide-y divide-gray-100">
						{#each datos.repartidores as r (r.id_repartidor)}
							<div class="p-4 flex items-start justify-between gap-3">
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<span class="font-semibold text-sm text-on-surface">{r.nombre}</span>
										<span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
											★ {r.rating}
										</span>
									</div>
									<p class="text-xs text-on-surface-variant mt-0.5">{r.motivo}</p>
									<p class="text-[11px] text-on-surface-variant/70 mt-1">
										{r.viajes} viajes · {r.rechazos} rechazos
									</p>
								</div>
								<div class="flex gap-2 shrink-0">
									<button
										onclick={() => aprobar('repartidor', r.id_repartidor)}
										class="text-[11px] font-semibold text-green-700 border border-green-200 rounded-md px-2.5 py-1 hover:bg-green-50"
									>
										Aprobar
									</button>
									<button
										onclick={() => suspender('repartidor', r.id_repartidor)}
										class="text-[11px] font-semibold text-red-600 border border-red-200 rounded-md px-2.5 py-1 hover:bg-red-50"
									>
										Suspender
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	</main>
</div>