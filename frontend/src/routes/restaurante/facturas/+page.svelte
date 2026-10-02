<script>
	import { onMount } from 'svelte';
	import { usd, bs } from '$lib/formato.js';
	import { obtenerFacturasComisionMock } from '$lib/mock/restaurantes.js';

	let facturas = $state([]);
	let cargando = $state(true);
	let filtroActivo = $state('todas');
	let busqueda = $state('');

	onMount(async () => {
		try {
			facturas = await obtenerFacturasComisionMock();
		} finally {
			cargando = false;
		}
	});

	// KPIs
	let totalPendiente = $derived(
		facturas
			.filter((f) => f.estado_pago === 'pendiente' && !f.anulada)
			.reduce((s, f) => s + f.total_usd, 0)
	);
	let totalPagado = $derived(
		facturas.filter((f) => f.estado_pago === 'pagada').reduce((s, f) => s + f.total_usd, 0)
	);

	// Filtros
	let facturasFiltradas = $derived.by(() => {
		let lista = facturas;
		if (filtroActivo === 'pendientes') lista = lista.filter((f) => f.estado_pago === 'pendiente');
		else if (filtroActivo === 'pagadas') lista = lista.filter((f) => f.estado_pago === 'pagada');
		else if (filtroActivo === 'anuladas') lista = lista.filter((f) => f.anulada);

		if (busqueda.trim()) {
			const q = busqueda.trim().toLowerCase();
			lista = lista.filter(
				(f) =>
					f.numero_factura.toLowerCase().includes(q) ||
					f.periodo.toLowerCase().includes(q)
			);
		}
		return lista;
	});

	let contPendientes = $derived(facturas.filter((f) => f.estado_pago === 'pendiente').length);
	let contPagadas = $derived(facturas.filter((f) => f.estado_pago === 'pagada').length);
	let contAnuladas = $derived(facturas.filter((f) => f.anulada).length);

	function formatearFecha(iso) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('es-VE', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function colorEstado(estado) {
		if (estado === 'pagada') return 'bg-green-100 text-green-800';
		if (estado === 'pendiente') return 'bg-yellow-100 text-yellow-900';
		if (estado === 'aplicada') return 'bg-blue-100 text-blue-800';
		if (estado === 'anulada') return 'bg-red-100 text-red-700';
		return 'bg-gray-200 text-gray-800';
	}

	function etiquetaEstado(estado) {
		if (estado === 'pagada') return 'Pagada';
		if (estado === 'pendiente') return 'Pendiente';
		if (estado === 'aplicada') return 'Aplicada';
		if (estado === 'anulada') return 'Anulada';
		return estado;
	}

	function periodoBonito(p) {
		// "2026-09" → "Septiembre 2026"
		const [anio, mes] = p.split('-');
		const meses = [
			'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
			'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
		];
		return `${meses[Number(mes) - 1]} ${anio}`;
	}
</script>

<svelte:head>
	<title>Facturas · Restaurante</title>
</svelte:head>

<div class="min-h-screen bg-surface">
	<main class="max-w-[1000px] mx-auto px-4 py-6 flex flex-col gap-6">

		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-xs text-on-surface-variant">
			<a href="/restaurante" class="flex items-center gap-1 hover:text-primary-container transition-colors">
				<span class="material-symbols-outlined text-[16px]">arrow_back</span>
				Restaurante
			</a>
			<span class="text-outline-variant">/</span>
			<span class="text-on-surface font-semibold">Facturas</span>
		</nav>

		<!-- Header -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold text-on-surface">Facturas de comisión</h1>
				<p class="text-sm text-on-surface-variant mt-1">
					Facturas mensuales por el 15% de comisión sobre tus ventas.
				</p>
			</div>

			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl">
					<span class="material-symbols-outlined text-yellow-600 text-[20px]">schedule</span>
					<div>
						<div class="text-[10px] text-yellow-800 uppercase tracking-wider font-semibold">Por pagar</div>
						<div class="text-sm font-bold text-yellow-900">{usd(totalPendiente)}</div>
					</div>
				</div>
				<div class="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl">
					<span class="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
					<div>
						<div class="text-[10px] text-green-800 uppercase tracking-wider font-semibold">Pagado</div>
						<div class="text-sm font-bold text-green-900">{usd(totalPagado)}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Filtros -->
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
			<div class="flex items-center gap-2 overflow-x-auto scrollbar-none">
				<button
					onclick={() => (filtroActivo = 'todas')}
					class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
						{filtroActivo === 'todas'
							? 'bg-primary-container text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
				>
					Todas
					<span class="text-[11px] px-1.5 rounded-full
						{filtroActivo === 'todas' ? 'bg-white/25 text-white' : 'bg-white text-on-surface-variant'}">
						{facturas.length}
					</span>
				</button>
				<button
					onclick={() => (filtroActivo = 'pendientes')}
					class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
						{filtroActivo === 'pendientes'
							? 'bg-primary-container text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
				>
					<span class="w-2 h-2 rounded-full bg-yellow-500"></span>
					Pendientes
					<span class="text-[11px] px-1.5 rounded-full
						{filtroActivo === 'pendientes' ? 'bg-white/25 text-white' : 'bg-white text-on-surface-variant'}">
						{contPendientes}
					</span>
				</button>
				<button
					onclick={() => (filtroActivo = 'pagadas')}
					class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
						{filtroActivo === 'pagadas'
							? 'bg-primary-container text-white shadow-sm'
							: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
				>
					<span class="w-2 h-2 rounded-full bg-green-500"></span>
					Pagadas
					<span class="text-[11px] px-1.5 rounded-full
						{filtroActivo === 'pagadas' ? 'bg-white/25 text-white' : 'bg-white text-on-surface-variant'}">
						{contPagadas}
					</span>
				</button>
				{#if contAnuladas > 0}
					<button
						onclick={() => (filtroActivo = 'anuladas')}
						class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5
							{filtroActivo === 'anuladas'
								? 'bg-primary-container text-white shadow-sm'
								: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
					>
						<span class="w-2 h-2 rounded-full bg-red-500"></span>
						Anuladas
						<span class="text-[11px] px-1.5 rounded-full
							{filtroActivo === 'anuladas' ? 'bg-white/25 text-white' : 'bg-white text-on-surface-variant'}">
							{contAnuladas}
						</span>
					</button>
				{/if}
			</div>

			<div class="relative flex-1 lg:max-w-xs">
				<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
					search
				</span>
				<input
					type="text"
					bind:value={busqueda}
					placeholder="Buscar por N° o periodo..."
					class="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface text-sm placeholder:text-on-surface-variant/60 border border-transparent focus:outline-none focus:border-primary-container focus:bg-white transition-all"
				/>
			</div>
		</div>

		<!-- Lista -->
		{#if cargando}
			<div class="bg-white rounded-2xl py-16 text-center">
				<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
				<p class="text-xs text-on-surface-variant mt-3">Cargando facturas...</p>
			</div>
		{:else if facturasFiltradas.length === 0}
			<div class="bg-white rounded-2xl py-16 text-center">
				<div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-3">
					<span class="material-symbols-outlined text-3xl text-on-surface-variant/50">receipt_long</span>
				</div>
				<p class="text-sm font-semibold text-on-surface">No hay facturas en esta categoría</p>
				<p class="text-xs text-on-surface-variant mt-1">Aquí verás tus facturas de comisión mensuales</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each facturasFiltradas as f (f.id_factura)}
					<article class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 {f.anulada ? 'opacity-70' : ''}">
						<!-- Header -->
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div class="flex items-center gap-2">
								<span class="font-mono text-sm font-bold text-on-surface">#{f.numero_factura}</span>
								<span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase {colorEstado(f.estado_pago)}">
									{etiquetaEstado(f.estado_pago)}
								</span>
								{#if f.tipo === 'nota_credito'}
									<span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-orange-100 text-orange-800">
										Nota de crédito
									</span>
								{/if}
							</div>
							<span class="text-xs text-on-surface-variant flex items-center gap-1">
								<span class="material-symbols-outlined text-[14px]">schedule</span>
								{formatearFecha(f.fecha)}
							</span>
						</div>

						<!-- Grid de datos -->
						<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-gray-100">
							<div>
								<p class="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Periodo</p>
								<p class="text-sm font-semibold text-on-surface">{periodoBonito(f.periodo)}</p>
							</div>
							<div>
								<p class="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Base imp.</p>
								<p class="text-sm font-semibold text-on-surface">{usd(f.base_imponible)}</p>
							</div>
							<div>
								<p class="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">IVA 16%</p>
								<p class="text-sm font-semibold text-on-surface">{usd(f.iva_16)}</p>
							</div>
							<div>
								<p class="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Total</p>
								<p class="text-base font-bold {f.total_usd < 0 ? 'text-red-600' : 'text-primary-container'}">
									{usd(f.total_usd)}
								</p>
								<p class="text-[10px] text-on-surface-variant mt-0.5">{bs(f.total_bs)}</p>
							</div>
						</div>

						<!-- Footer -->
						<div class="flex flex-wrap items-center justify-between gap-2">
							{#if f.estado_pago === 'pagada' && f.fecha_pago}
								<span class="text-[11px] text-green-700 flex items-center gap-1">
									<span class="material-symbols-outlined text-[14px]">check_circle</span>
									Pagada el {formatearFecha(f.fecha_pago)}
								</span>
							{:else if f.estado_pago === 'pendiente'}
								<span class="text-[11px] text-yellow-700 flex items-center gap-1">
									<span class="material-symbols-outlined text-[14px]">schedule</span>
									Pendiente de pago
								</span>
							{:else if f.motivo}
								<span class="text-[11px] text-on-surface-variant italic flex-1 min-w-0 truncate">
									{f.motivo}
								</span>
							{:else}
								<span></span>
							{/if}

							<a
								href="/factura/{f.id_factura}"
								class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold transition-colors"
							>
								<span class="material-symbols-outlined text-[16px] text-primary-container">receipt_long</span>
								Ver factura
							</a>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</main>
</div>