<script>
	import { goto } from '$app/navigation';
	import { sesion } from '$lib/stores/sesion.js';
	import { usd } from '$lib/formato.js';
	import EstadoBadge from '$lib/componentes/EstadoBadge.svelte';
	import { PEDIDOS } from '$lib/mock/pedidos.js';
	import { mostrarToast } from '$lib/toast.js';

	// Cuando el backend esté listo: GET /api/restaurante/pedidos?activos=true
	const ID_RESTAURANTE = 1;

	let pedidos = $state([...PEDIDOS]);
	let modalCancelar = $state(false);
	let pedidoACancelar = $state(null);
	let motivoCancelar = $state('');

	let colRecibido = $derived(
		pedidos.filter((p) => p.id_estado === 1 && p.id_restaurante === ID_RESTAURANTE)
	);
	let colPreparacion = $derived(
		pedidos.filter((p) => p.id_estado === 2 && p.id_restaurante === ID_RESTAURANTE)
	);
	let colListo = $derived(
		pedidos.filter((p) => p.id_estado === 3 && p.id_restaurante === ID_RESTAURANTE)
	);

	let totalActivos = $derived(colRecibido.length + colPreparacion.length + colListo.length);

	function aceptar(p) {
		pedidos = pedidos.map((x) =>
			x.id_pedido === p.id_pedido ? { ...x, id_estado: 2, estado_codigo: 'en_preparacion' } : x
		);
	}

	function marcarListo(p) {
		pedidos = pedidos.map((x) =>
			x.id_pedido === p.id_pedido
				? { ...x, id_estado: 3, estado_codigo: 'listo_para_retirar' }
				: x
		);
	}

	function abrirCancelar(p) {
		pedidoACancelar = p;
		motivoCancelar = '';
		modalCancelar = true;
	}

	function confirmarCancelar() {
		if (!motivoCancelar.trim()) return;

		pedidos = pedidos.map((x) =>
			x.id_pedido === pedidoACancelar.id_pedido
				? {
						...x,
						id_estado: 6,
						estado_codigo: 'cancelado',
						estado_nombre: 'Cancelado',
						motivo_cancelacion: motivoCancelar
					}
				: x
		);

		modalCancelar = false;
		pedidoACancelar = null;
		mostrarToast('exito', 'Pedido cancelado, el cliente fue notificado');
	}

	function formatearHora(iso) {
		return new Date(iso).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
	}

	// Nav del restaurante
	const navLinks = [
		{ href: '/restaurante/menu', icon: 'restaurant_menu', label: 'Menú' },
		{ href: '/restaurante/horario', icon: 'schedule', label: 'Horario' },
		{ href: '/restaurante/historial', icon: 'history', label: 'Historial' },
		{ href: '/restaurante/facturas', icon: 'receipt_long', label: 'Facturas' }
	];
</script>

<div class="min-h-screen bg-surface-container-low">
	<!-- ═══════ SUB-HEADER ═══════ -->
	<section class="bg-white border-b border-gray-100 sticky top-0 z-30">
		<div class="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
			<!-- Izquierda: título -->
			<div class="flex items-center gap-3">
				<h1 class="text-base font-bold text-on-surface">Pedidos en curso</h1>
				{#if totalActivos > 0}
					<span class="bg-primary-container text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
						{totalActivos} activos
					</span>
				{:else}
					<span class="bg-gray-200 text-gray-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
						Sin pedidos
					</span>
				{/if}
			</div>

			<!-- Derecha: nav + estado -->
			<div class="flex items-center gap-2 flex-wrap">
				<!-- Nav pills -->
				<nav class="flex items-center gap-1 bg-surface-container-low rounded-full p-1">
					{#each navLinks as link (link.href)}
						<a
							href={link.href}
							class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-white hover:text-primary-container transition-all"
						>
							<span class="material-symbols-outlined text-[16px]">{link.icon}</span>
							<span class="hidden sm:inline">{link.label}</span>
						</a>
					{/each}
				</nav>

				<!-- Badge abierto -->
				<div class="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
					<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
					<span class="text-xs font-semibold text-green-700">Abierto</span>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════ KANBAN ═══════ -->
	<main class="max-w-[1400px] mx-auto p-4">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Columna: Recibido -->
			<div class="bg-[#F3F4F6] rounded-xl p-3 flex flex-col gap-3 min-h-[500px]">
				<div class="flex items-center justify-between px-1">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
						<h2 class="text-sm font-bold text-on-surface">Recibido</h2>
						<span class="bg-white text-xs font-bold text-on-surface-variant px-2 py-0.5 rounded-full">
							{colRecibido.length}
						</span>
					</div>
					<span class="text-[11px] text-on-surface-variant">Por confirmar</span>
				</div>

				{#if colRecibido.length === 0}
					<div class="flex flex-col items-center justify-center py-10 text-center">
						<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">inbox</span>
						<p class="text-xs text-on-surface-variant mt-2">Sin pedidos nuevos</p>
					</div>
				{:else}
					{#each colRecibido as p (p.id_pedido)}
						<article class="bg-white rounded-xl p-3 shadow-sm flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="text-sm font-bold text-on-surface">#{p.id_pedido}</span>
									<span class="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
										NUEVO
									</span>
								</div>
								<span class="text-[11px] text-on-surface-variant">{formatearHora(p.fecha_creacion)}</span>
							</div>

							<div class="text-xs text-on-surface-variant flex items-center gap-1">
								<span class="material-symbols-outlined text-[14px]">person</span>
								{p.cliente?.nombre || 'Cliente'}
							</div>

							<div class="flex flex-col gap-1 text-xs py-2 border-y border-gray-100">
								{#each p.detalle as d}
									<div class="flex justify-between">
										<span>{d.cantidad}x {d.nombre}</span>
										<span class="text-on-surface-variant">{usd(d.subtotal)}</span>
									</div>
								{/each}
							</div>

							<div class="flex justify-between items-center">
								<span class="text-[11px] text-on-surface-variant">Total:</span>
								<span class="text-sm font-bold text-on-surface">{usd(p.total)}</span>
							</div>

							<div class="flex gap-2 pt-1">
								<button
									onclick={() => aceptar(p)}
									class="flex-1 h-9 bg-primary-container hover:bg-primary text-white rounded-lg text-xs font-semibold transition-colors"
								>
									Aceptar
								</button>
								<button
									onclick={() => abrirCancelar(p)}
									class="h-9 px-3 border border-gray-200 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-gray-50 transition-colors"
								>
									Cancelar
								</button>
							</div>
						</article>
					{/each}
				{/if}
			</div>

			<!-- Columna: En preparación -->
			<div class="bg-[#F3F4F6] rounded-xl p-3 flex flex-col gap-3 min-h-[500px]">
				<div class="flex items-center justify-between px-1">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
						<h2 class="text-sm font-bold text-on-surface">En preparación</h2>
						<span class="bg-white text-xs font-bold text-on-surface-variant px-2 py-0.5 rounded-full">
							{colPreparacion.length}
						</span>
					</div>
					<span class="text-[11px] text-on-surface-variant">En cocina</span>
				</div>

				{#if colPreparacion.length === 0}
					<div class="flex flex-col items-center justify-center py-10 text-center">
						<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">soup_kitchen</span>
						<p class="text-xs text-on-surface-variant mt-2">Sin pedidos en cocina</p>
					</div>
				{:else}
					{#each colPreparacion as p (p.id_pedido)}
						<article class="bg-white rounded-xl p-3 shadow-sm flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-on-surface">#{p.id_pedido}</span>
								<span class="text-[11px] text-on-surface-variant">{formatearHora(p.fecha_creacion)}</span>
							</div>

							<div class="text-xs text-on-surface-variant flex items-center gap-1">
								<span class="material-symbols-outlined text-[14px]">person</span>
								{p.cliente?.nombre || 'Cliente'}
							</div>

							<div class="flex flex-col gap-1 text-xs py-2 border-y border-gray-100">
								{#each p.detalle as d}
									<div class="flex justify-between">
										<span>{d.cantidad}x {d.nombre}</span>
									</div>
								{/each}
							</div>

							<button
								onclick={() => marcarListo(p)}
								class="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
							>
								Marcar listo
							</button>
						</article>
					{/each}
				{/if}
			</div>

			<!-- Columna: Listo para retirar -->
			<div class="bg-[#F3F4F6] rounded-xl p-3 flex flex-col gap-3 min-h-[500px]">
				<div class="flex items-center justify-between px-1">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
						<h2 class="text-sm font-bold text-on-surface">Listo para retirar</h2>
						<span class="bg-white text-xs font-bold text-on-surface-variant px-2 py-0.5 rounded-full">
							{colListo.length}
						</span>
					</div>
					<span class="text-[11px] text-on-surface-variant">Despacho</span>
				</div>

				{#if colListo.length === 0}
					<div class="flex flex-col items-center justify-center py-10 text-center">
						<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">inventory_2</span>
						<p class="text-xs text-on-surface-variant mt-2">Sin pedidos listos</p>
					</div>
				{:else}
					{#each colListo as p (p.id_pedido)}
						<article class="bg-white rounded-xl p-3 shadow-sm flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-bold text-on-surface">#{p.id_pedido}</span>
								<span class="text-[11px] text-on-surface-variant">{formatearHora(p.fecha_creacion)}</span>
							</div>

							<div class="text-xs text-on-surface-variant flex items-center gap-1">
								<span class="material-symbols-outlined text-[14px]">person</span>
								{p.cliente?.nombre || 'Cliente'}
							</div>

							<div class="flex flex-col gap-1 text-xs py-2 border-y border-gray-100">
								{#each p.detalle as d}
									<div class="flex justify-between">
										<span>{d.cantidad}x {d.nombre}</span>
									</div>
								{/each}
							</div>

							<div class="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-1.5">
								<span class="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
								<span class="text-[11px] font-semibold text-green-700">Listo para entrega</span>
							</div>
						</article>
					{/each}
				{/if}
			</div>
		</div>
	</main>

	<!-- ═══════ MODAL CANCELAR PEDIDO ═══════ -->
	{#if modalCancelar}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (modalCancelar = false)}
		>
			<div class="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-red-600">warning</span>
					</div>
					<div>
						<h3 class="text-base font-bold text-on-surface">
							Cancelar pedido #{pedidoACancelar?.id_pedido}
						</h3>
						<p class="text-xs text-on-surface-variant mt-0.5">
							El cliente será notificado con el motivo.
						</p>
					</div>
				</div>

				<div class="flex flex-wrap gap-1.5 mb-3">
					{#each ['Ingrediente agotado', 'Cocina saturada', 'Fuera de horario'] as motivo}
						<button
							type="button"
							onclick={() => (motivoCancelar = motivo)}
							class="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors
								{motivoCancelar === motivo
									? 'bg-primary-container text-white'
									: 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
						>
							{motivo}
						</button>
					{/each}
				</div>

				<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
					Motivo de cancelación *
				</label>
				<textarea
					bind:value={motivoCancelar}
					placeholder="Escribe el motivo que verá el cliente..."
					rows="3"
					class="w-full p-3 rounded-lg bg-surface-container-low text-sm text-on-surface border border-transparent focus:outline-none focus:border-red-500 focus:bg-white transition-all resize-none"
				></textarea>

				<div class="flex items-center justify-end gap-2 mt-5">
					<button
						type="button"
						onclick={() => (modalCancelar = false)}
						class="px-4 py-2 rounded-lg text-on-surface hover:bg-surface-container font-semibold text-sm transition-colors"
					>
						Volver
					</button>
					<button
						type="button"
						onclick={confirmarCancelar}
						disabled={!motivoCancelar.trim()}
						class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center gap-1.5"
					>
						<span class="material-symbols-outlined text-[16px]">cancel</span>
						Confirmar cancelación
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>