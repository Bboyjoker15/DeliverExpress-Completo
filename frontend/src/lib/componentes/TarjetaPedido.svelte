<script>
	import EstadoBadge from './EstadoBadge.svelte';
	import { usd } from '$lib/formato.js';

	let {
		pedido,
		modo = 'cliente', // 'cliente' | 'restaurante' | 'coordinador'
		onClick = null,
		acciones = null // snippet con botones opcionales
	} = $props();

	let esClickeable = $derived(typeof onClick === 'function');

	function horaCorta(iso) {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
	}

	function totalProductos(p) {
		return (p.productos ?? []).reduce((acc, x) => acc + (x.cantidad ?? 1), 0);
	}

	function click() {
		if (esClickeable) onClick(pedido);
	}
</script>

<svelte:element
	this={esClickeable ? 'button' : 'div'}
	type={esClickeable ? 'button' : undefined}
	onclick={click}
	class="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 transition-all
		{esClickeable ? 'hover:shadow-md hover:border-primary-container/40 cursor-pointer' : ''}"
>
	<!-- Cabecera: ID + estado + hora -->
	<div class="flex items-start justify-between gap-2">
		<div class="min-w-0">
			<div class="flex items-center gap-2">
				<span class="font-bold text-on-surface text-sm">#{pedido.id_pedido}</span>
				<EstadoBadge codigo={pedido.estado} />
			</div>
			<p class="text-[11px] text-on-surface-variant mt-0.5">
				{horaCorta(pedido.fecha_creacion)}
				{#if pedido.minutos_en_estado != null}
					· hace {pedido.minutos_en_estado} min
				{/if}
			</p>
		</div>
		<div class="text-right shrink-0">
			<p class="font-bold text-on-surface text-sm">{usd(pedido.total)}</p>
			{#if pedido.tiempo_estimado_min}
				<p class="text-[11px] text-on-surface-variant">~{pedido.tiempo_estimado_min} min</p>
			{/if}
		</div>
	</div>

	<!-- Restaurante / cliente según modo -->
	<div class="flex flex-col gap-1 text-xs text-on-surface-variant">
		{#if modo === 'cliente'}
			<div class="flex items-center gap-1.5">
				<span class="material-symbols-outlined text-[14px] text-primary-container">storefront</span>
				<span class="font-semibold text-on-surface truncate">
					{pedido.restaurante?.nombre ?? 'Restaurante'}
				</span>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="material-symbols-outlined text-[14px]">shopping_bag</span>
				<span>{totalProductos(pedido)} productos</span>
			</div>
		{:else if modo === 'restaurante'}
			<div class="flex items-center gap-1.5">
				<span class="material-symbols-outlined text-[14px]">person</span>
				<span class="font-semibold text-on-surface truncate">
					{pedido.cliente?.nombre ?? 'Cliente'}
				</span>
			</div>
			{#if pedido.cliente?.direccion}
				<div class="flex items-start gap-1.5">
					<span class="material-symbols-outlined text-[14px] shrink-0">location_on</span>
					<span class="line-clamp-2 leading-snug">{pedido.cliente.direccion}</span>
				</div>
			{/if}
			{#if pedido.repartidor?.nombre}
				<div class="flex items-center gap-1.5">
					<span class="material-symbols-outlined text-[14px] text-purple-600">two_wheeler</span>
					<span class="text-purple-700 font-medium">
						{pedido.repartidor.nombre} · {pedido.repartidor.vehiculo ?? ''}
					</span>
				</div>
			{/if}
		{:else if modo === 'coordinador'}
			<div class="flex items-center gap-1.5">
				<span class="material-symbols-outlined text-[14px] text-primary-container">storefront</span>
				<span class="truncate">{pedido.restaurante?.nombre ?? '—'}</span>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="material-symbols-outlined text-[14px] text-purple-600">location_on</span>
				<span class="truncate">{pedido.cliente?.direccion ?? '—'}</span>
			</div>
			{#if !pedido.repartidor?.id && (pedido.estado === 'en_preparacion' || pedido.estado === 'listo_para_retirar')}
				<span class="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
					SIN REPARTIDOR
				</span>
			{/if}
		{/if}
	</div>

	<!-- Snippet de acciones -->
	{#if acciones}
		<div class="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
			{@render acciones(pedido)}
		</div>
	{/if}
</svelte:element>