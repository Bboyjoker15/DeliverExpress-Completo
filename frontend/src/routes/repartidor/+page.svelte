<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { sesion } from '$lib/stores/sesion.js';
	import { escuchar } from '$lib/ws.js';
	import { usd } from '$lib/formato.js';
	import { mostrarToast } from '$lib/toast.js';
	import EstadoBadge from '$lib/componentes/EstadoBadge.svelte';
	import Estrellas from '$lib/componentes/Estrellas.svelte';
	import Mapa from '$lib/componentes/MapaCoordinador.svelte';
	import {
		obtenerYoMock,
		obtenerOfertaPendienteMock,
		obtenerPedidoActualMock,
		responderOfertaMock,
		cambiarDisponibilidadMock,
		retirarPedidoMock,
		entregarPedidoMock,
		calificarClienteMock,
		enviarUbicacionMock
	} from '$lib/mock/repartidores.js';

	// ══════════════════════════════════════════════
	// ESTADO
	// ══════════════════════════════════════════════
	let yo = $state(null);
	let oferta = $state(null);
	let pedidoActual = $state(null);
	let cargando = $state(true);

	let segundosRestantes = $state(0);
	let intervalCountdown = null;

	let watchGeo = null;
	let intervalUbicacion = null;

	let mostrarCalificarCliente = $state(false);
	let estrellasCliente = $state(5);
	let comentarioCliente = $state('');

	// ══════════════════════════════════════════════
	// CARGA INICIAL
	// ══════════════════════════════════════════════
	async function cargarTodo() {
		cargando = true;
		try {
			yo = await obtenerYoMock();
			pedidoActual = await obtenerPedidoActualMock();
			oferta = await obtenerOfertaPendienteMock();
			if (oferta) iniciarCountdown(oferta.segundos_restantes);
		} catch (err) {
			mostrarToast('error', err.message || 'Error al cargar');
		} finally {
			cargando = false;
		}
	}

	onMount(() => {
		cargarTodo();
		iniciarEnvioUbicacion();
	});

	onDestroy(() => {
		if (intervalCountdown) clearInterval(intervalCountdown);
		if (watchGeo != null) navigator.geolocation.clearWatch(watchGeo);
		if (intervalUbicacion) clearInterval(intervalUbicacion);
	});

	// ══════════════════════════════════════════════
	// WEBSOCKET
	// ══════════════════════════════════════════════
	const offOferta = escuchar('oferta', async (datos) => {
		if (datos.id_repartidor !== yo?.id_repartidor) return;
		if (datos.respuesta && datos.respuesta !== 'pendiente') return;
		oferta = datos;
		iniciarCountdown(datos.segundos_restantes ?? 30);
		mostrarToast('info', '¡Nueva oferta de pedido!');
	});

	const offPedido = escuchar('pedido', async (datos) => {
		if (pedidoActual && datos.id_pedido === pedidoActual.id_pedido) {
			pedidoActual = await obtenerPedidoActualMock();
		}
	});

	// ══════════════════════════════════════════════
	// COUNTDOWN
	// ══════════════════════════════════════════════
	function iniciarCountdown(seg) {
		if (intervalCountdown) clearInterval(intervalCountdown);
		segundosRestantes = seg;
		intervalCountdown = setInterval(() => {
			segundosRestantes -= 1;
			if (segundosRestantes <= 0) {
				clearInterval(intervalCountdown);
				intervalCountdown = null;
				responderOferta('rechazada', true);
			}
		}, 1000);
	}

	// ══════════════════════════════════════════════
	// DISPONIBILIDAD
	// ══════════════════════════════════════════════
	async function toggleDisponibilidad() {
		if (!yo) return;
		const nuevo = yo.disponibilidad === 'libre' ? 'desconectado' : 'libre';
		try {
			await cambiarDisponibilidadMock(nuevo);
			yo.disponibilidad = nuevo;
			mostrarToast('exito', nuevo === 'libre' ? 'Estás disponible' : 'Te desconectaste');
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}

	// ══════════════════════════════════════════════
	// OFERTA
	// ══════════════════════════════════════════════
	async function responderOferta(respuesta, silencioso = false) {
		if (!oferta) return;
		try {
			await responderOfertaMock(oferta.id_oferta, respuesta);
			if (respuesta === 'aceptada') {
				pedidoActual = await obtenerPedidoActualMock();
				if (!silencioso) mostrarToast('exito', 'Oferta aceptada');
			} else if (!silencioso) {
				mostrarToast('info', 'Oferta rechazada');
			}
			oferta = null;
			if (intervalCountdown) {
				clearInterval(intervalCountdown);
				intervalCountdown = null;
			}
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}

	// ══════════════════════════════════════════════
	// PEDIDO ACTUAL
	// ══════════════════════════════════════════════
	async function retirar() {
		if (!pedidoActual) return;
		try {
			await retirarPedidoMock(pedidoActual.id_pedido);
			pedidoActual.estado = 'en_camino';
			mostrarToast('exito', 'Pedido retirado. ¡En camino!');
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}

	async function entregar() {
		if (!pedidoActual) return;
		try {
			await entregarPedidoMock(pedidoActual.id_pedido);
			pedidoActual.estado = 'entregado';
			mostrarCalificarCliente = true;
			mostrarToast('exito', '¡Pedido entregado!');
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}

	async function calificarCliente() {
		try {
			await calificarClienteMock(pedidoActual.id_pedido, estrellasCliente, comentarioCliente);
			mostrarToast('exito', 'Gracias por calificar');
			mostrarCalificarCliente = false;
			estrellasCliente = 5;
			comentarioCliente = '';
			setTimeout(() => {
				pedidoActual = null;
				yo.disponibilidad = 'libre';
			}, 800);
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}

	// ══════════════════════════════════════════════
	// UBICACIÓN
	// ══════════════════════════════════════════════
	function iniciarEnvioUbicacion() {
		if (!navigator.geolocation) return;

		watchGeo = navigator.geolocation.watchPosition(
			(pos) => {
				const { latitude, longitude } = pos.coords;
				enviarUbicacionMock(latitude, longitude).catch(() => {});
			},
			() => {},
			{ enableHighAccuracy: true, maximumAge: 5000 }
		);

		intervalUbicacion = setInterval(() => {
			if (!navigator.geolocation) return;
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					enviarUbicacionMock(pos.coords.latitude, pos.coords.longitude).catch(() => {});
				},
				() => {},
				{ enableHighAccuracy: true }
			);
		}, 10000);
	}

	// ══════════════════════════════════════════════
	// HELPERS
	// ══════════════════════════════════════════════
	let pedidoTotal = $derived(
		(pedidoActual?.costo_envio ?? 0) + (pedidoActual?.propina ?? 0)
	);

	let restaurantesMapa = $derived(
		pedidoActual?.restaurante
			? [
					{
						latitud: pedidoActual.restaurante.latitud,
						longitud: pedidoActual.restaurante.longitud,
						nombre: pedidoActual.restaurante.nombre,
						categoria: 'Recoger aquí'
					}
			  ]
			: []
	);

	let repartidoresMapa = $derived(
		pedidoActual?.repartidor
			? [
					{
						latitud_actual: pedidoActual.repartidor.latitud_actual,
						longitud_actual: pedidoActual.repartidor.longitud_actual,
						nombre: 'Tú',
						vehiculo: 'moto',
						zona: '',
						calificacion_promedio: 5,
						disponibilidad: 'ocupado'
					}
			  ]
			: []
	);
</script>

<svelte:head>
	<title>Panel Repartidor · DeliverExpress</title>
</svelte:head>

<div class="min-h-screen bg-surface">
	<main class="max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-5">

		{#if cargando}
			<div class="text-center py-16">
				<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
				<p class="text-sm text-on-surface-variant mt-3">Cargando...</p>
			</div>
		{:else}

			{#if yo?.prioridad === 'baja'}
				<div class="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
					<span class="material-symbols-outlined text-red-600 text-[24px] shrink-0">warning</span>
					<div>
						<p class="text-sm font-bold text-red-900">Tu prioridad bajó por rechazos</p>
						<p class="text-xs text-red-800 mt-1">
							Acepta más pedidos para recuperar tu prioridad y recibir mejores ofertas.
						</p>
					</div>
				</div>
			{/if}

			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-lg">
						{yo?.nombre?.charAt(0) ?? 'R'}
					</div>
					<div>
						<h1 class="text-lg font-bold text-on-surface">{yo?.nombre ?? 'Repartidor'}</h1>
						<div class="flex items-center gap-2 mt-0.5">
							<span class="flex items-center gap-1 text-xs text-on-surface-variant">
								<span class="material-symbols-outlined text-[14px] text-yellow-500">star</span>
								<span class="font-bold text-on-surface">{yo?.calificacion_promedio?.toFixed(1)}</span>
							</span>
							<span class="text-on-surface-variant/40">·</span>
							<span class="text-xs text-on-surface-variant capitalize">{yo?.vehiculo}</span>
							<span class="text-on-surface-variant/40">·</span>
							<span class="text-xs text-on-surface-variant">{yo?.zona}</span>
						</div>
					</div>
				</div>

				<button
					type="button"
					onclick={toggleDisponibilidad}
					class="flex items-center gap-3 pl-3 pr-4 py-2 rounded-full transition-colors w-full sm:w-auto justify-between sm:justify-start
						{yo?.disponibilidad === 'libre'
							? 'bg-green-50 border border-green-200'
							: 'bg-gray-100 border border-gray-200'}"
				>
					<div class="flex items-center gap-2">
						<span
							class="w-2.5 h-2.5 rounded-full
								{yo?.disponibilidad === 'libre' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}"
						></span>
						<span class="text-sm font-semibold {yo?.disponibilidad === 'libre' ? 'text-green-800' : 'text-gray-700'}">
							{yo?.disponibilidad === 'libre' ? 'Disponible' : 'Desconectado'}
						</span>
					</div>
					<div
						class="w-10 h-5.5 rounded-full relative transition-colors
							{yo?.disponibilidad === 'libre' ? 'bg-green-500' : 'bg-gray-300'}"
					>
						<div
							class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform
								{yo?.disponibilidad === 'libre' ? 'translate-x-5' : 'translate-x-0'}"
						></div>
					</div>
				</button>
			</section>

			<section class="grid grid-cols-2 gap-3">
				<div class="bg-white rounded-2xl shadow-sm p-4">
					<div class="flex items-center gap-2 text-on-surface-variant text-xs">
						<span class="material-symbols-outlined text-[16px]">route</span>
						<span>Viajes hoy</span>
					</div>
					<p class="text-2xl font-bold text-on-surface mt-1">{yo?.viajes_hoy ?? 0}</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm p-4">
					<div class="flex items-center gap-2 text-on-surface-variant text-xs">
						<span class="material-symbols-outlined text-[16px]">payments</span>
						<span>Ganado hoy</span>
					</div>
					<p class="text-2xl font-bold text-primary-container mt-1">{usd(yo?.ganancias_hoy ?? 0)}</p>
				</div>
			</section>

			{#if oferta}
				<section class="bg-gradient-to-br from-primary-container to-primary text-white rounded-2xl shadow-lg p-5 flex flex-col gap-4 relative overflow-hidden">
					<div class="absolute top-4 right-4 w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border-2 border-white/40">
						<span class="text-lg font-bold">{segundosRestantes}</span>
					</div>

					<div>
						<p class="text-xs uppercase tracking-wider opacity-80 font-semibold">Nueva oferta</p>
						<h2 class="text-lg font-bold mt-0.5">Pedido #{oferta.id_pedido}</h2>
					</div>

					<div class="flex flex-col gap-3 text-sm">
						<div class="flex items-start gap-2">
							<span class="material-symbols-outlined text-[18px] mt-0.5">storefront</span>
							<div>
								<div class="font-semibold">{oferta.restaurante.nombre}</div>
								<div class="text-xs opacity-80">{oferta.restaurante.direccion}</div>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<span class="material-symbols-outlined text-[18px] mt-0.5">location_on</span>
							<div>
								<div class="font-semibold">{oferta.cliente.direccion}</div>
								{#if oferta.cliente.referencia}
									<div class="text-xs opacity-80">{oferta.cliente.referencia}</div>
								{/if}
							</div>
						</div>
					</div>

					<div class="grid grid-cols-3 gap-2 bg-white/10 rounded-xl p-3 text-center">
						<div>
							<p class="text-[10px] uppercase opacity-75">Distancia</p>
							<p class="font-bold text-sm">{oferta.distancia_km} km</p>
						</div>
						<div>
							<p class="text-[10px] uppercase opacity-75">Envío</p>
							<p class="font-bold text-sm">{usd(oferta.costo_envio)}</p>
						</div>
						<div>
							<p class="text-[10px] uppercase opacity-75">+ Propina</p>
							<p class="font-bold text-sm">{usd(oferta.propina)}</p>
						</div>
					</div>

					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => responderOferta('rechazada')}
							class="flex-1 h-11 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition-colors"
						>
							Rechazar
						</button>
						<button
							type="button"
							onclick={() => responderOferta('aceptada')}
							class="flex-1 h-11 rounded-xl bg-white text-primary-container hover:bg-white/90 font-bold text-sm transition-colors"
						>
							Aceptar
						</button>
					</div>
				</section>
			{/if}

			{#if pedidoActual && pedidoActual.estado !== 'entregado'}
				<section class="bg-white rounded-2xl shadow-sm overflow-hidden">
					<div class="p-5 flex flex-col gap-4">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs text-on-surface-variant">Pedido actual</p>
								<h2 class="text-lg font-bold text-on-surface">#{pedidoActual.id_pedido}</h2>
							</div>
							<EstadoBadge codigo={pedidoActual.estado} />
						</div>

						<div class="flex flex-col gap-2 text-sm">
							<div class="flex items-start gap-2">
								<span class="material-symbols-outlined text-[18px] text-primary-container mt-0.5">storefront</span>
								<div>
									<div class="font-semibold text-on-surface">{pedidoActual.restaurante.nombre}</div>
									<div class="text-xs text-on-surface-variant">{pedidoActual.restaurante.direccion}</div>
								</div>
							</div>
							<div class="ml-2 border-l-2 border-dashed border-gray-300 h-3"></div>
							<div class="flex items-start gap-2">
								<span class="material-symbols-outlined text-[18px] text-purple-600 mt-0.5">location_on</span>
								<div>
									<div class="font-semibold text-on-surface">{pedidoActual.cliente.nombre}</div>
									<div class="text-xs text-on-surface-variant">{pedidoActual.cliente.direccion}</div>
									{#if pedidoActual.cliente.referencia}
										<div class="text-[11px] text-on-surface-variant/70 italic">{pedidoActual.cliente.referencia}</div>
									{/if}
								</div>
							</div>
						</div>

						<div class="rounded-xl overflow-hidden">
							<Mapa
								restaurantes={restaurantesMapa}
								repartidores={repartidoresMapa}
								pedidos={[]}
							/>
						</div>

						<div class="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2">
							<div class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
								{pedidoActual.productos.length} producto{pedidoActual.productos.length !== 1 ? 's' : ''}
							</div>
							{#each pedidoActual.productos as prod}
								<div class="text-sm text-on-surface">{prod.cantidad}x {prod.nombre}</div>
							{/each}
							<div class="flex items-center justify-between border-t border-gray-200 pt-2 mt-1">
								<span class="text-xs text-on-surface-variant">Tu ganancia</span>
								<span class="text-lg font-bold text-primary-container">{usd(pedidoTotal)}</span>
							</div>
						</div>

						{#if pedidoActual.estado === 'listo_para_retirar'}
							<button
								type="button"
								onclick={retirar}
								class="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
							>
								<span class="material-symbols-outlined text-[20px]">two_wheeler</span>
								Retiré el pedido
							</button>
						{:else if pedidoActual.estado === 'en_camino'}
							<button
								type="button"
								onclick={entregar}
								class="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
							>
								<span class="material-symbols-outlined text-[20px]">check_circle</span>
								Entregué el pedido
							</button>
						{/if}
					</div>
				</section>
			{:else if !oferta}
				<section class="bg-white rounded-2xl shadow-sm p-8 text-center">
					<div class="w-16 h-16 mx-auto rounded-full bg-surface-container-low flex items-center justify-center">
						<span class="material-symbols-outlined text-3xl text-on-surface-variant/60">inbox</span>
					</div>
					<h3 class="text-base font-bold text-on-surface mt-3">Sin pedidos asignados</h3>
					<p class="text-xs text-on-surface-variant mt-1">
						{yo?.disponibilidad === 'libre'
							? 'Esperando nueva oferta...'
							: 'Conéctate para recibir ofertas'}
					</p>
				</section>
			{/if}

			<section class="grid grid-cols-2 gap-3">
				<button
					type="button"
					onclick={() => goto('/repartidor/historial')}
					class="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow text-left"
				>
					<div class="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container shrink-0">
						<span class="material-symbols-outlined text-[20px]">history</span>
					</div>
					<div>
						<p class="text-sm font-bold text-on-surface">Historial</p>
						<p class="text-[11px] text-on-surface-variant">Pedidos completados</p>
					</div>
				</button>
				<button
					type="button"
					onclick={() => goto('/repartidor/liquidaciones')}
					class="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow text-left"
				>
					<div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 shrink-0">
						<span class="material-symbols-outlined text-[20px]">payments</span>
					</div>
					<div>
						<p class="text-sm font-bold text-on-surface">Liquidaciones</p>
						<p class="text-[11px] text-on-surface-variant">Pagos y periodos</p>
					</div>
				</button>
			</section>

		{/if}
	</main>

	{#if mostrarCalificarCliente}
		<div
			class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (mostrarCalificarCliente = false)}
		>
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
				<div class="text-center">
					<div class="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
						<span class="material-symbols-outlined text-green-700 text-[28px]">check_circle</span>
					</div>
					<h3 class="text-lg font-bold text-on-surface mt-3">¡Pedido entregado!</h3>
					<p class="text-xs text-on-surface-variant mt-1">
						¿Cómo calificas al cliente?
					</p>
				</div>

				<div class="flex justify-center py-2">
					<Estrellas bind:valor={estrellasCliente} tamaño="lg" />
				</div>

				<textarea
					bind:value={comentarioCliente}
					placeholder="Comentario opcional..."
					rows="3"
					class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container resize-none"
				></textarea>

				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => {
							mostrarCalificarCliente = false;
							pedidoActual = null;
							yo.disponibilidad = 'libre';
						}}
						class="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-on-surface-variant"
					>
						Omitir
					</button>
					<button
						type="button"
						onclick={calificarCliente}
						class="flex-1 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold"
					>
						Enviar
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>