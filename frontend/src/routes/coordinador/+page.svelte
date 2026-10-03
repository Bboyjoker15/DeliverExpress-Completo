<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { sesion } from '$lib/stores/sesion.js';
	import { escuchar } from '$lib/ws.js';
	import { usd } from '$lib/formato.js';
	import { mostrarToast } from '$lib/toast.js';
	import { api } from '$lib/api.js';
	import EstadoBadge from '$lib/componentes/EstadoBadge.svelte';
	import MapaCoordinador from '$lib/componentes/MapaCoordinador.svelte';

	let pedidosActivos = $state([]);
	let repartidores = $state([]);

	// vw_pedidos_activos ya solo trae restaurantes con pedidos en curso.
	let restaurantesMapa = $derived.by(() => {
		const vistos = new Map();
		for (const p of pedidosActivos) {
			if (!vistos.has(p.id_restaurante)) {
				vistos.set(p.id_restaurante, {
					latitud: p.restaurante_lat,
					longitud: p.restaurante_lon,
					nombre: p.restaurante,
					categoria: 'Pedidos activos'
				});
			}
		}
		return [...vistos.values()];
	});

	let repartidoresMapa = $derived(
		repartidores.map((r) => ({
			latitud_actual: r.latitud_actual,
			longitud_actual: r.longitud_actual,
			nombre: r.nombre,
			vehiculo: r.tipo_vehiculo,
			zona: r.zona,
			calificacion_promedio: r.calificacion_promedio,
			disponibilidad: r.disponibilidad
		}))
	);

	let repartidoresLibres = $derived(repartidores.filter((r) => r.disponibilidad === 'libre'));
	let repartidoresOcupados = $derived(repartidores.filter((r) => r.disponibilidad === 'ocupado'));
	let tiempoPromedio = $derived(
		Math.round(
			pedidosActivos.reduce((s, p) => s + (p.tiempo_estimado_min || 0), 0) /
				(pedidosActivos.length || 1)
		)
	);
	let pedidosAtrasados = $derived(pedidosActivos.filter((p) => estaAtrasado(p)).length);
	let pedidosSinRepartidor = $derived(pedidosActivos.filter((p) => sinRepartidor(p)).length);

	function iniciales(nombre) {
		return (nombre || '')
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0])
			.join('')
			.toUpperCase();
	}

	let reasignarAbierto = $state(false);
	let pedidoAReasignar = $state(null);
	let repartidorSeleccionado = $state(null);

	let cancelarAbierto = $state(false);
	let pedidoACancelar = $state(null);
	let motivoCancelacion = $state('');

	let detalleAbierto = $state(false);
	let pedidoDetalle = $state(null);

	// ══════════════════════════════════════════════
	// HELPERS
	// ══════════════════════════════════════════════
	function estaAtrasado(p) {
		const tiempoPrep = p.tiempo_prep_min ?? 15;
		const tiempoEst = p.tiempo_estimado_min ?? 30;

		if (p.estado_codigo === 'recibido' && p.minutos_en_estado > 10) return true;
		if (p.estado_codigo === 'en_preparacion' && p.minutos_en_estado > tiempoPrep) return true;
		if (p.estado_codigo === 'en_camino' && p.minutos_desde_creacion > tiempoEst) return true;
		return false;
	}

	function sinRepartidor(p) {
		return !p.id_repartidor && (p.estado_codigo === 'en_preparacion' || p.estado_codigo === 'listo_para_retirar');
	}

	// ══════════════════════════════════════════════
	// CARGA
	// ══════════════════════════════════════════════
	async function recargarPedidos() {
		pedidosActivos = await api('/api/coordinador/pedidos-activos');
	}

	async function recargarRepartidores() {
		repartidores = await api('/api/coordinador/repartidores');
	}

	onMount(() => {
		recargarPedidos();
		recargarRepartidores();
	});

	// ══════════════════════════════════════════════
	// WEBSOCKET
	// ══════════════════════════════════════════════
	const offPedido = escuchar('pedido', () => recargarPedidos());
	const offUbicacion = escuchar('ubicacion', (datos) => {
		if (!datos?.id_repartidor) return;
		repartidores = repartidores.map((r) =>
			r.id_repartidor === datos.id_repartidor
				? { ...r, latitud_actual: datos.latitud, longitud_actual: datos.longitud }
				: r
		);
	});
	const offOferta = escuchar('oferta', () => recargarPedidos());

	onDestroy(() => {
		offPedido();
		offUbicacion();
		offOferta();
	});

	// ══════════════════════════════════════════════
	// FULLSCREEN
	// ══════════════════════════════════════════════
	let esFullscreen = $state(false);

	async function toggleFullscreen() {
		try {
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen();
				esFullscreen = true;
			} else {
				await document.exitFullscreen();
				esFullscreen = false;
			}
		} catch {
			mostrarToast('error', 'No se pudo activar pantalla completa');
		}
	}

	function onFullscreenChange() {
		esFullscreen = !!document.fullscreenElement;
	}

	onMount(() => {
		document.addEventListener('fullscreenchange', onFullscreenChange);
	});

	// ══════════════════════════════════════════════
	// DETALLE
	// ══════════════════════════════════════════════
	async function abrirDetalle(p) {
		detalleAbierto = true;
		pedidoDetalle = null;
		try {
			pedidoDetalle = await api(`/api/coordinador/pedidos/${p.id_pedido}`);
		} catch (err) {
			mostrarToast('error', err.message);
			detalleAbierto = false;
		}
	}

	// ══════════════════════════════════════════════
	// REASIGNAR
	// ══════════════════════════════════════════════
	function abrirReasignar(p) {
		pedidoAReasignar = p;
		repartidorSeleccionado = null;
		reasignarAbierto = true;
	}

	async function confirmarReasignar() {
		if (!repartidorSeleccionado || !pedidoAReasignar) return;
		try {
			await api(`/api/coordinador/pedidos/${pedidoAReasignar.id_pedido}/reasignar`, {
				metodo: 'POST',
				cuerpo: { id_repartidor: repartidorSeleccionado.id_repartidor }
			});
			await Promise.all([recargarPedidos(), recargarRepartidores()]);
			mostrarToast('exito', 'Pedido reasignado');
			reasignarAbierto = false;
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}

	// ══════════════════════════════════════════════
	// CANCELAR
	// ══════════════════════════════════════════════
	function abrirCancelar(p) {
		pedidoACancelar = p;
		motivoCancelacion = '';
		cancelarAbierto = true;
	}

	async function confirmarCancelar() {
		if (!pedidoACancelar) return;
		if (!motivoCancelacion.trim()) {
			mostrarToast('error', 'Escribe el motivo de cancelación');
			return;
		}
		try {
			await api(`/api/coordinador/pedidos/${pedidoACancelar.id_pedido}/cancelar`, {
				metodo: 'POST',
				cuerpo: { motivo: motivoCancelacion.trim() }
			});
			await Promise.all([recargarPedidos(), recargarRepartidores()]);
			mostrarToast('exito', 'Pedido cancelado');
			cancelarAbierto = false;
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}
</script>

<svelte:head>
	<title>Coordinador · DeliverExpress</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- ══════════════════════════════════════════════
	     HERO / HEADER
	     ══════════════════════════════════════════════ -->
	<div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
		<div class="max-w-[1600px] mx-auto px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center">
					<span class="material-symbols-outlined text-white text-[22px]">dashboard</span>
				</div>
				<div>
					<h1 class="text-xl font-bold tracking-tight">Centro de Control</h1>
					<p class="text-xs text-slate-400 mt-0.5">
						{$sesion.nombre || 'Coordinador'} · {new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2 flex-wrap">
				<div class="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full">
					<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
					<span class="text-xs font-semibold text-emerald-300">En vivo</span>
				</div>
				<button
					type="button"
					onclick={toggleFullscreen}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors"
				>
					<span class="material-symbols-outlined text-[16px]">
						{esFullscreen ? 'fullscreen_exit' : 'fullscreen'}
					</span>
					{esFullscreen ? 'Salir' : 'Pantalla completa'}
				</button>
				<button
					type="button"
					onclick={() => goto('/coordinador/reportes')}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors"
				>
					<span class="material-symbols-outlined text-[16px]">insights</span>
					Reportes
				</button>
				<button
					type="button"
					onclick={() => goto('/coordinador/facturacion')}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors"
				>
					<span class="material-symbols-outlined text-[16px]">receipt_long</span>
					Facturación
				</button>
			</div>
		</div>

		<!-- ═══════ KPIs DENTRO DEL HERO ═══════ -->
		<div class="max-w-[1600px] mx-auto px-6 pb-6">
			<div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
				<!-- Pedidos activos -->
				<button
					type="button"
					onclick={() => document.getElementById('lista-pedidos')?.scrollIntoView({ behavior: 'smooth' })}
					class="text-left bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 transition-colors group"
				>
					<div class="flex items-center justify-between">
						<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pedidos activos</span>
						<span class="material-symbols-outlined text-white/40 text-[18px] group-hover:text-white/70 transition-colors">receipt_long</span>
					</div>
					<p class="text-3xl font-black text-white mt-2 leading-none">{pedidosActivos.length}</p>
					<p class="text-[11px] text-slate-400 mt-1">en curso ahora</p>
				</button>

				<!-- Atrasados -->
				<div class="text-left bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
					<div class="flex items-center justify-between">
						<span class="text-[10px] uppercase tracking-widest text-red-300 font-bold">Atrasados</span>
						<span class="material-symbols-outlined text-red-300/70 text-[18px]">warning</span>
					</div>
					<p class="text-3xl font-black text-red-300 mt-2 leading-none">{pedidosAtrasados}</p>
					<p class="text-[11px] text-red-300/70 mt-1">requieren atención</p>
				</div>

				<!-- Sin repartidor -->
				<div class="text-left bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
					<div class="flex items-center justify-between">
						<span class="text-[10px] uppercase tracking-widest text-amber-300 font-bold">Sin repartidor</span>
						<span class="material-symbols-outlined text-amber-300/70 text-[18px]">person_alert</span>
					</div>
					<p class="text-3xl font-black text-amber-300 mt-2 leading-none">{pedidosSinRepartidor}</p>
					<p class="text-[11px] text-amber-300/70 mt-1">por asignar</p>
				</div>

				<!-- Repartidores -->
				<button
					type="button"
					onclick={() => document.getElementById('lista-repartidores')?.scrollIntoView({ behavior: 'smooth' })}
					class="text-left bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 transition-colors group"
				>
					<div class="flex items-center justify-between">
						<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Repartidores</span>
						<span class="material-symbols-outlined text-white/40 text-[18px] group-hover:text-white/70 transition-colors">two_wheeler</span>
					</div>
					<p class="text-3xl font-black text-white mt-2 leading-none">{repartidores.length}</p>
					<p class="text-[11px] mt-1">
						<span class="text-emerald-400 font-semibold">{repartidoresLibres.length} libres</span>
						<span class="text-slate-500 mx-1">·</span>
						<span class="text-slate-400">{repartidoresOcupados.length} ocupados</span>
					</p>
				</button>

				<!-- Tiempo promedio -->
				<div class="text-left bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
					<div class="flex items-center justify-between">
						<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Tiempo prom.</span>
						<span class="material-symbols-outlined text-white/40 text-[18px]">schedule</span>
					</div>
					<p class="text-3xl font-black text-white mt-2 leading-none">
						{tiempoPromedio}<span class="text-base font-semibold text-slate-400 ml-1">min</span>
					</p>
					<p class="text-[11px] text-slate-400 mt-1">por entrega</p>
				</div>
			</div>
		</div>
	</div>

	<!-- ══════════════════════════════════════════════
	     CONTENIDO PRINCIPAL
	     ══════════════════════════════════════════════ -->
	<main class="max-w-[1600px] mx-auto px-6 py-6">
		<div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

			<!-- ═══════ MAPA GRANDE ═══════ -->
			<div class="xl:col-span-2 flex flex-col gap-4">
				<div class="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
					<div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-primary-container text-[20px]">map</span>
							<h2 class="text-sm font-bold text-slate-900">Mapa en vivo</h2>
							<span class="text-[11px] text-slate-400">·</span>
							<span class="text-[11px] text-slate-500">
								{repartidores.length} repartidores · {pedidosActivos.length} pedidos · {restaurantesMapa.length} restaurantes
							</span>
						</div>
					</div>
					<div class="p-3">
						<MapaCoordinador
							restaurantes={restaurantesMapa}
							repartidores={repartidoresMapa}
							pedidos={[]}
						/>
					</div>
				</div>

				<!-- Repartidores (debajo del mapa en desktop) -->
				<div id="lista-repartidores" class="bg-white rounded-2xl shadow-sm border border-slate-200/60">
					<div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-blue-600 text-[20px]">two_wheeler</span>
							<h2 class="text-sm font-bold text-slate-900">Repartidores</h2>
						</div>
						<div class="flex items-center gap-2 text-[11px]">
							<span class="flex items-center gap-1">
								<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
								<span class="text-slate-600 font-semibold">{repartidoresLibres.length} libres</span>
							</span>
							<span class="flex items-center gap-1">
								<span class="w-2 h-2 rounded-full bg-slate-400"></span>
								<span class="text-slate-500">{repartidoresOcupados.length} ocupados</span>
							</span>
						</div>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-4 max-h-[320px] overflow-y-auto">
						{#each repartidores as r (r.id_repartidor)}
							<div class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
								<div class="relative shrink-0">
									<div class="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-[11px]">
										{iniciales(r.nombre)}
									</div>
									<span
										class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
											{r.disponibilidad === 'libre' ? 'bg-emerald-500' : 'bg-slate-400'}"
									></span>
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-xs font-semibold text-slate-900 truncate leading-tight">{r.nombre}</div>
									<div class="flex items-center gap-1 mt-0.5">
										<span class="material-symbols-outlined text-[11px] text-amber-400" style="font-variation-settings:'FILL' 1;">star</span>
										<span class="text-[10px] font-bold text-slate-600">{r.calificacion_promedio}</span>
										<span class="text-[10px] text-slate-400 capitalize truncate">· {r.tipo_vehiculo}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- ═══════ SIDEBAR: PEDIDOS ═══════ -->
			<aside id="lista-pedidos" class="flex flex-col gap-4">
				<div class="bg-white rounded-2xl shadow-sm border border-slate-200/60 flex flex-col overflow-hidden">
					<div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-primary-container text-[20px]">list_alt</span>
							<h2 class="text-sm font-bold text-slate-900">Pedidos activos</h2>
						</div>
						<div class="flex items-center gap-1.5">
							{#if pedidosAtrasados > 0}
								<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
									{pedidosAtrasados} atrasados
								</span>
							{/if}
							<span class="text-[11px] font-bold text-primary-container">{pedidosActivos.length}</span>
						</div>
					</div>

					{#if pedidosActivos.length === 0}
						<div class="py-12 text-center">
							<div class="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
								<span class="material-symbols-outlined text-slate-400 text-[26px]">inbox</span>
							</div>
							<p class="text-xs text-slate-500 mt-3 font-medium">Sin pedidos activos</p>
							<p class="text-[10px] text-slate-400 mt-0.5">Los pedidos aparecerán aquí</p>
						</div>
					{:else}
						<div class="flex flex-col max-h-[600px] overflow-y-auto">
							{#each pedidosActivos as p (p.id_pedido)}
								{@const atrasado = estaAtrasado(p)}
								{@const sinRep = sinRepartidor(p)}
								<article
									class="p-4 flex flex-col gap-2.5 border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors
										{atrasado
											? 'bg-red-50/60 hover:bg-red-50 border-l-4 border-l-red-500'
											: 'hover:bg-slate-50 border-l-4 border-l-transparent'}"
									onclick={() => abrirDetalle(p)}
									role="button"
									tabindex="0"
									onkeydown={(e) => e.key === 'Enter' && abrirDetalle(p)}
								>
									<!-- Header -->
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 min-w-0">
											<span class="text-xs font-black text-slate-900 shrink-0">#{p.id_pedido}</span>
											<EstadoBadge codigo={p.estado_codigo} />
										</div>
										{#if atrasado}
											<span class="material-symbols-outlined text-red-500 text-[16px] shrink-0" title="Atrasado">warning</span>
										{/if}
									</div>

									<!-- Restaurante -->
									<div class="flex items-center gap-1.5 text-xs">
										<span class="material-symbols-outlined text-[14px] text-primary-container">storefront</span>
										<span class="text-slate-700 font-medium truncate">{p.restaurante || '—'}</span>
									</div>

									<!-- Cliente -->
									<div class="flex items-center gap-1.5 text-xs">
										<span class="material-symbols-outlined text-[14px] text-slate-400">person</span>
										<span class="text-slate-500 truncate">{p.cliente || '—'}</span>
									</div>

									<!-- Repartidor -->
									{#if p.id_repartidor}
										<div class="flex items-center gap-1.5 text-xs">
											<span class="material-symbols-outlined text-[14px] text-purple-600">two_wheeler</span>
											<span class="text-purple-700 font-medium truncate">{p.repartidor}</span>
										</div>
									{/if}

									<!-- Avisos -->
									{#if sinRep}
										<span class="self-start bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
											SIN REPARTIDOR
										</span>
									{/if}

									{#if atrasado}
										<span class="text-[10px] text-red-700 font-bold flex items-center gap-1">
											<span class="material-symbols-outlined text-[12px]">schedule</span>
											{p.minutos_en_estado} min en este estado
										</span>
									{/if}

									<!-- Footer con acciones -->
									<div class="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
										<span class="text-[10px] text-slate-400 flex items-center gap-1">
											<span class="material-symbols-outlined text-[12px]">schedule</span>
											{p.tiempo_estimado_min} min
										</span>
										<div class="flex gap-1" onclick={(e) => e.stopPropagation()}>
											<button
												onclick={() => abrirReasignar(p)}
												class="text-[10px] font-bold text-primary-container border border-primary-container/30 rounded-md px-2 py-1 hover:bg-primary-fixed/30 transition-colors"
											>
												Reasignar
											</button>
											<button
												onclick={() => abrirCancelar(p)}
												class="text-[10px] font-bold text-red-600 border border-red-200 rounded-md px-2 py-1 hover:bg-red-50 transition-colors"
											>
												Cancelar
											</button>
										</div>
									</div>
								</article>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Revisión accesos -->
				<button
					onclick={() => goto('/coordinador/revision')}
					class="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex items-center gap-3 hover:border-amber-300 hover:bg-amber-50/30 transition-colors text-left"
				>
					<div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
						<span class="material-symbols-outlined text-[20px]">gavel</span>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-bold text-slate-900">Revisión de usuarios</p>
						<p class="text-[11px] text-slate-500">Clientes y repartidores con incidencias</p>
					</div>
					<span class="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
				</button>
			</aside>
		</div>
	</main>

	<!-- ══════════════════════════════════════════════
	     MODAL DETALLE
	     ══════════════════════════════════════════════ -->
	{#if detalleAbierto}
		<div
			class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (detalleAbierto = false)}
		>
			<div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
			{#if !pedidoDetalle}
				<div class="p-10 text-center">
					<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
				</div>
			{:else}
				<!-- Header -->
				<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<h3 class="text-base font-bold text-slate-900">Pedido #{pedidoDetalle.id_pedido}</h3>
						<EstadoBadge codigo={pedidoDetalle.estado_codigo} />
					</div>
					<button
						onclick={() => (detalleAbierto = false)}
						class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
					>
						<span class="material-symbols-outlined text-slate-500 text-[20px]">close</span>
					</button>
				</div>

				<!-- Body -->
				<div class="p-6 flex flex-col gap-4 overflow-y-auto">
					<!-- Restaurante -->
					<div class="flex items-start gap-3">
						<div class="w-9 h-9 rounded-full bg-primary-fixed/50 flex items-center justify-center text-primary-container shrink-0">
							<span class="material-symbols-outlined text-[18px]">storefront</span>
						</div>
						<div>
							<p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Recoger en</p>
							<p class="text-sm font-bold text-slate-900">{pedidoDetalle.restaurante?.nombre}</p>
						</div>
					</div>

					<!-- Cliente -->
					<div class="flex items-start gap-3">
						<div class="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
							<span class="material-symbols-outlined text-[18px]">location_on</span>
						</div>
						<div>
							<p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Entregar a</p>
							<p class="text-sm font-bold text-slate-900">{pedidoDetalle.cliente?.nombre}</p>
							<p class="text-xs text-slate-500">{pedidoDetalle.direccion?.direccion}</p>
						</div>
					</div>

					<!-- Repartidor -->
					{#if pedidoDetalle.repartidor?.id_repartidor}
						<div class="flex items-start gap-3">
							<div class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
								<span class="material-symbols-outlined text-[18px]">two_wheeler</span>
							</div>
							<div>
								<p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Repartidor</p>
								<p class="text-sm font-bold text-slate-900">{pedidoDetalle.repartidor.nombre}</p>
							</div>
						</div>
					{/if}

					<!-- Grid de datos -->
					<div class="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3">
						<div class="text-center">
							<p class="text-[10px] uppercase text-slate-400 font-bold">Total</p>
							<p class="text-sm font-bold text-slate-900 mt-0.5">{usd(pedidoDetalle.total ?? 0)}</p>
						</div>
						<div class="text-center border-l border-r border-slate-200">
							<p class="text-[10px] uppercase text-slate-400 font-bold">Distancia</p>
							<p class="text-sm font-bold text-slate-900 mt-0.5">{pedidoDetalle.distancia_km ?? '—'} km</p>
						</div>
						<div class="text-center">
							<p class="text-[10px] uppercase text-slate-400 font-bold">Tiempo</p>
							<p class="text-sm font-bold text-slate-900 mt-0.5">{pedidoDetalle.tiempo_estimado_min} min</p>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="px-6 py-4 border-t border-slate-100 flex gap-2">
					<button
						onclick={() => {
							detalleAbierto = false;
							abrirCancelar(pedidoDetalle);
						}}
						class="flex-1 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
					>
						Cancelar pedido
					</button>
					<button
						onclick={() => {
							detalleAbierto = false;
							abrirReasignar(pedidoDetalle);
						}}
						class="flex-1 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-bold transition-colors"
					>
						Reasignar
					</button>
				</div>
			{/if}
			</div>
		</div>
	{/if}

	<!-- ═══════ MODAL REASIGNAR ═══════ -->
	{#if reasignarAbierto}
		<div
			class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (reasignarAbierto = false)}
		>
			<div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
				<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
					<h3 class="text-base font-bold text-slate-900">Reasignar pedido #{pedidoAReasignar?.id_pedido}</h3>
					<button
						onclick={() => (reasignarAbierto = false)}
						class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
					>
						<span class="material-symbols-outlined text-slate-500 text-[20px]">close</span>
					</button>
				</div>

				<div class="px-6 py-4 flex flex-col gap-3 overflow-y-auto">
					<p class="text-xs text-slate-500">
						Elige un repartidor disponible para reasignar este pedido.
					</p>

					{#if repartidoresLibres.length === 0}
						<p class="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-xl">
							No hay repartidores libres ahora mismo
						</p>
					{:else}
						{#each repartidoresLibres as r (r.id_repartidor)}
							<button
								type="button"
								onclick={() => (repartidorSeleccionado = r)}
								class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
									{repartidorSeleccionado?.id_repartidor === r.id_repartidor
										? 'border-primary-container bg-primary-fixed/20 shadow-sm'
										: 'border-slate-200 hover:border-slate-300'}"
							>
								<div class="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0">
									{iniciales(r.nombre)}
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-bold text-slate-900 truncate">{r.nombre}</div>
									<div class="text-[11px] text-slate-500 capitalize truncate">{r.tipo_vehiculo} · {r.zona}</div>
								</div>
								<div class="flex items-center gap-1 text-xs font-bold text-slate-700 shrink-0">
									<span class="material-symbols-outlined text-[13px] text-amber-400" style="font-variation-settings:'FILL' 1;">star</span>
									{r.calificacion_promedio}
								</div>
							</button>
						{/each}
					{/if}
				</div>

				<div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
					<button
						onclick={() => (reasignarAbierto = false)}
						class="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
					>
						Cancelar
					</button>
					<button
						onclick={confirmarReasignar}
						disabled={!repartidorSeleccionado}
						class="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					>
						Confirmar
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ═══════ MODAL CANCELAR ═══════ -->
	{#if cancelarAbierto}
		<div
			class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (cancelarAbierto = false)}
		>
			<div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
				<div class="px-6 pt-6 pb-4 flex flex-col gap-4">
					<div class="flex items-center gap-3">
						<div class="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
							<span class="material-symbols-outlined text-red-600 text-[22px]">warning</span>
						</div>
						<div>
							<h3 class="text-base font-bold text-slate-900">¿Cancelar pedido?</h3>
							<p class="text-xs text-slate-500 mt-0.5">Esta acción notificará al cliente.</p>
						</div>
					</div>

					<p class="text-sm text-slate-700">
						Vas a cancelar el pedido <span class="font-bold">#{pedidoACancelar?.id_pedido}</span> de
						<span class="font-bold">{typeof pedidoACancelar?.restaurante === 'string' ? pedidoACancelar.restaurante : pedidoACancelar?.restaurante?.nombre}</span>.
					</p>

					<label class="flex flex-col gap-1.5">
						<span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motivo</span>
						<textarea
							bind:value={motivoCancelacion}
							rows="3"
							placeholder="Ej: cliente no responde, dirección incorrecta..."
							class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 resize-none"
						></textarea>
					</label>
				</div>

				<div class="px-6 py-4 bg-slate-50 flex justify-end gap-2">
					<button
						onclick={() => (cancelarAbierto = false)}
						class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
					>
						Volver
					</button>
					<button
						onclick={confirmarCancelar}
						class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
					>
						Cancelar pedido
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>