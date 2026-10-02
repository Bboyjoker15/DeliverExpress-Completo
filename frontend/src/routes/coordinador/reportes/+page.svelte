<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import {
		obtenerReporteTiemposMock,
		obtenerReporteRestaurantesMock,
		obtenerReporteRepartidoresMock,
		obtenerReporteLiquidacionMock
	} from '$lib/mock/coordinadores.js';

	let pestana = $state('tiempos');
	let cargando = $state(true);
	let tiempos = $state(null);
	let restaurantes = $state(null);
	let repartidores = $state(null);
	let liquidacion = $state(null);

	onMount(async () => {
		try {
			[tiempos, restaurantes, repartidores, liquidacion] = await Promise.all([
				obtenerReporteTiemposMock(),
				obtenerReporteRestaurantesMock(),
				obtenerReporteRepartidoresMock(),
				obtenerReporteLiquidacionMock()
			]);
		} finally {
			cargando = false;
		}
	});

	let ordenRest = $state({ campo: 'ingresos', dir: 'desc' });

	function ordenarPor(lista, campo) {
		return [...lista].sort((a, b) =>
			ordenRest.dir === 'asc' ? (a[campo] > b[campo] ? 1 : -1) : (a[campo] < b[campo] ? 1 : -1)
		);
	}

	function toggleOrdenRest(campo) {
		ordenRest = { campo, dir: ordenRest.campo === campo && ordenRest.dir === 'desc' ? 'asc' : 'desc' };
	}
</script>

<svelte:head><title>Reportes · Coordinador</title></svelte:head>

<div class="min-h-screen bg-surface">
	<main class="max-w-[1400px] mx-auto px-4 py-5 flex flex-col gap-5">

		<button
			type="button"
			onclick={() => goto('/coordinador')}
			class="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary-container self-start"
		>
			<span class="material-symbols-outlined text-[20px]">arrow_back</span>
			Volver al panel
		</button>

		<section class="bg-white rounded-2xl shadow-sm p-5">
			<h1 class="text-lg font-bold text-on-surface">Reportes</h1>
			<p class="text-xs text-on-surface-variant mt-0.5">Análisis operativo y financiero</p>
		</section>

		<div class="flex gap-2 border-b border-gray-200 overflow-x-auto">
			{#each [
				{ id: 'tiempos', label: 'Tiempos' },
				{ id: 'restaurantes', label: 'Restaurantes' },
				{ id: 'repartidores', label: 'Repartidores' },
				{ id: 'liquidacion', label: 'Liquidación' }
			] as tab (tab.id)}
				<button
					onclick={() => (pestana = tab.id)}
					class="px-4 py-2 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap
						{pestana === tab.id
							? 'border-primary-container text-primary-container'
							: 'border-transparent text-on-surface-variant hover:text-on-surface'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if cargando}
			<div class="text-center py-16">
				<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
			</div>
		{:else if pestana === 'tiempos' && tiempos}
			<section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Promedio total</p>
					<p class="text-3xl font-bold text-on-surface mt-1">{tiempos.promedio_total_min} min</p>
				</div>
				<div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
					<h3 class="text-sm font-bold text-on-surface mb-3">Promedio por estado</h3>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{#each tiempos.por_estado as e (e.estado)}
							<div class="bg-surface-container-low rounded-xl p-3">
								<p class="text-[11px] text-on-surface-variant">{e.estado}</p>
								<p class="text-xl font-bold text-on-surface mt-1">{e.promedio_min} min</p>
								<p class="text-[10px] text-on-surface-variant">{e.total} pedidos</p>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<section class="bg-white rounded-2xl shadow-sm p-5">
				<h3 class="text-sm font-bold text-on-surface mb-3">Detalle por pedido</h3>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Pedido</th>
								<th class="py-2 px-3">Restaurante</th>
								<th class="py-2 px-3 text-right">Total</th>
								<th class="py-2 px-3 text-right">Prep.</th>
								<th class="py-2 px-3 text-right">Entrega</th>
							</tr>
						</thead>
						<tbody>
							{#each tiempos.pedidos as p (p.id_pedido)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-semibold text-on-surface">#{p.id_pedido}</td>
									<td class="py-2 px-3 text-on-surface-variant">{p.restaurante}</td>
									<td class="py-2 px-3 text-right font-bold">{p.tiempo_total_min} min</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{p.tiempo_prep_min} min</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{p.tiempo_entrega_min} min</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else if pestana === 'restaurantes' && restaurantes}
			<section class="bg-white rounded-2xl shadow-sm p-5">
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Restaurante</th>
								<th class="py-2 px-3 text-right">Pedidos</th>
								<th class="py-2 px-3 text-right cursor-pointer hover:text-primary-container" onclick={() => toggleOrdenRest('ingresos')}>
									Ingresos {ordenRest.campo === 'ingresos' ? (ordenRest.dir === 'desc' ? '↓' : '↑') : ''}
								</th>
								<th class="py-2 px-3 text-right">Comisión</th>
								<th class="py-2 px-3 text-right">Tiempo prom.</th>
								<th class="py-2 px-3 text-right">Rating</th>
							</tr>
						</thead>
						<tbody>
							{#each ordenarPor(restaurantes, ordenRest.campo) as r (r.id_restaurante)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-semibold text-on-surface">{r.nombre}</td>
									<td class="py-2 px-3 text-right">{r.pedidos}</td>
									<td class="py-2 px-3 text-right font-bold">{usd(r.ingresos)}</td>
									<td class="py-2 px-3 text-right text-primary-container font-semibold">{usd(r.comision)}</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{r.tiempo_promedio_min} min</td>
									<td class="py-2 px-3 text-right">★ {r.rating}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else if pestana === 'repartidores' && repartidores}
			<section class="bg-white rounded-2xl shadow-sm p-5">
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Repartidor</th>
								<th class="py-2 px-3 text-right">Viajes</th>
								<th class="py-2 px-3 text-right">Ganancias</th>
								<th class="py-2 px-3 text-right">Propinas</th>
								<th class="py-2 px-3 text-right">Rating</th>
								<th class="py-2 px-3 text-right">Rechazos</th>
							</tr>
						</thead>
						<tbody>
							{#each repartidores as r (r.id_repartidor)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-semibold text-on-surface">{r.nombre}</td>
									<td class="py-2 px-3 text-right">{r.viajes}</td>
									<td class="py-2 px-3 text-right font-bold">{usd(r.ganancias)}</td>
									<td class="py-2 px-3 text-right text-green-700">{usd(r.propinas)}</td>
									<td class="py-2 px-3 text-right">★ {r.rating}</td>
									<td class="py-2 px-3 text-right {r.rechazos > 2 ? 'text-red-600 font-bold' : ''}">{r.rechazos}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else if pestana === 'liquidacion' && liquidacion}
			<section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Envíos</p>
					<p class="text-2xl font-bold text-on-surface mt-1">{usd(liquidacion.total_envios)}</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Propinas</p>
					<p class="text-2xl font-bold text-green-700 mt-1">{usd(liquidacion.total_propinas)}</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Comisiones</p>
					<p class="text-2xl font-bold text-primary-container mt-1">{usd(liquidacion.total_comisiones)}</p>
				</div>
			</section>

			<section class="bg-white rounded-2xl shadow-sm p-5">
				<h3 class="text-sm font-bold text-on-surface mb-3">Detalle por repartidor · {liquidacion.periodo}</h3>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Repartidor</th>
								<th class="py-2 px-3 text-right">Viajes</th>
								<th class="py-2 px-3 text-right">Envíos</th>
								<th class="py-2 px-3 text-right">Propinas</th>
								<th class="py-2 px-3 text-right">Total</th>
							</tr>
						</thead>
						<tbody>
							{#each liquidacion.liquidaciones as l (l.id_repartidor)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-semibold text-on-surface">{l.nombre}</td>
									<td class="py-2 px-3 text-right">{l.viajes}</td>
									<td class="py-2 px-3 text-right">{usd(l.envios)}</td>
									<td class="py-2 px-3 text-right text-green-700">{usd(l.propinas)}</td>
									<td class="py-2 px-3 text-right font-bold text-primary-container">{usd(l.total)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	</main>
</div>