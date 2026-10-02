<script>
	import { goto } from '$app/navigation';
	import { sesion, RUTA_POR_ROL } from '$lib/stores/sesion.js';
	import { mostrarToast } from '$lib/toast.js';
	import { ZONAS } from '$lib/mock/zonas.js';
	import { direcciones, agregarDireccion, marcarPrincipal } from '$lib/stores/direcciones.js';
	import MapaSelector from '$lib/componentes/MapaSelector.svelte';

	// Dirección principal actual (reactiva)
	let direccionActual = $derived($direcciones.find((d) => d.principal) || $direcciones[0]);

	// Datos fiscales
	let telefono = $state('0414 1234567');
	let cedula = $state('V-18452903');
	let guardando = $state(false);

	// Modal de direcciones
	let modalDireccion = $state(false);
	let pasoModal = $state('lista');

	let nuevaDireccion = $state({
		id_zona: 1,
		direccion: '',
		referencia: '',
		latitud: 8.295,
		longitud: -62.735,
		principal: false
	});

	// Volver al panel del rol
	function volver() {
		const ruta = RUTA_POR_ROL[$sesion.rol] || '/';
		goto(ruta);
	}

	function abrirModal() {
		pasoModal = 'lista';
		modalDireccion = true;
	}

	function irANuevaDireccion() {
		nuevaDireccion = {
			id_zona: ZONAS[0]?.id_zona || 1,
			direccion: '',
			referencia: '',
			latitud: 8.295,
			longitud: -62.735,
			principal: false
		};
		pasoModal = 'nueva';
	}

	function guardarNuevaDireccion() {
		if (!nuevaDireccion.direccion.trim()) {
			mostrarToast('error', 'Escribe la dirección');
			return;
		}
		const zona = ZONAS.find((z) => z.id_zona === nuevaDireccion.id_zona);
		agregarDireccion({
			...nuevaDireccion,
			zona: zona?.nombre || ''
		});
		mostrarToast('exito', 'Dirección agregada');
		pasoModal = 'lista';
	}

	function seleccionarPrincipal(id) {
		marcarPrincipal(id);
		mostrarToast('exito', 'Dirección principal actualizada');
		modalDireccion = false;
	}

	function guardar() {
		guardando = true;
		setTimeout(() => {
			guardando = false;
			mostrarToast('exito', 'Datos actualizados');
		}, 600);
	}
</script>

<div class="min-h-screen bg-surface">
	<div class="max-w-[800px] mx-auto px-4 py-6">

		<!-- ═══════ BOTÓN VOLVER ═══════ -->
		<button
			type="button"
			onclick={volver}
			class="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary-container transition-colors mb-5"
		>
			<span class="material-symbols-outlined text-[20px]">arrow_back</span>
			Volver al panel
		</button>

		<h1 class="text-2xl font-bold text-on-surface mb-6">Mi perfil</h1>

		<div class="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">
			<!-- Avatar + Nombre -->
			<div class="flex items-center gap-4 pb-5 border-b border-gray-100">
				<div class="w-20 h-20 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-3xl">
					{$sesion.nombre?.charAt(0) || 'U'}
				</div>
				<div>
					<p class="text-lg font-bold text-on-surface">{$sesion.nombre}</p>
					<p class="text-sm text-on-surface-variant capitalize">{$sesion.rol}</p>
				</div>
			</div>

			<!-- Dirección principal -->
			<div>
				<div class="flex items-center justify-between mb-3">
					<h2 class="text-sm font-bold text-on-surface flex items-center gap-2">
						<span class="material-symbols-outlined text-primary-container text-[20px]">location_on</span>
						Dirección de entrega principal
					</h2>
					<button
						type="button"
						onclick={abrirModal}
						class="text-xs font-semibold text-primary-container hover:underline"
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
					<p class="text-sm text-on-surface-variant">No tienes direcciones configuradas.</p>
				{/if}
			</div>

			<!-- Datos fiscales -->
			<div class="pt-5 border-t border-gray-100 flex flex-col gap-4">
				<h2 class="text-sm font-bold text-on-surface flex items-center gap-2">
					<span class="material-symbols-outlined text-primary-container text-[20px]">receipt_long</span>
					Datos fiscales
				</h2>

				<div>
					<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
						Nombre
					</label>
					<input
						type="text"
						value={$sesion.nombre}
						readonly
						class="w-full h-11 bg-surface-container-low text-on-surface-variant text-sm rounded-lg px-3.5 border border-gray-200 cursor-not-allowed"
					/>
				</div>

				<div>
					<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
						Teléfono de contacto
					</label>
					<input
						type="tel"
						bind:value={telefono}
						class="w-full h-11 bg-white text-on-surface text-sm rounded-lg px-3.5 border border-gray-200 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
					/>
				</div>

				<div>
					<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
						Cédula o RIF
					</label>
					<input
						type="text"
						bind:value={cedula}
						placeholder="V-12345678 o J-12345678-9"
						class="w-full h-11 bg-white text-on-surface text-sm rounded-lg px-3.5 border border-gray-200 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 uppercase"
					/>
				</div>
			</div>

			<!-- Botón guardar -->
			<button
				type="button"
				onclick={guardar}
				disabled={guardando}
				class="w-full h-12 bg-primary-container hover:bg-primary disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
			>
				{guardando ? 'Guardando...' : 'Guardar cambios'}
			</button>
		</div>
	</div>

	<!-- ══════════════ MODAL DIRECCIONES ══════════════ -->
	{#if modalDireccion}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div class="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-bold text-on-surface">
						{pasoModal === 'lista' ? 'Mis direcciones' : 'Nueva dirección'}
					</h3>
					<button
						type="button"
						onclick={() => (modalDireccion = false)}
						class="text-on-surface-variant hover:text-on-surface p-1"
						aria-label="Cerrar"
					>
						<span class="material-symbols-outlined text-[20px]">close</span>
					</button>
				</div>

				{#if pasoModal === 'lista'}
					<div class="flex flex-col gap-2 mb-4">
						{#each $direcciones as dir (dir.id_direccion)}
							<div
								class="p-3 rounded-lg border-2 flex items-start gap-3
									{dir.principal ? 'border-primary-container bg-primary-fixed/10' : 'border-gray-200'}"
							>
								<span class="material-symbols-outlined text-primary-container text-[20px] mt-0.5">
									{dir.principal ? 'radio_button_checked' : 'radio_button_unchecked'}
								</span>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-semibold text-on-surface">{dir.direccion}</p>
									<p class="text-xs text-on-surface-variant mt-0.5">{dir.zona}</p>
									{#if dir.referencia}
										<p class="text-[11px] text-on-surface-variant mt-1 italic">{dir.referencia}</p>
									{/if}
								</div>
								{#if !dir.principal}
									<button
										type="button"
										onclick={() => seleccionarPrincipal(dir.id_direccion)}
										class="text-[11px] font-semibold text-primary-container hover:underline shrink-0"
									>
										Marcar principal
									</button>
								{/if}
							</div>
						{/each}
					</div>

					<button
						type="button"
						onclick={irANuevaDireccion}
						class="w-full h-11 bg-primary-container hover:bg-primary text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
					>
						<span class="material-symbols-outlined text-[18px]">add</span>
						Agregar nueva dirección
					</button>
				{:else}
					<div class="flex flex-col gap-4">
						<div>
							<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">Zona</label>
							<select
								bind:value={nuevaDireccion.id_zona}
								class="w-full h-11 bg-white text-on-surface text-sm rounded-lg px-3.5 border border-gray-200 focus:outline-none focus:border-primary-container"
							>
								{#each ZONAS as z (z.id_zona)}
									<option value={z.id_zona}>{z.nombre}</option>
								{/each}
							</select>
						</div>

						<div>
							<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">Dirección</label>
							<input
								type="text"
								bind:value={nuevaDireccion.direccion}
								placeholder="Av. Principal 123, Apto 4B"
								class="w-full h-11 bg-white text-on-surface text-sm rounded-lg px-3.5 border border-gray-200 focus:outline-none focus:border-primary-container"
							/>
						</div>

						<div>
							<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
								Referencia (opcional)
							</label>
							<input
								type="text"
								bind:value={nuevaDireccion.referencia}
								placeholder="Casa azul, portón negro, etc."
								class="w-full h-11 bg-white text-on-surface text-sm rounded-lg px-3.5 border border-gray-200 focus:outline-none focus:border-primary-container"
							/>
						</div>

						<div>
							<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
								Ubicación en el mapa
							</label>
							<MapaSelector
								bind:lat={nuevaDireccion.latitud}
								bind:lon={nuevaDireccion.longitud}
								height="280px"
							/>
						</div>

						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={nuevaDireccion.principal}
								class="w-4 h-4 rounded accent-primary-container"
							/>
							<span class="text-sm text-on-surface">Marcar como principal</span>
						</label>

						<div class="flex justify-end gap-2 pt-2">
							<button
								type="button"
								onclick={() => (pasoModal = 'lista')}
								class="px-5 py-2.5 rounded-lg text-on-surface hover:bg-surface-container font-semibold text-sm"
							>
								Volver
							</button>
							<button
								type="button"
								onclick={guardarNuevaDireccion}
								class="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-white font-bold text-sm"
							>
								Guardar dirección
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>