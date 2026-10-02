<script>
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import { CATEGORIAS } from '$lib/mock/categorias.js';
	import { RESTAURANTES } from '$lib/mock/restaurantes.js';
	import { RECOMENDACIONES } from '$lib/mock/recomendaciones.js';
	import { carrito, cantidadTotal, precioTotal } from '$lib/stores/carrito.js';

	let categoriaActiva = $state(null);
	let filtroCerca = $state(false);
	let filtroEnvioGratis = $state(false);
	let filtroCalificacion = $state(false);

	let restaurantesFiltrados = $derived.by(() => {
		let lista = RESTAURANTES;
		if (categoriaActiva !== null) lista = lista.filter((r) => r.id_categoria === categoriaActiva);
		if (filtroCerca) lista = lista.filter((r) => r.distancia_km <= 2.5);
		if (filtroEnvioGratis) lista = lista.filter((r) => r.costo_envio === 0);
		if (filtroCalificacion) lista = lista.filter((r) => r.calificacion_promedio >= 4.5);
		return lista;
	});

	function irAlRestaurante(id) {
		goto(`/cliente/restaurante/${id}`);
	}
</script>

<div class="min-h-screen bg-surface">
	<main class="max-w-[1200px] mx-auto px-4 py-6 flex flex-col gap-8">
		<!-- HERO -->
		<section class="relative rounded-2xl bg-gradient-to-r from-[#cc4900] to-[#a33900] text-white p-6 sm:p-8 overflow-hidden shadow-sm">
			<div class="relative z-10 flex flex-col sm:flex-row items-center gap-6">
				<div class="flex-1 max-w-xl">
					<span class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide">
						<span class="material-symbols-outlined text-[14px]">bolt</span>
						Entregas relámpago
					</span>
					<h1 class="text-2xl sm:text-3xl font-bold leading-tight mt-3">
						¡Disfruta tus Restaurantes Favoritos!
					</h1>
					<p class="text-sm opacity-90 mt-2">Encuentra las mejores recomendaciones cerca de ti.</p>
				</div>
				<div class="w-32 h-32 sm:w-44 sm:h-44 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-sm overflow-hidden shrink-0">
					<img
						src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80"
						alt="Comida"
						class="w-full h-full object-cover"
					/>
				</div>
			</div>
		</section>

		<!-- CATEGORÍAS -->
		<section>
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-lg font-bold text-on-surface">Explora por categoría</h2>
				<span class="text-xs text-on-surface-variant">{CATEGORIAS.length} categorías</span>
			</div>
			<div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
				<button
					onclick={() => (categoriaActiva = null)}
					class="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors
						{categoriaActiva === null
						? 'bg-primary-container text-white shadow-sm'
						: 'bg-white text-on-surface hover:bg-surface-container'}"
				>
					Todas
				</button>
				{#each CATEGORIAS as cat (cat.id_categoria)}
					<button
						onclick={() => (categoriaActiva = cat.id_categoria)}
						class="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors
							{categoriaActiva === cat.id_categoria
							? 'bg-primary-container text-white shadow-sm'
							: 'bg-white text-on-surface hover:bg-surface-container'}"
					>
						<span>{cat.emoji}</span>
						<span>{cat.nombre}</span>
					</button>
				{/each}
			</div>
		</section>

		<!-- FILTROS -->
		<section class="flex flex-wrap gap-2">
			<button
				onclick={() => (filtroCerca = !filtroCerca)}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border
					{filtroCerca
					? 'bg-primary-fixed text-on-primary-fixed border-primary'
					: 'bg-white text-on-surface border-gray-200 hover:border-primary'}"
			>
				<span class="material-symbols-outlined text-[16px]">near_me</span>
				Cerca de ti (-20 min)
			</button>
			<button
				onclick={() => (filtroEnvioGratis = !filtroEnvioGratis)}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border
					{filtroEnvioGratis
					? 'bg-primary-fixed text-on-primary-fixed border-primary'
					: 'bg-white text-on-surface border-gray-200 hover:border-primary'}"
			>
				<span class="material-symbols-outlined text-[16px]">bolt</span>
				Envío gratis
			</button>
			<button
				onclick={() => (filtroCalificacion = !filtroCalificacion)}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border
					{filtroCalificacion
					? 'bg-primary-fixed text-on-primary-fixed border-primary'
					: 'bg-white text-on-surface border-gray-200 hover:border-primary'}"
			>
				<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
				Calificación 4.5+
			</button>
		</section>

		<!-- RESTAURANTES -->
		<section>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-bold text-on-surface">
					Restaurantes
					<span class="text-sm font-normal text-on-surface-variant ml-2">
						{restaurantesFiltrados.length} disponibles
					</span>
				</h2>
			</div>

			{#if restaurantesFiltrados.length === 0}
				<div class="text-center py-16 bg-white rounded-2xl">
					<span class="material-symbols-outlined text-5xl text-on-surface-variant/40">search_off</span>
					<p class="mt-3 text-on-surface-variant">No hay restaurantes con esos filtros.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each restaurantesFiltrados as r (r.id_restaurante)}
						<article
							class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col
								{r.abierto_ahora ? '' : 'grayscale opacity-75'}"
						>
							<div class="relative w-full h-44 bg-surface-container overflow-hidden">
								<img src={r.imagen} alt={r.nombre} class="w-full h-full object-cover" />
								<div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
								<div class="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-sm">
									<span class="material-symbols-outlined text-[14px] text-primary">schedule</span>
									<span class="text-[11px] font-bold text-on-surface">{r.tiempo_prep_min} min</span>
								</div>
								{#if !r.abierto_ahora}
									<div class="absolute top-2.5 left-2.5 bg-error text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
										<span class="material-symbols-outlined text-[13px]">lock</span>
										Cerrado
									</div>
								{/if}
							</div>

							<div class="p-3.5 flex flex-col flex-1">
								<h3 class="text-base font-semibold text-on-surface truncate">{r.nombre}</h3>
								<p class="text-xs text-on-surface-variant truncate">{r.categoria}</p>

								<div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
									<div class="flex items-center gap-1">
										<span class="material-symbols-outlined text-[16px] text-amber-400" style="font-variation-settings: 'FILL' 1;">star</span>
										<span class="text-xs font-bold text-on-surface">{r.calificacion_promedio}</span>
									</div>
									<div class="flex items-center gap-1">
										<span class="material-symbols-outlined text-[15px] text-on-surface-variant">two_wheeler</span>
										{#if r.costo_envio === 0}
											<span class="text-[11px] font-bold text-green-600">Gratis</span>
										{:else}
											<span class="text-[11px] font-semibold text-on-surface">{usd(r.costo_envio)}</span>
										{/if}
									</div>
								</div>

								<button
									onclick={() => irAlRestaurante(r.id_restaurante)}
									disabled={!r.abierto_ahora}
									class="mt-3 w-full h-10 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5
										{r.abierto_ahora
										? 'bg-primary-container hover:bg-primary text-white'
										: 'bg-surface-container text-on-surface-variant cursor-not-allowed'}"
								>
									{#if r.abierto_ahora}
										<span>Ver Menú</span>
										<span class="material-symbols-outlined text-[18px]">arrow_forward</span>
									{:else}
										<span>Cerrado</span>
									{/if}
								</button>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>

		<!-- TE PUEDE GUSTAR -->
		<section>
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="text-lg font-bold text-on-surface">Te puede gustar</h2>
					<p class="text-xs text-on-surface-variant mt-0.5">Basado en tus pedidos recientes</p>
				</div>
			</div>

			<div class="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
				{#each RECOMENDACIONES as rec (rec.id_producto)}
					<div class="shrink-0 w-56 bg-white rounded-xl shadow-sm p-3 flex flex-col justify-between">
						<div>
							<div class="relative w-full h-32 rounded-lg overflow-hidden mb-2">
								<img src={rec.imagen} alt={rec.producto} class="w-full h-full object-cover" />
								<span class="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-primary">
									{rec.veces_pedido} veces
								</span>
							</div>
							<h4 class="text-sm font-bold text-on-surface line-clamp-1">{rec.producto}</h4>
							<p class="text-xs text-on-surface-variant truncate">{rec.restaurante}</p>
						</div>
						<div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
							<span class="text-base font-bold text-on-surface">{usd(rec.precio)}</span>
							<button
								class="px-3 py-1.5 bg-primary-container hover:bg-primary text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
							>
								<span class="material-symbols-outlined text-[15px]">add</span>
								Agregar
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</main>

	<!-- ═══════════ BOTÓN CARRITO FLOTANTE ═══════════ -->
	{#if $carrito.items.length > 0}
		<div class="fixed bottom-6 right-6 z-30">
			<button
				onclick={() => goto('/cliente/checkout')}
				class="flex items-center gap-3 bg-primary-container hover:bg-primary text-white px-5 py-3.5 rounded-full shadow-xl hover:scale-105 transition-all"
			>
				<div class="relative flex items-center justify-center">
					<span class="material-symbols-outlined text-[22px]">shopping_bag</span>
					<span class="absolute -top-1.5 -right-2 bg-white text-primary-container font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
						{cantidadTotal($carrito.items)}
					</span>
				</div>
				<div class="flex items-center gap-1.5 text-sm font-bold">
					<span>Ver carrito</span>
					<span class="opacity-70">·</span>
					<span>{cantidadTotal($carrito.items)} {cantidadTotal($carrito.items) === 1 ? 'producto' : 'productos'}</span>
					<span class="opacity-70">·</span>
					<span class="text-white/90">{usd(precioTotal($carrito.items))}</span>
				</div>
			</button>
		</div>
	{/if}
</div>