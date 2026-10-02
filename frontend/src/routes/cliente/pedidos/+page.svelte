<script>
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import EstadoBadge from '$lib/componentes/EstadoBadge.svelte';
	import { pedidos, filtrarPorCategoria, conteos } from '$lib/stores/pedidos.js';

	let filtroActivo = $state('todos');

	let filtroStore = $derived(filtrarPorCategoria(filtroActivo));
	let pedidosFiltrados = $derived($filtroStore);

	const FILTROS = [
		{ id: 'todos', label: 'Todos' },
		{ id: 'activos', label: 'Activos' },
		{ id: 'entregados', label: 'Entregados' },
		{ id: 'cancelados', label: 'Cancelados' }
	];

	function formatearFecha(iso) {
		const d = new Date(iso);
		const hoy = new Date();
		const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);

		if (d.toDateString() === hoy.toDateString()) {
			return `Hoy, ${d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`;
		}
		if (d.toDateString() === ayer.toDateString()) {
			return `Ayer, ${d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`;
		}
		return (
			d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }) +
			', ' +
			d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
		);
	}

	function resumenProductos(pedido) {
		const partes = pedido.detalle.slice(0, 2).map((d) => `${d.cantidad}x ${d.nombre}`);
		if (pedido.detalle.length > 2) partes.push('...');
		return partes.join(', ');
	}

	function irAlPedido(id) {
		goto(`/cliente/pedidos/${id}`);
	}
</script>

<div class="min-h-screen bg-surface">
	<div class="max-w-[900px] mx-auto px-4 py-6">
		<div class="flex items-center justify-between mb-6">
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-2xl font-bold text-on-surface">Mis pedidos</h1>
					<span class="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded-full">
						{$conteos.todos} {$conteos.todos === 1 ? 'pedido' : 'pedidos'}
					</span>
				</div>
				<p class="text-sm text-on-surface-variant mt-1">Revisa el estado de tus compras</p>
			</div>
		</div>

		<div class="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
			{#each FILTROS as f (f.id)}
				<button
					onclick={() => (filtroActivo = f.id)}
					class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5
						{filtroActivo === f.id
						? 'bg-primary-container text-white shadow-sm'
						: 'bg-white text-on-surface hover:bg-surface-container'}"
				>
					<span>{f.label}</span>
					<span
						class="text-[11px] font-bold px-1.5 rounded-full
							{filtroActivo === f.id
							? 'bg-white/25 text-white'
							: 'bg-surface-container text-on-surface-variant'}"
					>
						{$conteos[f.id]}
					</span>
				</button>
			{/each}
		</div>

		{#if pedidosFiltrados.length === 0}
			<div class="bg-white rounded-2xl py-16 text-center">
				<div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-3">
					<span class="material-symbols-outlined text-3xl text-on-surface-variant/50">receipt_long</span>
				</div>
				<p class="text-sm font-semibold text-on-surface">No hay pedidos en esta categoría</p>
				<p class="text-xs text-on-surface-variant mt-1">Tus pedidos aparecerán listados aquí</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each pedidosFiltrados as pedido (pedido.id_pedido)}
					<button
						onclick={() => irAlPedido(pedido.id_pedido)}
						class="w-full text-left bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
					>
						<div class="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-surface-container">
							<img
								src={pedido.imagen}
								alt={pedido.nombre}
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							/>
						</div>

						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap mb-0.5">
								<h3 class="text-base font-bold text-on-surface truncate">{pedido.nombre}</h3>
								<span class="text-[10px] text-on-surface-variant">#{pedido.id_pedido}</span>
							</div>
							<p class="text-xs text-on-surface-variant truncate">{formatearFecha(pedido.fecha_creacion)}</p>
							<p class="text-xs text-on-surface-variant/80 truncate mt-0.5">
								{resumenProductos(pedido)}
							</p>
						</div>

						<div class="flex items-center gap-3 shrink-0">
							<div class="flex flex-col items-end gap-1">
								<EstadoBadge codigo={pedido.estado_codigo} />
								<span
									class="text-base font-bold
										{pedido.id_estado === 6 ? 'text-on-surface-variant line-through' : 'text-on-surface'}"
								>
									{usd(pedido.total)}
								</span>
							</div>
							<span class="material-symbols-outlined text-on-surface-variant/60 group-hover:text-primary-container group-hover:translate-x-0.5 transition-all">
								chevron_right
							</span>
						</div>
					</button>
				{/each}
			</div>
		{/if}

		<div class="mt-8 bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<div class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary-container shrink-0">
					<span class="material-symbols-outlined text-[18px]">storefront</span>
				</div>
				<p class="text-sm text-on-surface text-center sm:text-left">
					¿Deseas repetir un pedido favorito? Explora restaurantes
				</p>
			</div>
			<a
				href="/cliente"
				class="inline-flex items-center gap-1 text-sm font-bold text-primary-container hover:underline shrink-0"
			>
				Explorar restaurantes
				<span class="material-symbols-outlined text-[18px]">arrow_forward</span>
			</a>
		</div>
	</div>
</div>