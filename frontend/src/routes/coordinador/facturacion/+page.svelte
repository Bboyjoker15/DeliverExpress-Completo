<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import { mostrarToast } from '$lib/toast.js';
	import { api } from '$lib/api.js';

	let pestana = $state('facturas');
	let cargando = $state(true);
	let facturas = $state([]);
	let libro = $state([]);
	let resumenIva = $state([]);
	let liquidaciones = $state([]);

	let filtroTipo = $state('todas');
	let filtroFecha = $state('');

	let anularAbierto = $state(false);
	let facturaAAnular = $state(null);
	let motivoAnulacion = $state('');

	async function recargar() {
		cargando = true;
		try {
			[facturas, libro, resumenIva, liquidaciones] = await Promise.all([
				api('/api/coordinador/facturas'),
				api('/api/coordinador/libro-ventas'),
				api('/api/coordinador/resumen-iva'),
				api('/api/coordinador/liquidaciones')
			]);
		} catch (err) {
			mostrarToast('error', err.message);
		} finally {
			cargando = false;
		}
	}

	onMount(recargar);

	let facturasFiltradas = $derived(
		facturas.filter((f) => {
			if (filtroTipo !== 'todas' && f.tipo !== filtroTipo) return false;
			if (filtroFecha && !String(f.fecha_emision).startsWith(filtroFecha)) return false;
			return true;
		})
	);

	let totalVentas = $derived(
		libro.filter((l) => l.tipo !== 'nota_credito').reduce((s, l) => s + (l.total ?? 0), 0)
	);
	let totalNotas = $derived(
		libro.filter((l) => l.tipo === 'nota_credito').reduce((s, l) => s + (l.total ?? 0), 0)
	);

	function abrirAnular(f) {
		facturaAAnular = f;
		motivoAnulacion = '';
		anularAbierto = true;
	}

	async function confirmarAnular() {
		if (!motivoAnulacion.trim()) {
			mostrarToast('error', 'Escribe el motivo');
			return;
		}
		try {
			await api(`/api/coordinador/facturas/${facturaAAnular.id_factura}/anular`, {
				metodo: 'POST',
				cuerpo: { motivo: motivoAnulacion.trim() }
			});
			mostrarToast('exito', 'Factura anulada (nota de crédito generada)');
			anularAbierto = false;
			await recargar();
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}

	function etiquetaTipo(tipo) {
		if (tipo === 'nota_credito') return 'N. Crédito';
		if (tipo === 'factura_comision') return 'Comisión';
		return 'Factura';
	}

	function fechaCorta(iso) {
		return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head><title>Facturación · Coordinador</title></svelte:head>

<div class="min-h-screen bg-surface">
	<main class="max-w-[1200px] mx-auto px-4 py-5 flex flex-col gap-5">

		<button
			type="button"
			onclick={() => goto('/coordinador')}
			class="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary-container self-start"
		>
			<span class="material-symbols-outlined text-[20px]">arrow_back</span>
			Volver al panel
		</button>

		<section class="bg-white rounded-2xl shadow-sm p-5">
			<h1 class="text-lg font-bold text-on-surface">Facturación</h1>
			<p class="text-xs text-on-surface-variant mt-0.5">Facturas, libro de ventas y liquidaciones</p>
		</section>

		<div class="flex gap-2 border-b border-gray-200 overflow-x-auto">
			{#each [
				{ id: 'facturas', label: 'Facturas' },
				{ id: 'libro', label: 'Libro de ventas' },
				{ id: 'liquidaciones', label: 'Liquidaciones' }
			] as tab (tab.id)}
				<button
					onclick={() => (pestana = tab.id)}
					class="px-4 py-2 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap
						{pestana === tab.id
							? 'border-primary-container text-primary-container'
							: 'border-transparent text-on-surface-variant hover:text-on-surface'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if cargando}
			<div class="text-center py-16">
				<div class="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full mx-auto"></div>
			</div>
		{:else if pestana === 'facturas'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
				<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tipo</span>
						<select
							bind:value={filtroTipo}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm"
						>
							<option value="todas">Todas</option>
							<option value="factura_cliente">Facturas cliente</option>
							<option value="factura_comision">Facturas comisión</option>
							<option value="nota_credito">Notas de crédito</option>
						</select>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Fecha</span>
						<input
							type="date"
							bind:value={filtroFecha}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm"
						/>
					</label>
					<div class="ml-auto text-xs text-on-surface-variant self-end">
						{facturasFiltradas.length} resultados
					</div>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">N°</th>
								<th class="py-2 px-3">Receptor</th>
								<th class="py-2 px-3">Fecha</th>
								<th class="py-2 px-3">Tipo</th>
								<th class="py-2 px-3 text-right">Total $</th>
								<th class="py-2 px-3 text-right">Total Bs.</th>
								<th class="py-2 px-3 text-center w-32">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each facturasFiltradas as f (f.id_factura)}
								<tr class="border-b border-gray-100 {f.estado === 'anulada' ? 'opacity-50' : ''}">
									<td class="py-2 px-3 font-mono text-xs text-on-surface">
										{f.numero_factura}
										{#if f.estado === 'anulada'}
											<span class="ml-1 text-[10px] text-red-600 font-bold">ANULADA</span>
										{/if}
									</td>
									<td class="py-2 px-3 text-on-surface">{f.razon_social_receptor}</td>
									<td class="py-2 px-3 text-on-surface-variant text-xs">{fechaCorta(f.fecha_emision)}</td>
									<td class="py-2 px-3">
										<span class="text-[10px] font-bold px-2 py-0.5 rounded-full
											{f.tipo === 'nota_credito' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}">
											{etiquetaTipo(f.tipo)}
										</span>
									</td>
									<td class="py-2 px-3 text-right font-bold text-on-surface">
										{usd(f.total)}
									</td>
									<td class="py-2 px-3 text-right text-xs text-on-surface-variant">
										Bs. {Number(f.total_ves ?? 0).toFixed(2)}
									</td>
									<td class="py-2 px-3">
										<div class="flex gap-1.5 justify-center">
											<a
												href={`/factura/${f.id_factura}`}
												class="text-[11px] font-semibold text-primary-container border border-primary-container/40 rounded-md px-2 py-0.5 hover:bg-primary-fixed/30"
											>
												Ver
											</a>
											{#if f.estado === 'emitida' && f.tipo !== 'nota_credito'}
												<button
													onclick={() => abrirAnular(f)}
													class="text-[11px] font-semibold text-red-600 border border-red-200 rounded-md px-2 py-0.5 hover:bg-red-50"
												>
													Anular
												</button>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else if pestana === 'libro'}
			<section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Ventas brutas</p>
					<p class="text-2xl font-bold text-on-surface mt-1">{usd(totalVentas)}</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Notas de crédito</p>
					<p class="text-2xl font-bold text-red-600 mt-1">{usd(totalNotas)}</p>
				</div>
				<div class="bg-white rounded-2xl shadow-sm p-5">
					<p class="text-xs text-on-surface-variant">Ventas netas</p>
					<p class="text-2xl font-bold text-green-700 mt-1">{usd(totalVentas - totalNotas)}</p>
				</div>
			</section>

			<section class="bg-white rounded-2xl shadow-sm p-5">
				<h3 class="text-sm font-bold text-on-surface mb-3">Libro de ventas</h3>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Fecha</th>
								<th class="py-2 px-3">N°</th>
								<th class="py-2 px-3">Receptor</th>
								<th class="py-2 px-3 text-right">Base imponible</th>
								<th class="py-2 px-3 text-right">IVA 16%</th>
								<th class="py-2 px-3 text-right">Exento</th>
								<th class="py-2 px-3 text-right">No sujeto</th>
								<th class="py-2 px-3 text-right">IGTF 3%</th>
								<th class="py-2 px-3 text-right">Total $</th>
							</tr>
						</thead>
						<tbody>
							{#each libro as l (`${l.numero_factura}-${l.tipo}`)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 text-xs text-on-surface-variant">{fechaCorta(l.fecha_emision)}</td>
									<td class="py-2 px-3 font-mono text-xs text-on-surface">{l.numero_factura}</td>
									<td class="py-2 px-3 text-on-surface">{l.razon_social_receptor}</td>
									<td class="py-2 px-3 text-right">{usd(l.base_imponible_16)}</td>
									<td class="py-2 px-3 text-right font-bold text-primary-container">{usd(l.iva_16)}</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{usd(l.base_exenta)}</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{usd(l.monto_no_sujeto)}</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{usd(l.igtf)}</td>
									<td class="py-2 px-3 text-right font-bold">{usd(l.total)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<section class="bg-white rounded-2xl shadow-sm p-5">
				<h3 class="text-sm font-bold text-on-surface mb-3">Resumen de IVA por período</h3>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Período</th>
								<th class="py-2 px-3 text-right">Documentos</th>
								<th class="py-2 px-3 text-right">Base imponible</th>
								<th class="py-2 px-3 text-right">IVA débito</th>
								<th class="py-2 px-3 text-right">Exento</th>
								<th class="py-2 px-3 text-right">IGTF</th>
								<th class="py-2 px-3 text-right">Total $</th>
							</tr>
						</thead>
						<tbody>
							{#each resumenIva as r (r.periodo)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-semibold text-on-surface">{r.periodo}</td>
									<td class="py-2 px-3 text-right">{r.cantidad_documentos}</td>
									<td class="py-2 px-3 text-right">{usd(r.base_imponible_16)}</td>
									<td class="py-2 px-3 text-right font-bold text-primary-container">{usd(r.iva_debito)}</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{usd(r.base_exenta)}</td>
									<td class="py-2 px-3 text-right text-on-surface-variant">{usd(r.igtf)}</td>
									<td class="py-2 px-3 text-right font-bold">{usd(r.total)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{:else if pestana === 'liquidaciones'}
			<section class="bg-white rounded-2xl shadow-sm p-5">
				<h3 class="text-sm font-bold text-on-surface mb-3">Liquidaciones de repartidores</h3>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">N°</th>
								<th class="py-2 px-3">Repartidor</th>
								<th class="py-2 px-3">Período</th>
								<th class="py-2 px-3 text-right">Viajes</th>
								<th class="py-2 px-3 text-right">Envíos</th>
								<th class="py-2 px-3 text-right">Propinas</th>
								<th class="py-2 px-3 text-right">Total</th>
							</tr>
						</thead>
						<tbody>
							{#each liquidaciones as l (l.id_liquidacion)}
								<tr class="border-b border-gray-100">
									<td class="py-2 px-3 font-mono text-xs text-on-surface">{l.numero}</td>
									<td class="py-2 px-3 font-semibold text-on-surface">{l.repartidor}</td>
									<td class="py-2 px-3 text-xs text-on-surface-variant">{l.periodo_desde} → {l.periodo_hasta}</td>
									<td class="py-2 px-3 text-right">{l.viajes}</td>
									<td class="py-2 px-3 text-right">{usd(l.total_envios)}</td>
									<td class="py-2 px-3 text-right text-green-700">{usd(l.total_propinas)}</td>
									<td class="py-2 px-3 text-right font-bold text-primary-container">{usd(l.total)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	</main>

	{#if anularAbierto}
		<div
			class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (anularAbierto = false)}
		>
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-red-600">warning</span>
					</div>
					<div>
						<h3 class="text-base font-bold text-on-surface">¿Anular factura?</h3>
						<p class="text-xs text-on-surface-variant mt-0.5">
							Se generará una nota de crédito automáticamente.
						</p>
					</div>
				</div>
				<p class="text-sm text-on-surface">
					Factura <span class="font-bold font-mono">{facturaAAnular?.numero_factura}</span> ·
					<span class="font-bold">{facturaAAnular?.razon_social_receptor}</span>
				</p>
				<label class="flex flex-col gap-1">
					<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Motivo</span>
					<textarea
						bind:value={motivoAnulacion}
						rows="3"
						placeholder="Ej: error en monto, pedido cancelado..."
						class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container resize-none"
					></textarea>
				</label>
				<div class="flex justify-end gap-2">
					<button
						onclick={() => (anularAbierto = false)}
						class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
					>
						Volver
					</button>
					<button
						onclick={confirmarAnular}
						class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
					>
						Anular
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
