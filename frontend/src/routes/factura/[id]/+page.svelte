<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Factura from '$lib/componentes/Factura.svelte';
	import { obtenerFacturaMock } from '$lib/mock/facturas.js';

	// Cuando el backend esté listo:
	// import { api } from '$lib/api.js';

	let factura = $state(null);
	let cargando = $state(true);
	let error = $state(null);

	let id = $derived(page.params.id);

	async function cargar() {
		cargando = true;
		error = null;
		try {
			// MOCK: reemplazar por: factura = await api(`/facturas/${id}`);
			factura = await obtenerFacturaMock(id);
		} catch (err) {
			error = err.message || 'No se pudo cargar la factura';
		} finally {
			cargando = false;
		}
	}

	onMount(cargar);

	function imprimir() {
		window.print();
	}

	function volver() {
		history.back();
	}
</script>

<svelte:head>
	<title>Factura #{id} · DeliverExpress</title>
</svelte:head>

<div class="min-h-screen bg-surface-container-low py-6 px-4 print:bg-white print:p-0">
	<!-- Barra de acciones (oculta al imprimir) -->
	<div class="max-w-4xl mx-auto mb-4 flex items-center justify-between print:hidden">
		<button
			type="button"
			onclick={volver}
			class="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white text-sm font-semibold text-on-surface-variant transition-colors"
		>
			<span class="material-symbols-outlined text-[20px]">arrow_back</span>
			Volver
		</button>
		<button
			type="button"
			onclick={imprimir}
			disabled={!factura}
			class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold transition-colors disabled:opacity-50"
		>
			<span class="material-symbols-outlined text-[20px]">print</span>
			Imprimir
		</button>
	</div>

	{#if cargando}
		<div class="max-w-4xl mx-auto bg-white rounded-2xl p-12 text-center">
			<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
			<p class="text-sm text-on-surface-variant mt-3">Cargando factura...</p>
		</div>
	{:else if error}
		<div class="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
			<span class="material-symbols-outlined text-red-600 text-[32px]">error</span>
			<p class="text-sm font-bold text-red-900 mt-2">{error}</p>
			<button
				type="button"
				onclick={() => goto(-1)}
				class="mt-4 px-4 py-2 rounded-lg bg-white border border-red-200 text-red-700 text-sm font-semibold"
			>
				Volver
			</button>
		</div>
	{:else if factura}
		<Factura {factura} />
	{/if}
</div>