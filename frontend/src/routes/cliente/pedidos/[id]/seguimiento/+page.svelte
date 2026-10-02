<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { obtenerPedidoPorId } from '$lib/stores/pedidos.js';
	import { escuchar } from '$lib/ws.js';
	import { mostrarToast } from '$lib/toast.js';
	import { RESTAURANTES_MAPA_DEMO } from '$lib/mock/repartidores.js';
	import EstadoBadge from '$lib/componentes/EstadoBadge.svelte';
	import LineaEstados from '$lib/componentes/LineaEstados.svelte';
	import MapaCoordinador from '$lib/componentes/MapaCoordinador.svelte';

	const idPedido = Number(page.params.id);
	const pedidoStore = obtenerPedidoPorId(idPedido);
	let pedido = $derived($pedidoStore);

	// Posición del repartidor en vivo (se mueve por WS "ubicacion")
	let repartidorPos = $state(null);

	// Cuando llegue el pedido, inicializamos la posición del repartidor
	$effect(() => {
		if (pedido?.repartidor && !repartidorPos) {
			repartidorPos = {
				latitud_actual: pedido.repartidor.latitud_actual ?? 8.29,
				longitud_actual: pedido.repartidor.longitud_actual ?? -62.715
			};
		}
	});

	// ══════════════════════════════════════════════
	// Marcadores para el mapa
	// ══════════════════════════════════════════════

	// Restaurante: buscar coordenadas por id
	let coordsRestaurante = $derived.by(() => {
		if (!pedido?.id_restaurante) return null;
		const r = RESTAURANTES_MAPA_DEMO.find((x) => x.id_restaurante === pedido.id_restaurante);
		return r
			? { latitud: r.latitud, longitud: r.longitud, nombre: r.nombre }
			: { latitud: 8.291, longitud: -62.715, nombre: pedido.nombre ?? 'Restaurante' };
	});

	// Cliente: coords fijas por pedido (mock) o default
	let coordsCliente = $derived({
		latitud: 8.283,
		longitud: -62.708,
		nombre: 'Tu dirección',
		direccion: pedido?.direccion_entrega ?? 'Destino de entrega'
	});

	let restaurantesMapa = $derived(
		coordsRestaurante
			? [
					{
						latitud: coordsRestaurante.latitud,
						longitud: coordsRestaurante.longitud,
						nombre: coordsRestaurante.nombre,
						categoria: 'Punto de recogida'
					}
			  ]
			: []
	);

	let clientesMapa = $derived([
		{
			latitud: coordsCliente.latitud,
			longitud: coordsCliente.longitud,
			nombre: 'Tú',
			direccion: coordsCliente.direccion
		}
	]);

	let repartidoresMapa = $derived(
		pedido?.repartidor && repartidorPos
			? [
					{
						latitud_actual: repartidorPos.latitud_actual,
						longitud_actual: repartidorPos.longitud_actual,
						nombre: pedido.repartidor.nombre,
						vehiculo: pedido.repartidor.tipo_vehiculo ?? 'moto',
						zona: 'En camino',
						calificacion_promedio: pedido.repartidor.calificacion_promedio ?? 5,
						disponibilidad: 'ocupado'
					}
			  ]
			: []
	);

	// ══════════════════════════════════════════════
	// WEBSOCKET
	// ══════════════════════════════════════════════

	// WS "pedido" → recargar el pedido (aquí solo notificamos)
	const offPedido = escuchar('pedido', (datos) => {
		if (datos?.id_pedido !== idPedido) return;
		mostrarToast('info', 'El estado del pedido cambió');
	});

	// WS "ubicacion" → mover el repartidor en el mapa
	const offUbicacion = escuchar('ubicacion', (datos) => {
		if (datos?.id_pedido !== idPedido) return;
		if (typeof datos.lat !== 'number' || typeof datos.lon !== 'number') return;
		repartidorPos = {
			latitud_actual: datos.lat,
			longitud_actual: datos.lon
		};
	});

	onDestroy(() => {
		offPedido();
		offUbicacion();
	});
</script>

<svelte:head>
	<title>Seguimiento · Pedido #{idPedido}</title>
</svelte:head>

<div class="min-h-screen bg-surface">
	<div class="max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-4">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-xs text-on-surface-variant">
			<a href="/cliente/pedidos" class="hover:text-primary-container transition-colors">Mis Pedidos</a>
			<span class="material-symbols-outlined text-[14px]">chevron_right</span>
			<a href="/cliente/pedidos/{idPedido}" class="hover:text-primary-container transition-colors">
				Pedido #{idPedido}
			</a>
			<span class="material-symbols-outlined text-[14px]">chevron_right</span>
			<span class="text-on-surface font-semibold">Seguimiento</span>
		</nav>

		{#if !pedido}
			<div class="bg-white rounded-xl p-8 text-center">
				<span class="material-symbols-outlined text-5xl text-on-surface-variant/40">error</span>
				<p class="text-on-surface mt-3">Pedido no encontrado</p>
			</div>
		{:else}
			<!-- Header -->
			<article class="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between gap-3">
				<div class="flex items-center gap-3 min-w-0">
					<h1 class="text-lg font-bold text-on-surface">Pedido #{idPedido}</h1>
					<EstadoBadge codigo={pedido.estado_codigo} />
				</div>
				<button
					onclick={() => goto(`/cliente/pedidos/${idPedido}`)}
					class="text-xs font-semibold text-primary-container hover:underline shrink-0"
				>
					Ver detalle
				</button>
			</article>

			<!-- Mapa en vivo -->
			<article class="bg-white rounded-xl shadow-sm p-4">
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-2">
						<span class="material-symbols-outlined text-primary-container text-[20px]">location_searching</span>
						<h2 class="text-sm font-bold text-on-surface">Mapa en vivo</h2>
					</div>
					{#if pedido.repartidor}
						<span class="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
							<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
							En movimiento
						</span>
					{/if}
				</div>

				<MapaCoordinador
					restaurantes={restaurantesMapa}
					clientes={clientesMapa}
					repartidores={repartidoresMapa}
					pedidos={[]}
				/>
			</article>

			<!-- Línea de estados -->
			{#if pedido.historial}
				<article class="bg-white rounded-xl p-5 shadow-sm">
					<h2 class="text-sm font-bold text-on-surface mb-3">Estado del pedido</h2>
					<LineaEstados historial={pedido.historial} estadoActual={pedido.estado_codigo} />
				</article>
			{/if}

			<!-- Info del pedido -->
			<article class="bg-white rounded-xl p-5 shadow-sm">
				<h2 class="text-sm font-bold text-on-surface mb-3">Información</h2>
				<div class="flex flex-col gap-2 text-sm">
					<div class="flex justify-between">
						<span class="text-on-surface-variant">Restaurante</span>
						<span class="font-semibold text-on-surface">{pedido.nombre}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-on-surface-variant">Tiempo estimado</span>
						<span class="font-semibold text-on-surface">{pedido.tiempo_estimado_min} min</span>
					</div>
					<div class="flex justify-between">
						<span class="text-on-surface-variant">Distancia</span>
						<span class="font-semibold text-on-surface">{pedido.distancia_km} km</span>
					</div>
					{#if pedido.repartidor}
						<div class="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
							<span class="text-on-surface-variant">Repartidor</span>
							<span class="inline-flex items-center gap-2">
								<span class="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container text-[10px] font-bold">
									{pedido.repartidor.nombre?.charAt(0) || 'R'}
								</span>
								<span class="font-semibold text-on-surface">{pedido.repartidor.nombre}</span>
							</span>
						</div>
					{/if}
				</div>
			</article>
		{/if}
	</div>
</div>