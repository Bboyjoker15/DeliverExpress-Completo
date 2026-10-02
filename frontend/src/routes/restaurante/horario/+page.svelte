<script>
	import { mostrarToast } from '$lib/toast.js';
	import { horarios, actualizarHorarios, resetearHorarios } from '$lib/stores/horarios.js';
	import { NOMBRES_DIAS, ORDEN_DIAS } from '$lib/mock/horarios.js';
	import SelectorHora from '$lib/componentes/SelectorHora.svelte';

	let guardando = $state(false);

	// Copia local para editar
	let locales = $state($horarios.map((h) => ({ ...h })));

	// Mantener sincronizado si el store cambia desde otro lado
	$effect(() => {
		locales = $horarios.map((h) => ({ ...h }));
	});

	function obtenerDia(dia) {
		return locales.find((h) => h.dia_semana === dia);
	}

	function toggleAbierto(dia) {
		const d = obtenerDia(dia);
		if (d) d.abierto = !d.abierto;
	}

	function copiarLunesASemana() {
		const lunes = obtenerDia(1);
		if (!lunes) return;

		locales = locales.map((h) => {
			if (h.dia_semana === 0 || h.dia_semana === 1) return h;
			return {
				...h,
				abierto: lunes.abierto,
				hora_apertura: lunes.hora_apertura,
				hora_cierre: lunes.hora_cierre
			};
		});
		mostrarToast('info', 'Horario del lunes copiado a mar-vie y sáb');
	}

	function restablecer() {
		resetearHorarios();
		locales = $horarios.map((h) => ({ ...h }));
		mostrarToast('info', 'Valores restablecidos');
	}

	function guardar() {
		const invalido = locales.some(
			(h) =>
				h.abierto &&
				(!h.hora_apertura || !h.hora_cierre || h.hora_apertura >= h.hora_cierre)
		);
		if (invalido) {
			mostrarToast('error', 'Verifica que la hora de cierre sea mayor a la de apertura');
			return;
		}

		guardando = true;
		setTimeout(() => {
			actualizarHorarios(locales.map((h) => ({ ...h })));
			guardando = false;
			mostrarToast('exito', 'Horario actualizado y sincronizado');
		}, 500);
	}
</script>

<div class="min-h-screen bg-surface">
	<div class="max-w-[800px] mx-auto px-4 py-8 flex flex-col gap-6">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-xs text-on-surface-variant">
			<a href="/restaurante" class="flex items-center gap-1 hover:text-primary-container transition-colors">
				<span class="material-symbols-outlined text-[16px]">arrow_back</span>
				Restaurante
			</a>
			<span class="text-outline-variant">/</span>
			<span class="text-on-surface font-semibold">Horario de atención</span>
		</nav>

		<!-- Título -->
		<div>
			<h1 class="text-2xl font-bold text-on-surface">Horario de atención</h1>
			<p class="text-sm text-on-surface-variant mt-1">
				Los pedidos entrantes fuera de estos horarios serán rechazados o programados.
			</p>
		</div>

		<!-- Card principal -->
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-5">
			<!-- Header -->
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<h2 class="text-base font-bold text-on-surface">Horario semanal</h2>
					<span class="inline-flex items-center gap-1.5 bg-green-50 text-green-800 text-[11px] font-semibold px-2.5 py-1 rounded-full">
						<span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>
						Sincronización en vivo
					</span>
				</div>
				<button
					type="button"
					onclick={copiarLunesASemana}
					class="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary-container text-xs font-semibold transition-colors"
				>
					<span class="material-symbols-outlined text-[16px]">content_copy</span>
					Copiar lunes a semana
				</button>
			</div>

			<!-- Info -->
			<div class="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-3">
				<span class="material-symbols-outlined text-primary-container text-[20px]">schedule</span>
				<p class="text-xs text-on-surface-variant">
					<span class="text-on-surface font-semibold">Horario regular activo</span>
					· Zona horaria: America/Caracas (GMT-4)
				</p>
			</div>

			<!-- Lista -->
			<div class="flex flex-col divide-y divide-gray-100">
				{#each ORDEN_DIAS as dia (dia)}
					{@const h = obtenerDia(dia)}
					<div
						class="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-opacity
							{!h.abierto ? 'opacity-60' : ''}"
					>
						<!-- Día + toggle -->
						<div class="flex items-center gap-4 min-w-[200px]">
							<span class="w-28 text-sm font-bold text-on-surface">
								{NOMBRES_DIAS[dia]}
							</span>

							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={h.abierto}
									onchange={() => toggleAbierto(dia)}
									class="sr-only peer"
								/>
								<div class="w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-primary-container relative transition-colors">
									<div
										class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
											{h.abierto ? 'translate-x-5' : 'translate-x-0'}"
									></div>
								</div>
								<span class="text-xs font-semibold text-on-surface w-14">
									{h.abierto ? 'Abierto' : 'Cerrado'}
								</span>
							</label>
						</div>

						<!-- Horas (usando SelectorHora) -->
						<div class="flex items-center gap-2 {!h.abierto ? 'pointer-events-none' : ''}">
							<SelectorHora bind:value={h.hora_apertura} />
							<span class="text-xs text-on-surface-variant font-medium">a</span>
							<SelectorHora bind:value={h.hora_cierre} />
						</div>
					</div>
				{/each}
			</div>

			<!-- Nota -->
			<div class="flex items-start gap-2 bg-surface-container-low rounded-lg p-3">
				<span class="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">info</span>
				<p class="text-xs text-on-surface-variant">
					Al guardar, se reemplaza la configuración completa del horario semanal.
				</p>
			</div>

			<!-- Acciones -->
			<div class="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
				<button
					type="button"
					onclick={restablecer}
					class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-semibold transition-colors flex items-center justify-center gap-2"
				>
					<span class="material-symbols-outlined text-[18px]">restart_alt</span>
					Restablecer valores
				</button>
				<button
					type="button"
					onclick={guardar}
					disabled={guardando}
					class="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-primary-container hover:bg-primary disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
				>
					{#if guardando}
						<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
						<span>Guardando...</span>
					{:else}
						<span class="material-symbols-outlined text-[18px]">check_circle</span>
						<span>Guardar horario</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>