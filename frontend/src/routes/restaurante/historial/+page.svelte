<script>
	import { usd } from '$lib/formato.js';
	import EstadoBadge from '$lib/componentes/EstadoBadge.svelte';
	import { PEDIDOS } from '$lib/mock/pedidos.js';

	// Cuando el backend esté listo: GET /api/restaurante/pedidos?activos=false
	const ID_RESTAURANTE = 1;

	let pedidos = $state([...PEDIDOS]);

	// Solo entregados y cancelados del restaurante
	let historial = $derived(
		pedidos.filter(
			(p) =>
				p.id_restaurante === ID_RESTAURANTE &&
				(p.id_estado === 5 || p.id_estado === 6)
		)
	);

	// Filtros
	let filtroActivo = $state('todos');

	let pedidosFiltrados = $derived.by(() => {
		if (filtroActivo === 'todos') return historial;
		if (filtroActivo === 'entregados') return historial.filter((p) => p.id_estado === 5);
		if (filtroActivo === 'cancelados') return historial.filter((p) => p.id_estado === 6);
		return historial;
	});

	// Contadores
	let contEntregados = $derived(historial.filter((p) => p.id_estado === 5).length);
	let contCancelados = $derived(historial.filter((p) => p.id_estado === 6).length);

	// Búsqueda
	let busqueda = $state('');
	let pedidosConBusqueda = $derived.by(() => {
		if (!busqueda.trim()) return pedidosFiltrados;
		const q = busqueda.trim().toLowerCase();
		return pedidosFiltrados.filter((p) => {
			const id = String(p.id_pedido);
			const cliente = (p.cliente?.nombre || '').toLowerCase();
			return id.includes(q) || cliente.includes(q);
		});
	});

	function formatearFecha(iso) {
		if (!iso) return '—';
		const d = new Date(iso);
		return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }) + ', ' +
			d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
	}

	function resumenProductos(pedido) {
		const partes = pedido.detalle.slice(0, 2).map((d) => `${d.cantidad}x ${d.nombre}`);
		if (pedido.detalle.length > 2) partes.push('...');
		return partes.join(', ');
	}
</script>

<div class="min-h-screen bg-surface">
	<main class="max-w-[1000px] mx-auto px-4 py-6 flex flex-col gap-6">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-xs text-on-surface-variant">
			<a href="/restaurante" class="flex items-center gap-1 hover:text-primary-container transition-colors">
				<span class="material-symbols-outlined text-[16px]">arrow_back</span>
				Restaurante
			</a>
			<span class="text-outline-variant">/</span>
			<span class="text-on-surface font-semibold">Historial</span>
		</nav>

		<!-- Header -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold text-on-surface">Historial de pedidos</h1>
				<p class="text-sm text-on-surface-variant mt-1">
					Consulta los pedidos entregados y cancelados del restaurante.
				</p>
			</div>

			<!-- KPIs -->
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl">
					<span class="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
					<div>
						<div class="text-[10px] text-green-700 uppercase tracking-wider font-semibold">Entregados</div>
						<div class="text-sm font-bold text-green-800">{contEntregados}</div>
					</div>
				</div>
				<div class="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl">
					<span class="material-symbols-outlined text-red-600 text-[20px]">cancel</span>
					<div>
						<div class="text-[10px] text-red-700 uppercase tracking-wider font-semibold">Cancelados</div>
						<div class="text-sm font-bold text-red-800">{contCancelados}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Barra de filtros -->
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
			<!-- Chips -->
			<div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
				<button
					onclick={() => (filtroActivo = 'todos')}
					class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
						{filtroActivo === 'todos'
							? 'bg-primary-container text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
				>
					Todos
					<span class="text-[11px] px-1.5 rounded-full
						{filtroActivo === 'todos' ? 'bg-white/25 text-white' : 'bg-white text-on-surface-variant'}">
						{historial.length}
					</span>
				</button>
				<button
					onclick={() => (filtroActivo = 'entregados')}
					class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
						{filtroActivo === 'entregados'
							? 'bg-primary-container text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
				>
					<span class="w-2 h-2 rounded-full bg-green-500"></span>
					Entregados
					<span class="text-[11px] px-1.5 rounded-full
						{filtroActivo === 'entregados' ? 'bg-white/25 text-white' : 'bg-white text-on-surface-variant'}">
						{contEntregados}
					</span>
				</button>
				<button
					onclick={() => (filtroActivo = 'cancelados')}
					class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
						{filtroActivo === 'cancelados'
							? 'bg-primary-container text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
				>
					<span class="w-2 h-2 rounded-full bg-red-500"></span>
					Cancelados
					<span class="text-[11px] px-1.5 rounded-full
						{filtroActivo === 'cancelados' ? 'bg-white/25 text-white' : 'bg-white text-on-surface-variant'}">
						{contCancelados}
					</span>
				</button>
			</div>

			<!-- Búsqueda -->
			<div class="relative flex-1 lg:max-w-xs">
				<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
					search
				</span>
				<input
					type="text"
					bind:value={busqueda}
					placeholder="Buscar por # o cliente..."
					class="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface text-sm placeholder:text-on-surface-variant/60 border border-transparent focus:outline-none focus:border-primary-container focus:bg-white transition-all"
				/>
			</div>
		</div>

		<!-- Lista de pedidos -->
		{#if pedidosConBusqueda.length === 0}
			<div class="bg-white rounded-2xl py-16 text-center">
				<div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-3">
					<span class="material-symbols-outlined text-3xl text-on-surface-variant/50">receipt_long</span>
				</div>
				<p class="text-sm font-semibold text-on-surface">No hay pedidos en esta categoría</p>
				<p class="text-xs text-on-surface-variant mt-1">Los pedidos cerrados aparecerán aquí</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each pedidosConBusqueda as p (p.id_pedido)}
					<article class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
						<!-- Header -->
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div class="flex items-center gap-2">
								<span class="text-base font-bold text-on-surface">#{p.id_pedido}</span>
								<EstadoBadge codigo={p.estado_codigo} />
							</div>
							<span class="text-xs text-on-surface-variant flex items-center gap-1">
								<span class="material-symbols-outlined text-[14px]">schedule</span>
								{formatearFecha(p.fecha_creacion)}
							</span>
						</div>

						<!-- Cliente + productos -->
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 py-3 border-y border-gray-100">
							<div>
								<p class="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Cliente</p>
								<p class="text-sm font-semibold text-on-surface truncate">
									{p.cliente?.nombre || 'Cliente'}
								</p>
							</div>
							<div class="sm:col-span-2">
								<p class="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Productos</p>
								<p class="text-sm text-on-surface truncate">
									{resumenProductos(p)}
								</p>
							</div>
						</div>

						<!-- Footer: monto + motivo si cancelado -->
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div class="flex items-center gap-4">
								<div>
									<span class="text-[11px] text-on-surface-variant uppercase tracking-wider block">Total</span>
									<span class="text-lg font-bold {p.id_estado === 6 ? 'text-on-surface-variant line-through' : 'text-primary-container'}">
										{usd(p.total)}
									</span>
								</div>
								{#if p.id_estado === 5 && p.id_factura}
									<a
										href="/factura/{p.id_factura}"
										class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors"
									>
										<span class="material-symbols-outlined text-[16px] text-primary-container">receipt_long</span>
										Ver factura #{p.id_factura}
									</a>
								{/if}
							</div>

							{#if p.motivo_cancelacion}
								<div class="flex-1 min-w-[200px] sm:max-w-md bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start gap-2">
									<span class="material-symbols-outlined text-red-600 text-[16px] shrink-0 mt-0.5">cancel</span>
									<div class="min-w-0">
										<p class="text-[10px] font-bold text-red-900 uppercase tracking-wider">Motivo de cancelación</p>
										<p class="text-xs text-red-800 truncate">{p.motivo_cancelacion}</p>
									</div>
								</div>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</main>
</div>