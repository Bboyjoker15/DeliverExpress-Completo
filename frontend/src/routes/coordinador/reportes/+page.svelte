<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import { mostrarToast } from '$lib/toast.js';
	import { api } from '$lib/api.js';

	let pestana = $state('tiempos');
	let cargando = $state(true);
	let tiempos = $state([]);
	let restaurantes = $state([]);
	let repartidores = $state([]);
	let liquidacion = $state([]);

	onMount(async () => {
		try {
			[tiempos, restaurantes, repartidores, liquidacion] = await Promise.all([
				api('/api/coordinador/reportes/tiempos'),
				api('/api/coordinador/reportes/restaurantes'),
				api('/api/coordinador/reportes/repartidores'),
				api('/api/coordinador/reportes/liquidacion')
			]);
		} catch (err) {
			mostrarToast('error', err.message);
		} finally {
			cargando = false;
		}
	});

	// Promedios calculados en cliente sobre las filas de vw_tiempos_por_etapa
	function promedio(lista, campo) {
		if (!lista.length) return 0;
		return Math.round((lista.reduce((s, x) => s + (x[campo] ?? 0), 0) / lista.length) * 10) / 10;
	}

	let ordenRest = $state({ campo: 'ventas_productos', dir: 'desc' });

	function ordenarPor(lista, campo) {
		return [...lista].sort((a, b) =>
			ordenRest.dir === 'asc' ? (a[campo] > b[campo] ? 1 : -1) : (a[campo] < b[campo] ? 1 : -1)
		);
	}

	function toggleOrdenRest(campo) {
		ordenRest = { campo, dir: ordenRest.campo === campo && ordenRest.dir === 'desc' ? 'asc' : 'desc' };
	}

	let totalEnvios = $derived(liquidacion.reduce((s, l) => s + (l.envios ?? 0), 0));
	let totalPropinas = $derived(liquidacion.reduce((s, l) => s + (l.propinas ?? 0), 0));
	let totalComisiones = $derived(liquidacion.reduce((s, l) => s + (l.comision_plataforma ?? 0), 0));
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
		{:else if pestana === 'tiempos'}
			<section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Promedio total</p>
					<p class="text-3xl font-bold text-on-surface mt-1">{promedio(tiempos, 'min_total')} min</p>
					<p class="text-[11px] text-on-surface-variant mt-1">{tiempos.length} pedidos medidos</p>
				</div>
				<div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
					<h3 class="text-sm font-bold text-on-surface mb-3">Promedio por etapa</h3>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{#each [
							{ label: 'Espera restaurante', campo: 'min_espera_restaurante' },
							{ label: 'Preparación', campo: 'min_preparacion' },
							{ label: 'Espera retiro', campo: 'min_espera_retiro' },
							{ label: 'Entrega', campo: 'min_entrega' }
						] as e (e.campo)}
							<div class="bg-surface-container-low rounded-xl p-3">
								<p class="text-[11px] text-on-surface-variant">{e.label}</p>
								<p class="text-xl font-bold text-on-surface mt-1">{promedio(tiempos, e.campo)} min</p>
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
								<th class="py-2 px-3 text-right">Total</th>
								<th class="py-2 px-3 text-right">Espera rest.</th>
								<th class="py-2 px-3 text-right">Prep.</th>
								<th class="py-2 px-3 text-right">Espera retiro</th>
								<th class="py-2 px-3 text-right">Entrega</th>
							</tr>
						</thead>
						<tbody>
							{#each tiempos as p (p.id_pedido)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-semibold text-on-surface">#{p.id_pedido}</td>
									<td class="py-2 px-3 text-right font-bold">{p.min_total} min</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{p.min_espera_restaurante} min</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{p.min_preparacion} min</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{p.min_espera_retiro} min</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{p.min_entrega} min</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else if pestana === 'restaurantes'}
			<section class="bg-white rounded-2xl shadow-sm p-5">
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Restaurante</th>
								<th class="py-2 px-3">Categoría</th>
								<th class="py-2 px-3 text-right">Pedidos</th>
								<th class="py-2 px-3 text-right">Cancelados</th>
								<th class="py-2 px-3 text-right cursor-pointer hover:text-primary-container" onclick={() => toggleOrdenRest('ventas_productos')}>
									Ventas {ordenRest.campo === 'ventas_productos' ? (ordenRest.dir === 'desc' ? '↓' : '↑') : ''}
								</th>
								<th class="py-2 px-3 text-right">Prep. prom.</th>
								<th class="py-2 px-3 text-right">Rating</th>
							</tr>
						</thead>
						<tbody>
							{#each ordenarPor(restaurantes, ordenRest.campo) as r (r.id_restaurante)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-semibold text-on-surface">{r.restaurante}</td>
									<td class="py-2 px-3 text-on-surface-variant">{r.categoria}</td>
									<td class="py-2 px-3 text-right">{r.total_pedidos}</td>
									<td class="py-2 px-3 text-right {r.pedidos_cancelados > 0 ? 'text-red-600 font-bold' : ''}">{r.pedidos_cancelados}</td>
									<td class="py-2 px-3 text-right font-bold">{usd(r.ventas_productos)}</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{r.prom_min_preparacion ?? '—'}{r.prom_min_preparacion != null ? ' min' : ''}</td>
									<td class="py-2 px-3 text-right">★ {r.calificacion_promedio}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else if pestana === 'repartidores'}
			<section class="bg-white rounded-2xl shadow-sm p-5">
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Repartidor</th>
								<th class="py-2 px-3">Vehículo</th>
								<th class="py-2 px-3 text-right">Entregas</th>
								<th class="py-2 px-3 text-right">Entrega prom.</th>
								<th class="py-2 px-3 text-right">Ganancias</th>
								<th class="py-2 px-3 text-right">Rating</th>
								<th class="py-2 px-3 text-right">Rechazos</th>
							</tr>
						</thead>
						<tbody>
							{#each repartidores as r (r.id_repartidor)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-semibold text-on-surface">
										{r.repartidor}
										{#if r.en_revision}
											<span class="ml-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">revisión</span>
										{/if}
									</td>
									<td class="py-2 px-3 text-on-surface-variant capitalize">{r.tipo_vehiculo}</td>
									<td class="py-2 px-3 text-right">{r.entregas}</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{r.prom_min_entrega} min</td>
									<td class="py-2 px-3 text-right font-bold">{usd(r.ganancias)}</td>
									<td class="py-2 px-3 text-right">★ {r.calificacion_promedio}</td>
									<td class="py-2 px-3 text-right {r.tasa_rechazo >= 0.3 ? 'text-red-600 font-bold' : ''}">
										{r.ofertas_rechazadas}/{r.ofertas_recibidas}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else if pestana === 'liquidacion'}
			<section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Envíos</p>
					<p class="text-2xl font-bold text-on-surface mt-1">{usd(totalEnvios)}</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Propinas</p>
					<p class="text-2xl font-bold text-green-700 mt-1">{usd(totalPropinas)}</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Comisiones plataforma</p>
					<p class="text-2xl font-bold text-primary-container mt-1">{usd(totalComisiones)}</p>
				</div>
			</section>

			<section class="bg-white rounded-2xl shadow-sm p-5">
				<h3 class="text-sm font-bold text-on-surface mb-3">Detalle por día y restaurante</h3>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Fecha</th>
								<th class="py-2 px-3">Restaurante</th>
								<th class="py-2 px-3 text-right">Pedidos</th>
								<th class="py-2 px-3 text-right">Ventas</th>
								<th class="py-2 px-3 text-right">Comisión</th>
								<th class="py-2 px-3 text-right">Paga restaurante</th>
								<th class="py-2 px-3 text-right">Envíos</th>
								<th class="py-2 px-3 text-right">Propinas</th>
							</tr>
						</thead>
						<tbody>
							{#each liquidacion as l (`${l.fecha}-${l.id_restaurante}`)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 text-on-surface-variant">{l.fecha}</td>
									<td class="py-2 px-3 font-semibold text-on-surface">{l.restaurante}</td>
									<td class="py-2 px-3 text-right">{l.pedidos}</td>
									<td class="py-2 px-3 text-right">{usd(l.ventas_productos)}</td>
									<td class="py-2 px-3 text-right text-primary-container font-semibold">{usd(l.comision_plataforma)}</td>
									<td class="py-2 px-3 text-right font-bold">{usd(l.monto_restaurante)}</td>
									<td class="py-2 px-3 text-right">{usd(l.envios)}</td>
									<td class="py-2 px-3 text-right text-green-700">{usd(l.propinas)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	</main>
</div>
