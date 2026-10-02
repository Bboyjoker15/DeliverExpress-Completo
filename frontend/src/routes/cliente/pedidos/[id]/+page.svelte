<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { usd } from '$lib/formato.js';
	import { mostrarToast } from '$lib/toast.js';
	import { sesion } from '$lib/stores/sesion.js';
	import EstadoBadge from '$lib/componentes/EstadoBadge.svelte';
	import LineaEstados from '$lib/componentes/LineaEstados.svelte';
	import Estrellas from '$lib/componentes/Estrellas.svelte';
	import {
		obtenerPedidoPorId,
		marcarCalificacionHecha,
		actualizarEstadoPedido,
		cancelarPedido
	} from '$lib/stores/pedidos.js';
	import { agregarResena } from '$lib/stores/resenas.js';

	const idPedido = Number(page.params.id);
	const pedidoStore = obtenerPedidoPorId(idPedido);
	let pedido = $derived($pedidoStore);

	// Calificaciones
	let puntajeRepartidor = $state(5);
	let comentarioRepartidor = $state('');
	let puntajeRestaurante = $state(5);
	let comentarioRestaurante = $state('');

	// Modales
	let modalCancelar = $state(false);
	let modalEnProceso = $state(false);
	let modalLlamada = $state(false);
	let motivoCancelar = $state('');

	const REPARTIDOR_SIMULADO = {
		id_repartidor: 99,
		nombre: 'Alejandro Morales',
		telefono: '+58 412 889-1234',
		tipo_vehiculo: 'Moto Empire Keeway 150cc',
		calificacion_promedio: 4.9,
		latitud_actual: 8.295,
		longitud_actual: -62.735
	};

	function formatearFecha(iso) {
		if (!iso) return '—';
		return new Date(iso).toLocaleString('es-VE', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function enviarCalificacion(tipo) {
		const esRepartidor = tipo === 'cliente_a_repartidor';

		if (esRepartidor) {
			marcarCalificacionHecha(idPedido, tipo);
			mostrarToast('exito', '¡Gracias por calificar al repartidor!');
		} else {
			agregarResena(pedido.id_restaurante, {
				cliente_nombre: $sesion.nombre || 'Cliente',
				puntaje: puntajeRestaurante,
				comentario: comentarioRestaurante
			});
			marcarCalificacionHecha(idPedido, tipo);
			mostrarToast('exito', '¡Gracias por calificar al restaurante!');
			comentarioRestaurante = '';
			puntajeRestaurante = 5;
		}
	}

	function avanzarEstado() {
		if (!pedido) return;

		const mapa = {
			1: { id: 2, codigo: 'en_preparacion', nombre: 'En preparación', asignarRepartidor: false },
			2: { id: 3, codigo: 'listo_para_retirar', nombre: 'Listo para retirar', asignarRepartidor: false },
			3: { id: 4, codigo: 'en_camino', nombre: 'En camino', asignarRepartidor: true },
			4: { id: 5, codigo: 'entregado', nombre: 'Entregado', asignarRepartidor: false }
		};

		const next = mapa[pedido.id_estado];
		if (!next) return;

		actualizarEstadoPedido(idPedido, next.codigo, next.nombre, next.id, {
			repartidor: next.asignarRepartidor ? REPARTIDOR_SIMULADO : undefined
		});

		mostrarToast('info', `Pedido actualizado a "${next.nombre}"`);
	}

	function intentarCancelar() {
		if (!pedido) return;
		if (pedido.id_estado === 1) {
			modalCancelar = true;
		} else if ([2, 3].includes(pedido.id_estado)) {
			modalEnProceso = true;
		}
	}

	function confirmarCancelacion() {
		if (!motivoCancelar.trim()) {
			mostrarToast('error', 'Escribe el motivo de la cancelación');
			return;
		}
		cancelarPedido(idPedido, motivoCancelar);
		modalCancelar = false;
		mostrarToast('exito', 'Pedido cancelado');
	}

	function abrirLlamada() {
		modalLlamada = true;
	}

	async function copiarNumero() {
		if (!pedido?.repartidor?.telefono) return;
		try {
			await navigator.clipboard.writeText(pedido.repartidor.telefono);
			mostrarToast('exito', 'Número copiado al portapapeles');
		} catch {
			mostrarToast('error', 'No se pudo copiar el número');
		}
	}

	let puedeSeguir = $derived(pedido && [4].includes(pedido.id_estado));
</script>

{#if !pedido}
	<div class="min-h-screen bg-surface flex items-center justify-center">
		<div class="text-center">
			<span class="material-symbols-outlined text-6xl text-on-surface-variant/40">error</span>
			<h1 class="text-2xl font-bold text-on-surface mt-4">Pedido no encontrado</h1>
			<p class="text-sm text-on-surface-variant mt-2">El pedido #{idPedido} no existe</p>
			<button
				onclick={() => goto('/cliente/pedidos')}
				class="mt-6 px-5 py-2.5 bg-primary-container text-white rounded-lg font-semibold"
			>
				Volver a mis pedidos
			</button>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-surface pb-12">
		<div class="max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-4">
			<!-- Breadcrumb -->
			<nav class="flex items-center gap-1.5 text-xs text-on-surface-variant">
				<a href="/cliente" class="hover:text-primary-container transition-colors">Inicio</a>
				<span class="material-symbols-outlined text-[14px]">chevron_right</span>
				<a href="/cliente/pedidos" class="hover:text-primary-container transition-colors">Mis Pedidos</a>
				<span class="material-symbols-outlined text-[14px]">chevron_right</span>
				<span class="text-on-surface font-semibold">Pedido #{pedido.id_pedido}</span>
			</nav>

			<!-- Card 1: Encabezado -->
			<article class="bg-white rounded-xl p-5 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<h1 class="text-2xl font-bold text-on-surface">Pedido #{pedido.id_pedido}</h1>
						<EstadoBadge codigo={pedido.estado_codigo} />
					</div>
					<div class="flex items-center gap-2 text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full">
						<span class="material-symbols-outlined text-primary-container text-[18px]">schedule</span>
						<span class="text-sm font-semibold text-on-surface">
							{formatearFecha(pedido.fecha_creacion)}
						</span>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
					{#if [1, 2, 3, 4].includes(pedido.id_estado)}
						<button
							type="button"
							onclick={avanzarEstado}
							class="text-xs font-semibold text-primary-container hover:underline flex items-center gap-1"
						>
							<span class="material-symbols-outlined text-[16px]">fast_forward</span>
							Simular siguiente estado (demo)
						</button>
					{/if}

					{#if [1, 2, 3].includes(pedido.id_estado)}
						<button
							type="button"
							onclick={intentarCancelar}
							class="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 ml-auto"
						>
							<span class="material-symbols-outlined text-[16px]">cancel</span>
							Cancelar pedido
						</button>
					{/if}
				</div>

				{#if [2, 3].includes(pedido.id_estado)}
					<div class="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
						<span class="material-symbols-outlined text-yellow-700 text-[20px] shrink-0">info</span>
						<p class="text-xs text-yellow-900">
							<strong>Tu orden está en proceso.</strong> Si necesitas cancelarla, contacta a soporte al
							<span class="font-bold">+58 800-DELIVER</span>.
						</p>
					</div>
				{/if}
			</article>

			<!-- Card 2: Timeline -->
			<article class="bg-white rounded-xl p-5 shadow-sm">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-base font-bold text-on-surface">Estado del pedido</h2>
					{#if [1, 2, 3, 4].includes(pedido.id_estado)}
						<span class="flex items-center gap-1 text-tertiary text-[11px] font-semibold">
							<span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
							En vivo
						</span>
					{/if}
				</div>
				<LineaEstados historial={pedido.historial || []} estadoActual={pedido.estado_codigo} />
			</article>

			<!-- Card 3: Repartidor -->
			{#if pedido.repartidor}
				<article class="bg-white rounded-xl p-5 shadow-sm">
					<div class="flex items-center gap-4">
						<div class="relative w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-bold text-lg shrink-0">
							{pedido.repartidor.nombre?.charAt(0) || 'R'}
							<span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white"></span>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<h3 class="text-base font-bold text-on-surface">{pedido.repartidor.nombre}</h3>
								<span class="bg-secondary-fixed text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
									Repartidor
								</span>
								{#if pedido.repartidor.calificacion_promedio}
									<span class="text-[11px] text-on-surface-variant flex items-center gap-0.5">
										<span class="material-symbols-outlined text-[14px] text-amber-400" style="font-variation-settings: 'FILL' 1;">star</span>
										{pedido.repartidor.calificacion_promedio}
									</span>
								{/if}
							</div>
							<p class="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
								<span class="material-symbols-outlined text-[14px]">two_wheeler</span>
								{pedido.repartidor.tipo_vehiculo || 'Moto'}
							</p>
						</div>
						{#if pedido.repartidor.telefono && pedido.id_estado === 4}
                            <button
                                type="button"
                                onclick={abrirLlamada}
                                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-container hover:bg-primary text-white font-semibold text-xs transition-colors shrink-0"
                            >
                                <span class="material-symbols-outlined text-[16px]">call</span>
                                Llamar
                            </button>
                         	{/if}
					</div>

					{#if puedeSeguir && pedido.id_estado !== 5 && pedido.id_estado !== 6}
						<div class="mt-4 pt-4 border-t border-gray-100">
							<button
								type="button"
								onclick={() => goto(`/cliente/pedidos/${idPedido}/seguimiento`)}
								class="w-full h-11 bg-primary-container hover:bg-primary text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
							>
								<span class="material-symbols-outlined text-[20px]">location_on</span>
								Seguir mi pedido
								<span class="material-symbols-outlined text-[18px]">arrow_forward</span>
							</button>
						</div>
					{/if}
				</article>
			{/if}

			<!-- Card 4: Detalle del pedido -->
			<article class="bg-white rounded-xl p-5 shadow-sm">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2">
						<img src={pedido.imagen} alt={pedido.nombre} class="w-10 h-10 object-cover rounded-lg" />
						<h2 class="text-base font-bold text-on-surface">{pedido.nombre}</h2>
					</div>
					<a
						href="/cliente/restaurante/{pedido.id_restaurante}"
						class="text-xs font-semibold text-primary-container hover:underline"
					>
						Ver menú
					</a>
				</div>

				<div class="flex flex-col divide-y divide-gray-100">
					{#each pedido.detalle as d (d.id_producto)}
						<div class="py-3 flex items-center justify-between gap-3">
							<div class="min-w-0">
								<p class="text-sm font-semibold text-on-surface truncate">
									{d.cantidad}x {d.nombre}
								</p>
								<p class="text-[11px] text-on-surface-variant">
									{usd(d.precio_unitario)} c/u
								</p>
							</div>
							<span class="text-sm font-bold text-on-surface">{usd(d.subtotal)}</span>
						</div>
					{/each}
				</div>

				<div class="mt-4 pt-4 border-t border-gray-100 bg-surface-container-low rounded-lg p-4 flex flex-col gap-2">
					<div class="flex justify-between text-sm">
						<span class="text-on-surface-variant">Subtotal productos</span>
						<span class="font-semibold text-on-surface">{usd(pedido.subtotal)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-on-surface-variant">Costo de envío</span>
						<span class="font-semibold text-on-surface">{usd(pedido.costo_envio)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-on-surface-variant">Propina al repartidor</span>
						<span class="font-semibold text-on-surface">{usd(pedido.propina)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-on-surface-variant">IVA (16%)</span>
						<span class="font-semibold text-on-surface">{usd(pedido.iva_total)}</span>
					</div>
					{#if pedido.igtf > 0}
						<div class="flex justify-between text-sm">
							<span class="text-on-surface-variant">IGTF (3%)</span>
							<span class="font-semibold text-on-surface">{usd(pedido.igtf)}</span>
						</div>
					{/if}
					<div class="pt-3 mt-2 border-t border-gray-200 flex items-baseline justify-between">
						<span class="text-base font-bold text-on-surface">Total pagado</span>
						<span class="text-2xl font-bold text-primary-container">{usd(pedido.total)}</span>
					</div>
				</div>

				{#if pedido.id_factura}
					<div class="mt-4 pt-4 border-t border-gray-100">
						<button
							onclick={() => goto(`/factura/${pedido.id_factura}`)}
							class="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm rounded-lg transition-colors"
						>
							<span class="material-symbols-outlined text-[18px] text-primary-container">receipt_long</span>
							Ver factura #{pedido.id_factura}
						</button>
					</div>
				{/if}
			</article>

			<!-- Card 5: Calificaciones -->
			{#if pedido.estado_codigo === 'entregado'}
				<article class="bg-white rounded-xl p-5 shadow-sm">
					<h2 class="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
						<span class="material-symbols-outlined text-secondary">reviews</span>
						Califica tu experiencia
					</h2>

					{#if !pedido.calificaciones_hechas?.includes('cliente_a_repartidor')}
						<div class="bg-surface-container-low rounded-xl p-4 mb-3">
							<p class="text-sm font-semibold text-on-surface mb-3">¿Cómo fue la entrega?</p>
							<Estrellas bind:valor={puntajeRepartidor} tamaño="lg" />
							<textarea
								bind:value={comentarioRepartidor}
								placeholder="Cuéntanos cómo fue el servicio del repartidor..."
								rows="2"
								class="w-full mt-3 p-3 rounded-lg bg-white border border-gray-200 text-sm resize-none focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
							></textarea>
							<div class="flex justify-end mt-3">
								<button
									onclick={() => enviarCalificacion('cliente_a_repartidor')}
									class="px-5 py-2 bg-primary-container hover:bg-primary text-white text-sm font-semibold rounded-lg transition-colors"
								>
									Enviar calificación
								</button>
							</div>
						</div>
					{:else}
						<div class="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 mb-3">
							<span class="material-symbols-outlined text-green-600">check_circle</span>
							<p class="text-sm text-green-800">Calificación al repartidor enviada</p>
						</div>
					{/if}

					{#if !pedido.calificaciones_hechas?.includes('cliente_a_restaurante')}
						<div class="bg-surface-container-low rounded-xl p-4">
							<p class="text-sm font-semibold text-on-surface mb-3">
								¿Qué tal estuvo la comida de {pedido.nombre}?
							</p>
							<Estrellas bind:valor={puntajeRestaurante} tamaño="lg" />
							<textarea
								bind:value={comentarioRestaurante}
								placeholder="Cuéntanos sobre la preparación y presentación..."
								rows="2"
								class="w-full mt-3 p-3 rounded-lg bg-white border border-gray-200 text-sm resize-none focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
							></textarea>
							<div class="flex justify-end mt-3">
								<button
									onclick={() => enviarCalificacion('cliente_a_restaurante')}
									class="px-5 py-2 bg-primary-container hover:bg-primary text-white text-sm font-semibold rounded-lg transition-colors"
								>
									Enviar calificación
								</button>
							</div>
						</div>
					{:else}
						<div class="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
							<span class="material-symbols-outlined text-green-600">check_circle</span>
							<p class="text-sm text-green-800">Calificación al restaurante enviada</p>
						</div>
					{/if}
				</article>
			{/if}

			<!-- Card 6: Motivo cancelación -->
			{#if pedido.motivo_cancelacion}
				<article class="bg-red-50 border border-red-200 rounded-xl p-5">
					<div class="flex items-start gap-3">
						<span class="material-symbols-outlined text-red-600 text-[24px] shrink-0">cancel</span>
						<div>
							<h3 class="text-sm font-bold text-red-900">Pedido cancelado</h3>
							<p class="text-sm text-red-800 mt-1">{pedido.motivo_cancelacion}</p>
						</div>
					</div>
				</article>
			{/if}

			<button
				onclick={() => goto('/cliente/pedidos')}
				class="self-start flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary-container transition-colors"
			>
				<span class="material-symbols-outlined text-[18px]">arrow_back</span>
				Volver a mis pedidos
			</button>
		</div>
	</div>

	<!-- MODAL: Cancelar -->
	{#if modalCancelar}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div class="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
				<div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-[24px]">warning</span>
				</div>
				<h3 class="text-lg font-bold text-on-surface mb-2">¿Cancelar este pedido?</h3>
				<p class="text-sm text-on-surface-variant mb-4">
					El pedido aún no ha entrado a preparación. Escribe el motivo para continuar.
				</p>
				<textarea
					bind:value={motivoCancelar}
					placeholder="Ej: Me equivoqué en la dirección..."
					rows="3"
					class="w-full p-3 rounded-lg bg-surface-container-low border border-gray-200 text-sm resize-none focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
				></textarea>
				<div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 mt-5">
					<button
						type="button"
						onclick={() => (modalCancelar = false)}
						class="w-full sm:w-auto px-5 py-2.5 rounded-lg text-on-surface hover:bg-surface-container font-semibold text-sm transition-colors"
					>
						No cancelar
					</button>
					<button
						type="button"
						onclick={confirmarCancelacion}
						class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
					>
						Sí, cancelar pedido
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- MODAL: En proceso -->
	{#if modalEnProceso}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div class="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
				<div class="w-12 h-12 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-[24px]">support_agent</span>
				</div>
				<h3 class="text-lg font-bold text-on-surface mb-2">Tu orden está en proceso</h3>
				<p class="text-sm text-on-surface-variant mb-4">
					El restaurante ya comenzó a preparar tu pedido. Para cancelarlo necesitas contactar a soporte:
				</p>
				<div class="bg-surface-container-low rounded-lg p-3 flex items-center gap-3 mb-4">
					<span class="material-symbols-outlined text-primary-container text-[24px]">call</span>
					<div>
						<p class="text-xs text-on-surface-variant">Línea de soporte 24/7</p>
						<p class="text-base font-bold text-on-surface">+58 800-DELIVER</p>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (modalEnProceso = false)}
					class="w-full h-11 bg-surface-container text-on-surface font-semibold text-sm rounded-lg hover:bg-surface-container-high transition-colors"
				>
					Entendido
				</button>
			</div>
		</div>
	{/if}

	<!-- MODAL: Llamar al repartidor (solo copiar) -->
	{#if modalLlamada && pedido?.repartidor}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div class="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl text-center">
				<div class="w-16 h-16 mx-auto rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-bold text-2xl mb-4">
					{pedido.repartidor.nombre?.charAt(0) || 'R'}
				</div>
				<h3 class="text-lg font-bold text-on-surface">{pedido.repartidor.nombre}</h3>
				<p class="text-xs text-on-surface-variant mt-0.5">
					{pedido.repartidor.tipo_vehiculo || 'Repartidor'}
				</p>

				<div class="bg-surface-container-low rounded-xl p-4 mt-5">
					<p class="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">Teléfono</p>
					<p class="text-xl font-bold text-on-surface tracking-wide">
						{pedido.repartidor.telefono}
					</p>
				</div>

				<div class="flex flex-col gap-2 mt-5">
					<button
						type="button"
						onclick={copiarNumero}
						class="w-full h-11 bg-primary-container hover:bg-primary text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
					>
						<span class="material-symbols-outlined text-[18px]">content_copy</span>
						Copiar número
					</button>
					<button
						type="button"
						onclick={() => (modalLlamada = false)}
						class="w-full h-11 text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low rounded-lg transition-colors"
					>
						Cerrar
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}