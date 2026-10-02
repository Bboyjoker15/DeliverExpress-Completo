<script>
	import { goto } from '$app/navigation';
	import { usd, bs } from '$lib/formato.js';
	import { mostrarToast } from '$lib/toast.js';
	import { carrito, cantidadTotal, precioTotal, vaciarCarrito } from '$lib/stores/carrito.js';
	import { direcciones } from '$lib/stores/direcciones.js';
	import { cotizarMock } from '$lib/mock/cotizacion.js';
	import { crearPedidoMock } from '$lib/mock/crear-pedido.js';
	import { agregarPedido } from '$lib/stores/pedidos.js';

	// ───── Estado ─────
	let propina = $state(2);
	let propinaPersonalizada = $state(false);
	let propinaOtro = $state(0);
	let moneda = $state('USD');
	let cotizacion = $state(null);
	let cotizando = $state(false);
	let confirmando = $state(false);

	// Tarjeta
	let numeroTarjeta = $state('');
	let vencimiento = $state('');
	let cvv = $state('');
	let titular = $state('');

	// Dirección
	let direccionActual = $state(null);

	$effect(() => {
		if (!direccionActual && $direcciones.length > 0) {
			direccionActual = $direcciones.find((d) => d.principal) || $direcciones[0] || null;
		}
	});

	let modalDireccion = $state(false);

	// Guard
	$effect(() => {
		if ($carrito.items.length === 0 && !confirmando) {
			goto('/cliente');
		}
	});

	// Cotización reactiva
	$effect(() => {
		const propinaFinal = propinaPersonalizada ? propinaOtro : propina;
		if ($carrito.items.length > 0) {
			refrescarCotizacion(propinaFinal);
		}
	});

	async function refrescarCotizacion(propinaFinal) {
		cotizando = true;
		try {
			cotizacion = await cotizarMock({
				propina: Number(propinaFinal),
				moneda_pago: moneda
			});
		} catch (err) {
			mostrarToast('error', err.message);
		} finally {
			cotizando = false;
		}
	}

	function elegirPropina(valor) {
		propinaPersonalizada = false;
		propina = valor;
	}

	function abrirOtro() {
		propinaPersonalizada = true;
		if (propinaOtro === 0) propinaOtro = 5;
	}

	function elegirMoneda(m) {
		moneda = m;
	}

	// ═══════ Formateo tarjeta ═══════
	function formatearTarjeta(e) {
		let v = e.target.value.replace(/\D/g, '').slice(0, 16);
		v = v.replace(/(.{4})/g, '$1 ').trim();
		numeroTarjeta = v;
		e.target.value = v;
	}

	function formatearVencimiento(e) {
		let v = e.target.value.replace(/\D/g, '').slice(0, 4);
		if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
		vencimiento = v;
		e.target.value = v;
	}

	function formatearCVV(e) {
		let v = e.target.value.replace(/\D/g, '').slice(0, 3);
		cvv = v;
		e.target.value = v;
	}

	// ═══════ Validaciones tarjeta ═══════
	function validarTarjeta() {
		const num = numeroTarjeta.replace(/\s/g, '');
		if (num.length !== 16) {
			mostrarToast('error', 'El número de tarjeta debe tener 16 dígitos');
			return false;
		}
		if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
			mostrarToast('error', 'Vencimiento inválido (MM/AA)');
			return false;
		}
		if (cvv.length !== 3) {
			mostrarToast('error', 'El CVV debe tener exactamente 3 dígitos');
			return false;
		}
		if (titular.trim().length < 3) {
			mostrarToast('error', 'Escribe el nombre del titular');
			return false;
		}
		return true;
	}

	async function confirmarPedido() {
		if (!direccionActual) {
			mostrarToast('error', 'Selecciona una dirección de entrega');
			return;
		}
		if (!validarTarjeta()) return;

		confirmando = true;
		try {
			const ultimos4 = numeroTarjeta.replace(/\s/g, '').slice(-4);
			const propinaFinal = propinaPersonalizada ? Number(propinaOtro) : propina;

			const pedido = await crearPedidoMock({
				id_direccion: direccionActual.id_direccion,
				propina: propinaFinal,
				moneda_pago: moneda,
				ultimos4
			});

			// 🔑 Agregar el pedido al store para que aparezca en la lista
			agregarPedido(pedido);

			vaciarCarrito();
			mostrarToast('exito', `¡Pedido #${pedido.id_pedido} confirmado!`);

			setTimeout(() => {
				goto(`/cliente/pedidos/${pedido.id_pedido}`);
			}, 700);
		} catch (err) {
			mostrarToast('error', err.message);
			confirmando = false;
		}
	}

	function seleccionarDireccion(dir) {
		if (!dir) return;
		direccionActual = dir;
		modalDireccion = false;
		mostrarToast('exito', 'Dirección actualizada');
	}
</script>

<div class="min-h-screen bg-surface pb-12">
	<div class="max-w-[1200px] mx-auto px-4 py-6">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
			<a href="/cliente" class="hover:text-primary transition-colors">Inicio</a>
			<span class="material-symbols-outlined text-[14px]">chevron_right</span>
			<span class="text-on-surface font-semibold">Checkout Seguro</span>
		</nav>

		<!-- Título -->
		<div class="flex flex-wrap items-center justify-between gap-3 mb-6">
			<div>
				<h1 class="text-2xl font-bold text-on-surface">Confirmar y pagar</h1>
				<p class="text-sm text-on-surface-variant mt-1">
					Revisa tu dirección, detalles del pedido y método de pago.
				</p>
			</div>
			<div class="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full shadow-sm">
				<span class="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
				<span class="text-[11px] font-bold text-primary-container uppercase tracking-wide">
					Paso 3 de 3
				</span>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			<!-- ═══════════ IZQUIERDA (7/12) ═══════════ -->
			<section class="lg:col-span-7 flex flex-col gap-4">
				<!-- CARD 1: Dirección -->
				<article class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
					<div class="flex items-center gap-2 mb-3">
						<div class="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container">
							<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">location_on</span>
						</div>
						<div class="flex-1">
							<h2 class="text-base font-semibold text-on-surface">Dirección de entrega</h2>
							<p class="text-[11px] text-on-surface-variant">Tiempo estimado: 25 - 35 min</p>
						</div>
						<button
							type="button"
							onclick={() => (modalDireccion = true)}
							class="text-sm font-semibold text-primary-container hover:bg-primary-fixed/30 px-3 py-1.5 rounded transition-colors"
						>
							Cambiar
						</button>
					</div>

					{#if direccionActual}
						<div class="bg-surface-container-low rounded-lg p-3 flex items-start gap-3">
							<span class="material-symbols-outlined text-primary-container text-[22px] mt-0.5">home_pin</span>
							<div class="min-w-0">
								<p class="text-sm font-semibold text-on-surface">{direccionActual.direccion}</p>
								<p class="text-xs text-on-surface-variant mt-0.5">{direccionActual.zona}</p>
								{#if direccionActual.referencia}
									<p class="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1">
										<span class="material-symbols-outlined text-[14px] text-tertiary">info</span>
										{direccionActual.referencia}
									</p>
								{/if}
							</div>
						</div>
					{:else}
						<div class="bg-surface-container-low rounded-lg p-3 flex items-center gap-3">
							<div class="animate-spin w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full"></div>
							<p class="text-sm text-on-surface-variant">Cargando dirección...</p>
						</div>
					{/if}
				</article>

				<!-- CARD 2: Resumen del pedido -->
				<article class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-2">
							<div class="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container">
								<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">storefront</span>
							</div>
							<div>
								<h2 class="text-base font-semibold text-on-surface">{$carrito.nombre_restaurante}</h2>
								<p class="text-[11px] text-on-surface-variant">
									{cantidadTotal($carrito.items)} {cantidadTotal($carrito.items) === 1 ? 'producto' : 'productos'} seleccionados
								</p>
							</div>
						</div>
						<a
							href="/cliente/restaurante/{$carrito.id_restaurante}"
							class="text-sm font-semibold text-primary-container hover:underline"
						>
							Editar orden
						</a>
					</div>

					<ul class="flex flex-col divide-y divide-gray-100">
						{#each $carrito.items as item (item.id_producto)}
							<li class="py-3 flex items-center justify-between gap-3">
								<div class="flex items-center gap-3 min-w-0">
									<img src={item.imagen} alt={item.nombre} class="w-12 h-12 object-cover rounded-lg shrink-0" />
									<div class="min-w-0">
										<p class="text-sm font-semibold text-on-surface truncate">
											{item.cantidad}x {item.nombre}
										</p>
										<p class="text-[11px] text-on-surface-variant">
											{usd(item.precio)} c/u
										</p>
									</div>
								</div>
								<span class="text-sm font-bold text-on-surface shrink-0">
									{usd(item.cantidad * item.precio)}
								</span>
							</li>
						{/each}
					</ul>

					<div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between bg-surface-container-low rounded-lg px-3 py-2">
						<span class="text-xs text-on-surface-variant">Subtotal de productos:</span>
						<span class="text-base font-bold text-on-surface">{usd(precioTotal($carrito.items))}</span>
					</div>
				</article>

				<!-- CARD 3: Propina -->
				<article class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center gap-2">
							<div class="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container">
								<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">volunteer_activism</span>
							</div>
							<div>
								<h2 class="text-base font-semibold text-on-surface">Propina para el repartidor</h2>
								<p class="text-[11px] text-tertiary flex items-center gap-1 font-medium">
									<span class="material-symbols-outlined text-[13px]">verified</span>
									El 100% va directo al repartidor
								</p>
							</div>
						</div>
					</div>
					<p class="text-xs text-on-surface-variant mb-3">
						Reconoce el esfuerzo de quien cuida y traslada tu comida.
					</p>
					<div class="grid grid-cols-5 gap-2">
						<button
							type="button"
							onclick={() => elegirPropina(0)}
							class="h-11 rounded-lg font-semibold text-sm transition-all
								{!propinaPersonalizada && propina === 0
								? 'bg-primary-container text-white shadow-sm'
								: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
						>
							$0
						</button>
						<button
							type="button"
							onclick={() => elegirPropina(1)}
							class="h-11 rounded-lg font-semibold text-sm transition-all
								{!propinaPersonalizada && propina === 1
								? 'bg-primary-container text-white shadow-sm'
								: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
						>
							$1
						</button>
						<button
							type="button"
							onclick={() => elegirPropina(2)}
							class="h-11 rounded-lg font-semibold text-sm transition-all
								{!propinaPersonalizada && propina === 2
								? 'bg-primary-container text-white shadow-sm'
								: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
						>
							$2
						</button>
						<button
							type="button"
							onclick={() => elegirPropina(3)}
							class="h-11 rounded-lg font-semibold text-sm transition-all
								{!propinaPersonalizada && propina === 3
								? 'bg-primary-container text-white shadow-sm'
								: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
						>
							$3
						</button>
						<button
							type="button"
							onclick={abrirOtro}
							class="h-11 rounded-lg font-semibold text-xs transition-all
								{propinaPersonalizada
								? 'bg-primary-container text-white shadow-sm'
								: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
						>
							+ Otro
						</button>
					</div>

					{#if propinaPersonalizada}
						<div class="mt-3 flex items-center gap-2">
							<span class="text-on-surface-variant font-semibold">$</span>
							<input
								type="number"
								min="0"
								step="0.5"
								bind:value={propinaOtro}
								placeholder="Monto personalizado"
								class="flex-1 h-10 px-3 rounded-lg bg-surface-container-low border border-gray-200 text-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
							/>
						</div>
					{/if}
				</article>

				<!-- CARD 4: Moneda -->
				<article class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center gap-2">
							<div class="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container">
								<span class="material-symbols-outlined text-[20px]">currency_exchange</span>
							</div>
							<h2 class="text-base font-semibold text-on-surface">Moneda de pago</h2>
						</div>
						<span class="text-[11px] text-on-surface-variant">
							Tasa BCV: {cotizacion?.tasa_bcv ?? 38.5} Bs/$
						</span>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={() => elegirMoneda('USD')}
							class="h-12 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2
								{moneda === 'USD'
								? 'bg-primary-container text-white shadow-sm'
								: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
						>
							<span class="material-symbols-outlined text-[18px]">attach_money</span>
							USD ($) Dólares
						</button>
						<button
							type="button"
							onclick={() => elegirMoneda('VES')}
							class="h-12 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2
								{moneda === 'VES'
								? 'bg-primary-container text-white shadow-sm'
								: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
						>
							<span class="material-symbols-outlined text-[18px]">payments</span>
							VES (Bs.) Bolívares
						</button>
					</div>

					{#if moneda === 'USD'}
						<div class="mt-3 bg-secondary-container/60 rounded-lg p-3 flex items-start gap-2">
							<span class="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5" style="font-variation-settings: 'FILL' 1;">info</span>
							<div>
								<p class="text-sm font-semibold text-on-secondary-container">Aviso tributario IGTF (3%)</p>
								<p class="text-xs text-on-secondary-container/90 mt-0.5">
									Al pagar en divisas se aplica el Impuesto a las Grandes Transacciones Financieras.
								</p>
							</div>
						</div>
					{/if}
				</article>

				<!-- CARD 5: Método de pago -->
				<article class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-2">
							<div class="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container">
								<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">credit_card</span>
							</div>
							<h2 class="text-base font-semibold text-on-surface">Método de pago</h2>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="h-6 px-2 rounded bg-surface-container flex items-center text-[11px] font-bold tracking-wider text-on-surface">VISA</span>
							<span class="h-6 px-2 rounded bg-surface-container flex items-center text-[11px] font-bold tracking-wider text-primary-container">MC</span>
						</div>
					</div>

					<div class="flex flex-col gap-3">
						<div>
							<label for="card-number" class="block text-xs font-semibold text-on-surface-variant mb-1">
								Número de tarjeta
							</label>
							<div class="relative flex items-center">
								<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">credit_card</span>
								<input
									id="card-number"
									type="text"
									value={numeroTarjeta}
									oninput={formatearTarjeta}
									placeholder="4242 4242 4242 4242"
									maxlength="19"
									class="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low border border-gray-200 text-sm tracking-wider focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
								/>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-3">
							<div>
								<label for="card-expiry" class="block text-xs font-semibold text-on-surface-variant mb-1">
									Vencimiento (MM/AA)
								</label>
								<div class="relative flex items-center">
									<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[16px] pointer-events-none">calendar_month</span>
									<input
										id="card-expiry"
										type="text"
										value={vencimiento}
										oninput={formatearVencimiento}
										placeholder="12/26"
										maxlength="5"
										class="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low border border-gray-200 text-sm text-center focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
									/>
								</div>
							</div>
							<div>
								<label for="card-cvv" class="block text-xs font-semibold text-on-surface-variant mb-1">
									Código de seguridad (CVV)
								</label>
								<div class="relative flex items-center">
									<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[16px] pointer-events-none">lock</span>
									<input
										id="card-cvv"
										type="password"
										value={cvv}
										oninput={formatearCVV}
										placeholder="123"
										maxlength="3"
										class="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low border border-gray-200 text-sm text-center focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
									/>
								</div>
							</div>
						</div>

						<div>
							<label for="card-holder" class="block text-xs font-semibold text-on-surface-variant mb-1">
								Nombre del titular
							</label>
							<div class="relative flex items-center">
								<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[16px] pointer-events-none">person</span>
								<input
									id="card-holder"
									type="text"
									bind:value={titular}
									placeholder="Como aparece en la tarjeta"
									class="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low border border-gray-200 text-sm uppercase focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
								/>
							</div>
						</div>

						<div class="flex items-center gap-1.5 pt-1 text-on-surface-variant">
							<span class="material-symbols-outlined text-[14px] text-tertiary">shield</span>
							<span class="text-[11px]">
								Solo guardamos los últimos 4 dígitos. Pago simulado con cifrado SSL.
							</span>
						</div>
					</div>
				</article>
			</section>

			<!-- ═══════════ DERECHA (5/12) ═══════════ -->
			<aside class="lg:col-span-5">
				<div class="bg-white rounded-xl p-5 shadow-md border border-gray-100">
					<div class="flex items-center justify-between pb-3 border-b border-gray-100">
						<h3 class="text-base font-semibold text-on-surface">Resumen de pago</h3>
						<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/20">
							<span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
							<span class="text-[11px] font-semibold text-tertiary">
								{cotizando ? 'Cotizando...' : 'Cotización en vivo'}
							</span>
						</div>
					</div>

					<div class="py-4 flex flex-col gap-2.5 text-sm">
						<div class="flex justify-between items-center">
							<span class="text-on-surface-variant">Subtotal productos</span>
							<span class="font-semibold text-on-surface">{usd(cotizacion?.subtotal ?? 0)}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-on-surface-variant">Costo de entrega</span>
							<span class="font-semibold text-on-surface">{usd(cotizacion?.costo_envio ?? 0)}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-on-surface-variant">Propina al repartidor</span>
							<span class="font-semibold text-on-surface">{usd(cotizacion?.propina ?? 0)}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-on-surface-variant">IVA (16%)</span>
							<span class="font-semibold text-on-surface">{usd(cotizacion?.iva_total ?? 0)}</span>
						</div>
						{#if moneda === 'USD'}
							<div class="flex justify-between items-center bg-secondary-container/40 p-2 rounded">
								<span class="font-semibold text-on-secondary-container flex items-center gap-1">
									IGTF (3% en USD)
									<span class="material-symbols-outlined text-[14px]">info</span>
								</span>
								<span class="font-semibold text-on-secondary-container">{usd(cotizacion?.igtf ?? 0)}</span>
							</div>
						{/if}
					</div>

					<div class="pt-4 border-t border-gray-100">
						<div class="flex items-baseline justify-between">
							<span class="text-base font-semibold text-on-surface">Total a pagar:</span>
							<span class="text-3xl font-bold text-primary-container">
								{moneda === 'USD' ? usd(cotizacion?.total ?? 0) : bs(cotizacion?.total_ves ?? 0)}
							</span>
						</div>
						{#if moneda === 'USD'}
							<p class="text-xs text-on-surface-variant text-right mt-1">
								≈ {bs(cotizacion?.total_ves ?? 0)} (Tasa BCV)
							</p>
						{:else}
							<p class="text-xs text-on-surface-variant text-right mt-1">
								Equivalente: {usd(cotizacion?.total ?? 0)}
							</p>
						{/if}
					</div>

					<button
						type="button"
						onclick={confirmarPedido}
						disabled={confirmando || cotizando || !direccionActual}
						class="w-full h-12 mt-5 bg-primary-container hover:bg-primary disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
					>
						{#if confirmando}
							<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
							<span>Procesando pago...</span>
						{:else}
							<span class="material-symbols-outlined text-[20px]">lock</span>
							<span>Confirmar pedido · {moneda === 'USD' ? usd(cotizacion?.total ?? 0) : bs(cotizacion?.total_ves ?? 0)}</span>
						{/if}
					</button>

					<!-- Garantía -->
					<div class="mt-3 p-3 bg-surface-container-low rounded-lg flex items-center gap-3">
						<div class="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary shrink-0">
							<span class="material-symbols-outlined text-[16px]">verified_user</span>
						</div>
						<p class="text-[11px] text-on-surface leading-tight">
							<strong class="font-semibold text-tertiary">Garantía DeliverExpress:</strong>
							Entrega a tiempo o tu envío es gratis en la próxima orden.
						</p>
					</div>

					<div class="mt-4 flex items-center justify-center gap-4 text-on-surface-variant text-[10px]">
						<span class="flex items-center gap-1">
							<span class="material-symbols-outlined text-[13px]">lock</span> 256-bit SSL
						</span>
						<span class="flex items-center gap-1">
							<span class="material-symbols-outlined text-[13px]">bolt</span> Confirmación instantánea
						</span>
						<span class="flex items-center gap-1">
							<span class="material-symbols-outlined text-[13px]">support_agent</span> Soporte 24/7
						</span>
					</div>
				</div>
			</aside>
		</div>
	</div>

	<!-- ═══════════ MODAL DIRECCIÓN ═══════════ -->
	{#if modalDireccion}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div class="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-bold text-on-surface">Elige tu dirección</h3>
					<button
						type="button"
						onclick={() => (modalDireccion = false)}
						class="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors"
						aria-label="Cerrar"
					>
						<span class="material-symbols-outlined text-[20px]">close</span>
					</button>
				</div>

				<div class="flex flex-col gap-2">
					{#each $direcciones as dir (dir.id_direccion)}
						<button
							type="button"
							onclick={() => seleccionarDireccion(dir)}
							class="w-full text-left p-3 rounded-lg border-2 transition-all
								{direccionActual?.id_direccion === dir.id_direccion
								? 'border-primary-container bg-primary-fixed/20'
								: 'border-gray-200 hover:border-primary-container/40'}"
						>
							<div class="flex items-start gap-3">
								<span class="material-symbols-outlined text-primary-container text-[20px] mt-0.5 shrink-0">
									{direccionActual?.id_direccion === dir.id_direccion ? 'radio_button_checked' : 'radio_button_unchecked'}
								</span>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-semibold text-on-surface">{dir.direccion}</p>
									<p class="text-xs text-on-surface-variant mt-0.5">{dir.zona}</p>
									{#if dir.referencia}
										<p class="text-[11px] text-on-surface-variant mt-1 italic">{dir.referencia}</p>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>

				<button
					type="button"
					onclick={() => (modalDireccion = false)}
					class="w-full h-11 mt-4 bg-surface-container text-on-surface font-semibold text-sm rounded-lg hover:bg-surface-container-high transition-colors"
				>
					Cerrar
				</button>
			</div>
		</div>
	{/if}
</div>