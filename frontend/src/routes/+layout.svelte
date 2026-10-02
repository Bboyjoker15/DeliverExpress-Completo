<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { sesion, cargarSesion, cerrarSesion, RUTA_POR_ROL } from '$lib/stores/sesion.js';
	import {
		notificaciones,
		marcarTodasLeidas,
		eliminarNotificacion,
		agregarNotificacion,
		tiempoRelativo
	} from '$lib/stores/notificaciones.js';
	import { escuchar, estadoWs } from '$lib/ws.js';
	import { ESTADOS } from '$lib/estados.js';
	import Toast from '$lib/componentes/Toast.svelte';
	import './layout.css';

	let { children } = $props();

	onMount(cargarSesion);

	const RUTAS_SIN_HEADER = ['/login', '/registro', '/'];

	let mostrarHeader = $derived(
		$sesion.token && page.url.pathname && !RUTAS_SIN_HEADER.includes(page.url.pathname)
	);

	let menuAbierto = $state(false);
	let panelNotis = $state(false);

	// Cerrar dropdowns al cambiar de ruta
	$effect(() => {
		page.url.pathname;
		menuAbierto = false;
		panelNotis = false;
	});

	// Notificaciones filtradas por rol
	let notisFiltradas = $derived(
		$notificaciones.filter((n) => !n.rol || n.rol === $sesion.rol)
	);

	let noLeidasFiltradas = $derived(notisFiltradas.filter((n) => !n.leida).length);

	// ══════════════════════════════════════════════
	// WS → NOTIFICACIONES
	// ══════════════════════════════════════════════
	const offPedido = escuchar('pedido', (datos) => {
		if (!datos?.id_pedido) return;
		const estado = ESTADOS[datos.estado]?.texto ?? datos.estado ?? 'actualizado';
		const rolDestino = mapearRolPedido(datos);

		agregarNotificacion({
			titulo: `Pedido #${datos.id_pedido}`,
			mensaje: `Cambió a "${estado}"`,
			tipo: 'pedido',
			id_pedido: datos.id_pedido,
			rol: rolDestino
		});
	});

	const offOferta = escuchar('oferta', (datos) => {
		if (!datos?.id_pedido) return;
		agregarNotificacion({
			titulo: `Nueva oferta · Pedido #${datos.id_pedido}`,
			mensaje: `${datos.restaurante?.nombre ?? 'Restaurante'} → ${datos.cliente?.direccion ?? 'destino'}`,
			tipo: 'oferta',
			id_pedido: datos.id_pedido,
			rol: 'repartidor'
		});
	});

	// A qué rol va dirigida la notificación según el estado del pedido
	function mapearRolPedido(datos) {
		if (!datos.estado) return null;
		// Estados que le importan al cliente
		if (['listo_para_retirar', 'en_camino', 'entregado', 'cancelado'].includes(datos.estado)) {
			return 'cliente';
		}
		// Estados que le importan al restaurante
		if (['recibido'].includes(datos.estado)) {
			return 'restaurante';
		}
		// Estados que le importan al repartidor
		if (['en_camino'].includes(datos.estado)) {
			return 'repartidor';
		}
		return null; // todos
	}

	function salir() {
		cerrarSesion();
		goto('/login');
	}

	function irPerfil() {
		menuAbierto = false;
		if ($sesion.rol === 'cliente') {
			goto('/cliente/perfil');
		} else {
			goto('/perfil');
		}
	}

	function irPedidos() {
		menuAbierto = false;
		goto('/cliente/pedidos');
	}

	function irAlInicio() {
		menuAbierto = false;
		goto(RUTA_POR_ROL[$sesion.rol] || '/');
	}

	function abrirNotificaciones() {
		panelNotis = !panelNotis;
		menuAbierto = false;
		if (panelNotis) {
			setTimeout(() => marcarTodasLeidas(), 800);
		}
	}

	function irANotificacion(n) {
		if (n.id_pedido) {
			panelNotis = false;
			if ($sesion.rol === 'cliente') {
				goto(`/cliente/pedidos/${n.id_pedido}`);
			} else if ($sesion.rol === 'restaurante') {
				goto('/restaurante');
			} else if ($sesion.rol === 'repartidor') {
				goto('/repartidor');
			} else if ($sesion.rol === 'coordinador') {
				goto('/coordinador');
			}
		}
	}

	function cerrarTodo() {
		menuAbierto = false;
		panelNotis = false;
	}
</script>

{#if mostrarHeader}
	<header class="bg-white shadow-sm border-b border-gray-100 print:hidden relative z-50">
		<div class="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
			<!-- Logo -->
			<button
				type="button"
				onclick={irAlInicio}
				class="flex items-center gap-2 hover:opacity-80 transition-opacity"
			>
				<span class="font-bold text-primary">DeliverExpress</span>
			</button>

			<!-- Campana + Avatar -->
			<div class="flex items-center gap-2">
				<!-- Campana con dropdown -->
				<div class="relative">
					<button
						type="button"
						onclick={abrirNotificaciones}
						class="w-9 h-9 rounded-full hover:bg-surface-container-low flex items-center justify-center transition-colors relative"
						aria-label="Notificaciones"
					>
						<span class="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>

						{#if noLeidasFiltradas > 0}
							<span
								class="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary-container text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
							>
								{noLeidasFiltradas}
							</span>
						{/if}
					</button>

					{#if panelNotis}
						<div
							class="fixed inset-0 z-40"
							onclick={cerrarTodo}
							onkeydown={(e) => e.key === 'Escape' && cerrarTodo()}
							role="presentation"
						></div>

						<div
							class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
						>
							<div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
								<div class="flex items-center gap-2">
									<h3 class="text-sm font-bold text-on-surface">Notificaciones</h3>
									{#if noLeidasFiltradas > 0}
										<span class="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2 py-0.5 rounded-full">
											{noLeidasFiltradas} nuevas
										</span>
									{/if}
								</div>
								{#if notisFiltradas.length > 0}
									<button
										type="button"
										onclick={() => notificaciones.set([])}
										class="text-[11px] text-on-surface-variant hover:text-primary-container transition-colors"
									>
										Limpiar
									</button>
								{/if}
							</div>

							<div class="max-h-96 overflow-y-auto">
								{#if notisFiltradas.length === 0}
									<div class="py-10 flex flex-col items-center justify-center px-6">
										<div class="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-3">
											<span class="material-symbols-outlined text-on-surface-variant text-[28px]">
												notifications_off
											</span>
										</div>
										<p class="text-sm font-semibold text-on-surface">Sin notificaciones</p>
										<p class="text-xs text-on-surface-variant text-center mt-1">
											Aquí verás las actualizaciones relevantes
										</p>
									</div>
								{:else}
									{#each notisFiltradas as n (n.id)}
										<div
											role="button"
											tabindex="0"
											onclick={() => irANotificacion(n)}
											onkeydown={(e) => e.key === 'Enter' && irANotificacion(n)}
											class="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low/50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer
												{!n.leida ? 'bg-primary-fixed/10' : ''}"
										>
											<div
												class="w-9 h-9 rounded-full flex items-center justify-center shrink-0
													{n.tipo === 'pedido' ? 'bg-primary-fixed text-primary-container' : ''}
													{n.tipo === 'oferta' ? 'bg-secondary-fixed text-secondary' : ''}
													{n.tipo === 'info' ? 'bg-tertiary-fixed text-tertiary' : ''}"
											>
												<span class="material-symbols-outlined text-[18px]">
													{n.tipo === 'pedido' ? 'receipt_long' : ''}
													{n.tipo === 'oferta' ? 'local_offer' : ''}
													{n.tipo === 'info' ? 'info' : ''}
												</span>
											</div>

											<div class="flex-1 min-w-0">
												<div class="flex items-start justify-between gap-2">
													<p class="text-sm font-semibold text-on-surface leading-tight">
														{n.titulo}
													</p>
													{#if !n.leida}
														<span class="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1"></span>
													{/if}
												</div>
												<p class="text-xs text-on-surface-variant mt-0.5 leading-snug">
													{n.mensaje}
												</p>
												<p class="text-[10px] text-on-surface-variant/70 mt-1">
													{tiempoRelativo(n.fecha)}
												</p>
											</div>

											<button
												type="button"
												onclick={(e) => {
													e.stopPropagation();
													eliminarNotificacion(n.id);
												}}
												class="text-on-surface-variant/60 hover:text-red-500 p-1 rounded transition-colors shrink-0"
												aria-label="Eliminar"
											>
												<span class="material-symbols-outlined text-[16px]">close</span>
											</button>
										</div>
									{/each}
								{/if}
							</div>

							{#if notisFiltradas.length > 0 && $sesion.rol === 'cliente'}
								<div class="px-4 py-2.5 bg-surface-container-low border-t border-gray-100 text-center">
									<a
										href="/cliente/pedidos"
										class="text-xs font-semibold text-primary-container hover:underline"
										onclick={cerrarTodo}
									>
										Ver todos mis pedidos →
									</a>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Avatar + dropdown -->
				<div class="relative">
					<button
						type="button"
						onclick={() => {
							menuAbierto = !menuAbierto;
							panelNotis = false;
						}}
						class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-surface-container-low transition-colors"
					>
						<div class="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
							{$sesion.nombre?.charAt(0) || 'U'}
						</div>
						<div class="hidden sm:flex flex-col text-left leading-tight">
							<span class="text-xs text-on-surface-variant">{$sesion.nombre}</span>
							<span class="text-[10px] text-on-surface-variant/70 capitalize">{$sesion.rol}</span>
						</div>
						<span class="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
					</button>

					{#if menuAbierto}
						<div
							class="fixed inset-0 z-40"
							onclick={cerrarTodo}
							onkeydown={(e) => e.key === 'Escape' && cerrarTodo()}
							role="presentation"
						></div>

						<div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
							<button
								type="button"
								onclick={irPerfil}
								class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
							>
								<span class="material-symbols-outlined text-[20px] text-primary-container">person</span>
								<span>Mi perfil</span>
							</button>

							{#if $sesion.rol === 'cliente'}
								<button
									type="button"
									onclick={irPedidos}
									class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
								>
									<span class="material-symbols-outlined text-[20px] text-primary-container">receipt_long</span>
									<span>Mis pedidos</span>
								</button>
							{/if}

							<div class="h-px bg-gray-100 my-1"></div>

							<button
								type="button"
								onclick={salir}
								class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
							>
								<span class="material-symbols-outlined text-[20px]">logout</span>
								<span>Cerrar sesión</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</header>
{/if}

<main>
	{@render children?.()}
</main>

<Toast />