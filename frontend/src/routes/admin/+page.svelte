<script>
	import { sesion } from '$lib/stores/sesion.js';
	import { ZONAS } from '$lib/mock/zonas.js';
	import { CATEGORIAS } from '$lib/mock/categorias.js';
	import { TARIFAS_ENVIO, PARAMETROS_SISTEMA } from '$lib/mock/admin.js';
	import { COORDINADORES_INICIALES } from '$lib/mock/coordinadores.js';
	import { RESTAURANTES } from '$lib/mock/restaurantes.js';
	import { REPARTIDORES_DISPONIBLES_DEMO } from '$lib/mock/repartidores.js';
	import {
		tasasBcv,
		tieneTasaHoy,
		agregarTasa,
		eliminarTasa
	} from '$lib/stores/tasas-bcv.js';
	import { usd } from '$lib/formato.js';
	import { mostrarToast } from '$lib/toast.js';
	import MapaSelector from '$lib/componentes/MapaSelector.svelte';

	// ───── Pestaña activa ─────
	let pestana = $state('zonas');

	// ───── Datos locales ─────
	let zonas = $state([...ZONAS]);
	let categorias = $state([...CATEGORIAS]);
	let tarifas = $state([...TARIFAS_ENVIO]);
	let parametros = $state([...PARAMETROS_SISTEMA]);
	let coordinadores = $state([...COORDINADORES_INICIALES]);
	let restaurantes = $state([...RESTAURANTES]);
	let repartidores = $state([...REPARTIDORES_DISPONIBLES_DEMO]);

	// ───── Modales básicos ─────
	let modalAbierto = $state(false);
	let modalTipo = $state('zona');
	let formNuevo = $state({});

	// ───── Confirmar eliminar ─────
	let confirmarAbierto = $state(false);
	let confirmarTipo = $state('zona');
	let confirmarId = $state(null);
	let confirmarNombre = $state('');

	// ───── Tasa BCV ─────
	let formTasa = $state({
		fecha: new Date().toISOString().split('T')[0],
		tasa_usd: ''
	});

	// ───── Facturación ─────
	let periodoFacturacion = $state({ desde: '', hasta: '' });
	let resultadoFacturacion = $state(null);

	// ───── Tarifa (editar) ─────
	let modalTarifa = $state(false);
	let tarifaEditando = $state(null);
	let formTarifa = $state({ km_desde: '', km_hasta: '', precio: '' });

	// ───── Restaurante (crear) ─────
	let modalRestaurante = $state(false);
	let formRestaurante = $state({
		email: '',
		password: '',
		nombre: '',
		id_categoria: 1,
		direccion: '',
		telefono: '',
		latitud: 8.29,
		longitud: -62.71,
		tiempo_prep_min: 20,
		rif: '',
		razon_social: '',
		direccion_fiscal: '',
		zonas: []
	});

	// ───── Repartidor (crear) ─────
	let modalRepartidor = $state(false);
	let formRepartidor = $state({
		email: '',
		password: '',
		nombre: '',
		telefono: '',
		cedula: '',
		tipo_vehiculo: 'moto',
		id_zona: 1
	});

	// ───── Coordinador (crear) ─────
	let modalCoordinador = $state(false);
	let formCoordinador = $state({
		email: '',
		password: '',
		nombre: '',
		telefono: ''
	});

	// ══════════════════════════════════════════════
	// ZONAS / CATEGORÍAS
	// ══════════════════════════════════════════════
	function abrirModal(tipo, item = null) {
		modalTipo = tipo;
		if (item) {
			formNuevo = { ...item };
		} else {
			formNuevo = tipo === 'zona'
				? { nombre: '', latitud: '', longitud: '' }
				: tipo === 'categoria'
				? { nombre: '', emoji: '' }
				: {};
		}
		modalAbierto = true;
	}

	function guardarNuevo() {
		if (!formNuevo.nombre?.trim()) {
			mostrarToast('error', 'El nombre es obligatorio');
			return;
		}

		if (modalTipo === 'zona') {
			zonas = [...zonas, {
				id_zona: Math.max(0, ...zonas.map((z) => z.id_zona)) + 1,
				nombre: formNuevo.nombre,
				latitud_centro: parseFloat(formNuevo.latitud) || 0,
				longitud_centro: parseFloat(formNuevo.longitud) || 0
			}];
		} else if (modalTipo === 'categoria') {
			categorias = [...categorias, {
				id_categoria: Math.max(0, ...categorias.map((c) => c.id_categoria)) + 1,
				nombre: formNuevo.nombre,
				emoji: formNuevo.emoji || '🍽️'
			}];
		}
		mostrarToast('exito', 'Guardado correctamente');
		modalAbierto = false;
	}

	function pedirConfirmacion(tipo, id, nombre) {
		confirmarTipo = tipo;
		confirmarId = id;
		confirmarNombre = nombre;
		confirmarAbierto = true;
	}

	function confirmarEliminar() {
		if (confirmarTipo === 'zona') zonas = zonas.filter((z) => z.id_zona !== confirmarId);
		else if (confirmarTipo === 'categoria') categorias = categorias.filter((c) => c.id_categoria !== confirmarId);
		else if (confirmarTipo === 'coordinador') coordinadores = coordinadores.filter((c) => c.id_coordinador !== confirmarId);
		else if (confirmarTipo === 'repartidor') repartidores = repartidores.filter((r) => r.id_repartidor !== confirmarId);
		else if (confirmarTipo === 'restaurante') restaurantes = restaurantes.filter((r) => r.id_restaurante !== confirmarId);

		mostrarToast('exito', 'Eliminado');
		confirmarAbierto = false;
	}

	// ══════════════════════════════════════════════
	// TARIFAS
	// ══════════════════════════════════════════════
	function abrirEditarTarifa(t) {
		tarifaEditando = t;
		formTarifa = { km_desde: t.km_desde, km_hasta: t.km_hasta, precio: t.precio };
		modalTarifa = true;
	}

	function guardarTarifa() {
		const desde = parseFloat(formTarifa.km_desde);
		const hasta = parseFloat(formTarifa.km_hasta);
		const precio = parseFloat(formTarifa.precio);

		if (isNaN(desde) || isNaN(hasta) || isNaN(precio)) {
			mostrarToast('error', 'Completa todos los campos');
			return;
		}
		if (hasta <= desde) {
			mostrarToast('error', 'El km_hasta debe ser mayor al km_desde');
			return;
		}
		if (precio <= 0) {
			mostrarToast('error', 'El precio debe ser mayor a 0');
			return;
		}

		tarifas = tarifas.map((t) =>
			t.id_tarifa === tarifaEditando.id_tarifa
				? { ...t, km_desde: desde, km_hasta: hasta, precio }
				: t
		);
		mostrarToast('exito', 'Tarifa actualizada');
		modalTarifa = false;
	}

	// ══════════════════════════════════════════════
	// TASA BCV
	// ══════════════════════════════════════════════
	function guardarTasa() {
		if (!formTasa.tasa_usd || Number(formTasa.tasa_usd) <= 0) {
			mostrarToast('error', 'Ingresa una tasa válida');
			return;
		}
		try {
			agregarTasa({ fecha: formTasa.fecha, tasa_usd: formTasa.tasa_usd });
			mostrarToast('exito', 'Tasa registrada');
			formTasa = { fecha: new Date().toISOString().split('T')[0], tasa_usd: '' };
		} catch (err) {
			mostrarToast('error', err.message);
		}
	}

	function borrarTasa(fecha) {
		eliminarTasa(fecha);
		mostrarToast('info', 'Tasa eliminada');
	}

	// ══════════════════════════════════════════════
	// FACTURACIÓN
	// ══════════════════════════════════════════════
	function generarComisiones() {
		if (!periodoFacturacion.desde || !periodoFacturacion.hasta) {
			mostrarToast('error', 'Elige el periodo');
			return;
		}
		resultadoFacturacion = {
			tipo: 'facturas de comisión',
			creadas: 8,
			periodo: `${periodoFacturacion.desde} a ${periodoFacturacion.hasta}`
		};
		mostrarToast('exito', '8 facturas de comisión generadas');
	}

	function generarLiquidaciones() {
		if (!periodoFacturacion.desde || !periodoFacturacion.hasta) {
			mostrarToast('error', 'Elige el periodo');
			return;
		}
		resultadoFacturacion = {
			tipo: 'liquidaciones',
			creadas: 5,
			periodo: `${periodoFacturacion.desde} a ${periodoFacturacion.hasta}`
		};
		mostrarToast('exito', '5 liquidaciones generadas');
	}

	// ══════════════════════════════════════════════
	// RESTAURANTES
	// ══════════════════════════════════════════════
	function abrirNuevoRestaurante() {
		const zonaBase = zonas[0];
		formRestaurante = {
			email: '',
			password: '',
			nombre: '',
			id_categoria: categorias[0]?.id_categoria || 1,
			direccion: '',
			telefono: '',
			latitud: zonaBase?.latitud_centro ?? 8.29,
			longitud: zonaBase?.longitud_centro ?? -62.71,
			tiempo_prep_min: 20,
			rif: '',
			razon_social: '',
			direccion_fiscal: '',
			zonas: []
		};
		modalRestaurante = true;
	}

	function toggleZonaRestaurante(idZona) {
		if (formRestaurante.zonas.includes(idZona)) {
			formRestaurante.zonas = formRestaurante.zonas.filter((z) => z !== idZona);
		} else {
			formRestaurante.zonas = [...formRestaurante.zonas, idZona];
		}
	}

	function guardarRestaurante() {
		if (!formRestaurante.email || !formRestaurante.password) {
			mostrarToast('error', 'Email y contraseña son obligatorios');
			return;
		}
		if (formRestaurante.password.length < 8) {
			mostrarToast('error', 'La contraseña debe tener al menos 8 caracteres');
			return;
		}
		if (!formRestaurante.nombre.trim()) {
			mostrarToast('error', 'El nombre del restaurante es obligatorio');
			return;
		}
		if (!formRestaurante.rif.trim() || !formRestaurante.razon_social.trim()) {
			mostrarToast('error', 'RIF y razón social son obligatorios');
			return;
		}
		if (formRestaurante.zonas.length === 0) {
			mostrarToast('error', 'Selecciona al menos una zona de cobertura');
			return;
		}

		// Cuando el backend esté listo: POST /api/admin/restaurantes {formRestaurante}
		const categoria = categorias.find((c) => c.id_categoria === formRestaurante.id_categoria);
		restaurantes = [
			...restaurantes,
			{
				id_restaurante: Math.max(0, ...restaurantes.map((r) => r.id_restaurante)) + 1,
				nombre: formRestaurante.nombre,
				categoria: categoria?.nombre || 'Sin categoría',
				id_categoria: formRestaurante.id_categoria,
				direccion: formRestaurante.direccion,
				telefono: formRestaurante.telefono,
				latitud: formRestaurante.latitud,
				longitud: formRestaurante.longitud,
				tiempo_prep_min: formRestaurante.tiempo_prep_min,
				rif: formRestaurante.rif,
				razon_social: formRestaurante.razon_social,
				direccion_fiscal: formRestaurante.direccion_fiscal,
				zonas: formRestaurante.zonas,
				activo: true,
				abierto_ahora: true,
				calificacion_promedio: 5.0,
				costo_envio: 0,
				distancia_km: 0,
				imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'
			}
		];
		mostrarToast('exito', 'Restaurante creado con éxito');
		modalRestaurante = false;
	}

	function toggleActivoRestaurante(id) {
		restaurantes = restaurantes.map((r) =>
			r.id_restaurante === id ? { ...r, activo: r.activo === false ? true : false } : r
		);
	}

	// ══════════════════════════════════════════════
	// REPARTIDORES
	// ══════════════════════════════════════════════
	function abrirNuevoRepartidor() {
		formRepartidor = {
			email: '',
			password: '',
			nombre: '',
			telefono: '',
			cedula: '',
			tipo_vehiculo: 'moto',
			id_zona: zonas[0]?.id_zona || 1
		};
		modalRepartidor = true;
	}

	function guardarRepartidor() {
		if (!formRepartidor.email || !formRepartidor.password) {
			mostrarToast('error', 'Email y contraseña son obligatorios');
			return;
		}
		if (formRepartidor.password.length < 8) {
			mostrarToast('error', 'La contraseña debe tener al menos 8 caracteres');
			return;
		}
		if (!formRepartidor.nombre.trim()) {
			mostrarToast('error', 'El nombre es obligatorio');
			return;
		}
		if (!formRepartidor.cedula.trim()) {
			mostrarToast('error', 'La cédula es obligatoria');
			return;
		}

		// Cuando el backend esté listo: POST /api/admin/repartidores {formRepartidor}
		const zona = zonas.find((z) => z.id_zona === formRepartidor.id_zona);
		repartidores = [
			...repartidores,
			{
				id_repartidor: Math.max(0, ...repartidores.map((r) => r.id_repartidor)) + 1,
				nombre: formRepartidor.nombre,
				iniciales: formRepartidor.nombre
					.split(' ')
					.map((n) => n[0])
					.join('')
					.slice(0, 2)
					.toUpperCase(),
				email: formRepartidor.email,
				telefono: formRepartidor.telefono,
				cedula: formRepartidor.cedula,
				vehiculo: formRepartidor.tipo_vehiculo,
				zona: zona?.nombre || 'Zona Centro',
				disponibilidad: 'libre',
				calificacion_promedio: 5.0,
				latitud_actual: 8.29,
				longitud_actual: -62.71,
				activo: true
			}
		];
		mostrarToast('exito', 'Repartidor creado con éxito');
		modalRepartidor = false;
	}

	function toggleActivoRepartidor(id) {
		repartidores = repartidores.map((r) =>
			r.id_repartidor === id ? { ...r, activo: r.activo === false ? true : false } : r
		);
	}

	// ══════════════════════════════════════════════
	// COORDINADORES
	// ══════════════════════════════════════════════
	function abrirNuevoCoordinador() {
		formCoordinador = { email: '', password: '', nombre: '', telefono: '' };
		modalCoordinador = true;
	}

	function guardarCoordinador() {
		if (!formCoordinador.email || !formCoordinador.password) {
			mostrarToast('error', 'Email y contraseña son obligatorios');
			return;
		}
		if (formCoordinador.password.length < 8) {
			mostrarToast('error', 'La contraseña debe tener al menos 8 caracteres');
			return;
		}
		if (!formCoordinador.nombre.trim()) {
			mostrarToast('error', 'El nombre es obligatorio');
			return;
		}

		coordinadores = [
			...coordinadores,
			{
				id_coordinador: Math.max(0, ...coordinadores.map((c) => c.id_coordinador)) + 1,
				nombre: formCoordinador.nombre,
				email: formCoordinador.email,
				telefono: formCoordinador.telefono,
				activo: true
			}
		];
		mostrarToast('exito', 'Coordinador creado con éxito');
		modalCoordinador = false;
	}

	function toggleActivoCoordinador(id) {
		coordinadores = coordinadores.map((c) =>
			c.id_coordinador === id ? { ...c, activo: !c.activo } : c
		);
	}
</script>

<div class="min-h-screen bg-surface">
	<main class="max-w-[1200px] mx-auto px-4 py-6 flex flex-col gap-6">
		<!-- ═══════ ENCABEZADO ═══════ -->
		<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div>
				<h1 class="text-xl font-bold text-on-surface">Panel de Administración</h1>
				<p class="text-sm text-on-surface-variant mt-0.5">
					Configuración del sistema · Bienvenido, {$sesion.nombre || 'Admin'}
				</p>
			</div>
			<div class="flex items-center gap-2 bg-primary-fixed/30 px-3 py-2 rounded-xl">
				<span class="material-symbols-outlined text-primary-container">shield_person</span>
				<div class="text-xs">
					<div class="font-bold text-on-surface">Administrador</div>
					<div class="text-on-surface-variant">Acceso completo</div>
				</div>
			</div>
		</section>

		<!-- ═══════ AVISO TASA FALTANTE ═══════ -->
		{#if !$tieneTasaHoy}
			<div class="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
				<span class="material-symbols-outlined text-red-600 text-[24px] shrink-0">warning</span>
				<div>
					<h3 class="text-sm font-bold text-red-900">No hay tasa BCV cargada para hoy</h3>
					<p class="text-xs text-red-800 mt-1">
						Sin la tasa del día <strong>no se pueden crear pedidos</strong>. Ve a la pestaña "Tasa BCV" y cárgala.
					</p>
				</div>
			</div>
		{/if}

		<!-- ═══════ PESTAÑAS ═══════ -->
		<div class="flex gap-2 border-b border-gray-200 overflow-x-auto scrollbar-none">
			{#each [
				{ id: 'zonas', label: `Zonas (${zonas.length})` },
				{ id: 'categorias', label: `Categorías (${categorias.length})` },
				{ id: 'tarifas', label: `Tarifas (${tarifas.length})` },
				{ id: 'parametros', label: `Parámetros (${parametros.length})` },
				{ id: 'tasas-bcv', label: 'Tasa BCV' },
				{ id: 'facturacion', label: 'Facturación' },
				{ id: 'restaurantes', label: `Restaurantes (${restaurantes.length})` },
				{ id: 'repartidores', label: `Repartidores (${repartidores.length})` },
				{ id: 'coordinadores', label: `Coordinadores (${coordinadores.length})` }
			] as tab (tab.id)}
				<button
					onclick={() => (pestana = tab.id)}
					class="px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap
						{pestana === tab.id
							? 'border-primary-container text-primary-container'
							: 'border-transparent text-on-surface-variant hover:text-on-surface'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- ═══════ TASA BCV ═══════ -->
		{#if pestana === 'tasas-bcv'}
			<section class="grid grid-cols-1 lg:grid-cols-3 gap-5">
				<div class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
					<div>
						<h2 class="text-lg font-bold text-on-surface">Registrar tasa</h2>
						<p class="text-xs text-on-surface-variant mt-0.5">
							Una por día · Sin tasa no se crean pedidos
						</p>
					</div>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Fecha</span>
						<input
							type="date"
							bind:value={formTasa.fecha}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
							Tasa USD → Bs.
						</span>
						<input
							type="number"
							step="0.01"
							min="0"
							bind:value={formTasa.tasa_usd}
							placeholder="38.50"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<button
						onclick={guardarTasa}
						class="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold transition-colors"
					>
						Registrar tasa
					</button>
				</div>

				<div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-bold text-on-surface">Últimas tasas</h2>
						<span class="text-xs text-on-surface-variant">{$tasasBcv.length} registros</span>
					</div>
					<div class="overflow-x-auto max-h-[500px]">
						<table class="w-full text-sm">
							<thead class="sticky top-0 bg-white">
								<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
									<th class="py-2 px-3">Fecha</th>
									<th class="py-2 px-3 text-right">Tasa USD</th>
									<th class="py-2 px-3 w-20 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{#each $tasasBcv.slice(0, 60) as t, i (t.fecha)}
									<tr class="border-b border-gray-100 {i % 2 === 1 ? 'bg-surface-container-low/50' : ''}">
										<td class="py-2.5 px-3 text-on-surface">
											{t.fecha}
											{#if t.fecha === new Date().toISOString().split('T')[0]}
												<span class="ml-2 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
													Hoy
												</span>
											{/if}
										</td>
										<td class="py-2.5 px-3 text-right font-bold text-on-surface">
											Bs. {t.tasa_usd.toFixed(2)}
										</td>
										<td class="py-2.5 px-3 text-right">
											<button
												onclick={() => borrarTasa(t.fecha)}
												class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 inline-flex items-center justify-center"
												title="Eliminar"
											>
												<span class="material-symbols-outlined text-[18px]">delete</span>
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</section>
		{/if}

		<!-- ═══════ FACTURACIÓN ═══════ -->
		{#if pestana === 'facturacion'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-5">
				<div>
					<h2 class="text-lg font-bold text-on-surface">Generación de documentos fiscales</h2>
					<p class="text-xs text-on-surface-variant mt-0.5">
						Elige el periodo y genera facturas de comisión a restaurantes y liquidaciones a repartidores.
					</p>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Desde</span>
						<input
							type="date"
							bind:value={periodoFacturacion.desde}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Hasta</span>
						<input
							type="date"
							bind:value={periodoFacturacion.hasta}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<button
						onclick={generarComisiones}
						class="p-5 bg-surface-container-low hover:bg-surface-container rounded-xl flex flex-col items-start gap-2 transition-colors text-left"
					>
						<div class="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container">
							<span class="material-symbols-outlined text-[22px]">receipt_long</span>
						</div>
						<div>
							<p class="text-sm font-bold text-on-surface">Generar facturas de comisión</p>
							<p class="text-xs text-on-surface-variant mt-0.5">
								Facturas mensuales a restaurantes (15% de comisión)
							</p>
						</div>
					</button>
					<button
						onclick={generarLiquidaciones}
						class="p-5 bg-surface-container-low hover:bg-surface-container rounded-xl flex flex-col items-start gap-2 transition-colors text-left"
					>
						<div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
							<span class="material-symbols-outlined text-[22px]">payments</span>
						</div>
						<div>
							<p class="text-sm font-bold text-on-surface">Generar liquidaciones</p>
							<p class="text-xs text-on-surface-variant mt-0.5">
								Pagos a repartidores (envíos + propinas)
							</p>
						</div>
					</button>
				</div>

				{#if resultadoFacturacion}
					<div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
						<span class="material-symbols-outlined text-green-600 text-[24px]">check_circle</span>
						<div>
							<p class="text-sm font-bold text-green-900">
								Se crearon {resultadoFacturacion.creadas} {resultadoFacturacion.tipo}
							</p>
							<p class="text-xs text-green-800 mt-0.5">
								Periodo: {resultadoFacturacion.periodo}
							</p>
						</div>
					</div>
				{/if}
			</section>
		{/if}

		<!-- ═══════ RESTAURANTES ═══════ -->
		{#if pestana === 'restaurantes'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-lg font-bold text-on-surface">Restaurantes registrados</h2>
						<p class="text-xs text-on-surface-variant mt-0.5">
							{restaurantes.length} restaurantes
						</p>
					</div>
					<button
						onclick={abrirNuevoRestaurante}
						class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold transition-colors"
					>
						<span class="material-symbols-outlined text-[18px]">add</span>
						Nuevo restaurante
					</button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3 w-16">ID</th>
								<th class="py-2 px-3">Nombre</th>
								<th class="py-2 px-3">Categoría</th>
								<th class="py-2 px-3">RIF</th>
								<th class="py-2 px-3 text-center w-24">Activo</th>
								<th class="py-2 px-3 w-24 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each restaurantes as r, i (r.id_restaurante)}
								<tr class="border-b border-gray-100 {i % 2 === 1 ? 'bg-surface-container-low/50' : ''}">
									<td class="py-3 px-3 text-on-surface-variant">{r.id_restaurante}</td>
									<td class="py-3 px-3 font-semibold text-on-surface">{r.nombre}</td>
									<td class="py-3 px-3 text-on-surface-variant">{r.categoria}</td>
									<td class="py-3 px-3 font-mono text-xs text-on-surface-variant">
										{r.rif || 'J-XXXXXXXX-X'}
									</td>
									<td class="py-3 px-3 text-center">
										<button
											onclick={() => toggleActivoRestaurante(r.id_restaurante)}
											class="w-10 h-5.5 rounded-full relative transition-colors
												{r.activo !== false ? 'bg-green-500' : 'bg-gray-300'}"
										>
											<div
												class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform
													{r.activo !== false ? 'translate-x-5' : 'translate-x-0'}"
											></div>
										</button>
									</td>
									<td class="py-3 px-3 text-right">
										<button
											onclick={() => pedirConfirmacion('restaurante', r.id_restaurante, r.nombre)}
											class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 inline-flex items-center justify-center"
											title="Eliminar"
										>
											<span class="material-symbols-outlined text-[18px]">delete</span>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="text-xs text-on-surface-variant bg-surface-container-low rounded-lg p-3 flex items-start gap-2">
					<span class="material-symbols-outlined text-primary-container text-[18px] shrink-0">info</span>
					<p>
						Para crear un restaurante se pide: email, contraseña, RIF, razón social, dirección fiscal
						y zonas de cobertura. La ubicación se marca haciendo clic en el mapa o arrastrando el pin.
					</p>
				</div>
			</section>
		{/if}

		<!-- ═══════ REPARTIDORES ═══════ -->
		{#if pestana === 'repartidores'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-lg font-bold text-on-surface">Repartidores registrados</h2>
						<p class="text-xs text-on-surface-variant mt-0.5">
							{repartidores.length} repartidores
						</p>
					</div>
					<button
						onclick={abrirNuevoRepartidor}
						class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold transition-colors"
					>
						<span class="material-symbols-outlined text-[18px]">add</span>
						Nuevo repartidor
					</button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3 w-16">ID</th>
								<th class="py-2 px-3">Nombre</th>
								<th class="py-2 px-3">Cédula</th>
								<th class="py-2 px-3">Vehículo</th>
								<th class="py-2 px-3">Zona</th>
								<th class="py-2 px-3 text-center w-24">Activo</th>
								<th class="py-2 px-3 w-24 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each repartidores as r, i (r.id_repartidor)}
								<tr class="border-b border-gray-100 {i % 2 === 1 ? 'bg-surface-container-low/50' : ''}">
									<td class="py-3 px-3 text-on-surface-variant">{r.id_repartidor}</td>
									<td class="py-3 px-3 font-semibold text-on-surface">{r.nombre}</td>
									<td class="py-3 px-3 font-mono text-xs text-on-surface-variant">
										{r.cedula || 'V-XXXXXXXX'}
									</td>
									<td class="py-3 px-3 text-on-surface-variant capitalize">{r.vehiculo}</td>
									<td class="py-3 px-3 text-on-surface-variant">{r.zona}</td>
									<td class="py-3 px-3 text-center">
										<button
											onclick={() => toggleActivoRepartidor(r.id_repartidor)}
											class="w-10 h-5.5 rounded-full relative transition-colors
												{r.activo !== false ? 'bg-green-500' : 'bg-gray-300'}"
										>
											<div
												class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform
													{r.activo !== false ? 'translate-x-5' : 'translate-x-0'}"
											></div>
										</button>
									</td>
									<td class="py-3 px-3 text-right">
										<button
											onclick={() => pedirConfirmacion('repartidor', r.id_repartidor, r.nombre)}
											class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 inline-flex items-center justify-center"
											title="Eliminar"
										>
											<span class="material-symbols-outlined text-[18px]">delete</span>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		<!-- ═══════ COORDINADORES ═══════ -->
		{#if pestana === 'coordinadores'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-lg font-bold text-on-surface">Coordinadores</h2>
						<p class="text-xs text-on-surface-variant mt-0.5">
							{coordinadores.length} coordinadores
						</p>
					</div>
					<button
						onclick={abrirNuevoCoordinador}
						class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold transition-colors"
					>
						<span class="material-symbols-outlined text-[18px]">add</span>
						Nuevo coordinador
					</button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3 w-16">ID</th>
								<th class="py-2 px-3">Nombre</th>
								<th class="py-2 px-3">Email</th>
								<th class="py-2 px-3">Teléfono</th>
								<th class="py-2 px-3 text-center w-24">Activo</th>
								<th class="py-2 px-3 w-24 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each coordinadores as c, i (c.id_coordinador)}
								<tr class="border-b border-gray-100 {i % 2 === 1 ? 'bg-surface-container-low/50' : ''}">
									<td class="py-3 px-3 text-on-surface-variant">{c.id_coordinador}</td>
									<td class="py-3 px-3 font-semibold text-on-surface">{c.nombre}</td>
									<td class="py-3 px-3 text-on-surface-variant">{c.email}</td>
									<td class="py-3 px-3 text-on-surface-variant">{c.telefono}</td>
									<td class="py-3 px-3 text-center">
										<button
											onclick={() => toggleActivoCoordinador(c.id_coordinador)}
											class="w-10 h-5.5 rounded-full relative transition-colors
												{c.activo ? 'bg-green-500' : 'bg-gray-300'}"
										>
											<div
												class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform
													{c.activo ? 'translate-x-5' : 'translate-x-0'}"
											></div>
										</button>
									</td>
									<td class="py-3 px-3 text-right">
										<button
											onclick={() => pedirConfirmacion('coordinador', c.id_coordinador, c.nombre)}
											class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 inline-flex items-center justify-center"
											title="Eliminar"
										>
											<span class="material-symbols-outlined text-[18px]">delete</span>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		<!-- ═══════ ZONAS ═══════ -->
		{#if pestana === 'zonas'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-lg font-bold text-on-surface">Zonas de cobertura</h2>
						<p class="text-xs text-on-surface-variant mt-0.5">
							{zonas.length} zonas registradas
						</p>
					</div>
					<button
						onclick={() => abrirModal('zona')}
						class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold transition-colors"
					>
						<span class="material-symbols-outlined text-[18px]">add</span>
						Nueva zona
					</button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3 w-16">ID</th>
								<th class="py-2 px-3">Nombre</th>
								<th class="py-2 px-3">Coordenadas</th>
								<th class="py-2 px-3 w-24 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each zonas as z, i (z.id_zona)}
								<tr class="border-b border-gray-100 {i % 2 === 1 ? 'bg-surface-container-low/50' : ''}">
									<td class="py-3 px-3 text-on-surface-variant">{z.id_zona}</td>
									<td class="py-3 px-3 font-semibold text-on-surface">{z.nombre}</td>
									<td class="py-3 px-3 text-on-surface-variant text-xs">
										{z.latitud_centro?.toFixed(4)}, {z.longitud_centro?.toFixed(4)}
									</td>
									<td class="py-3 px-3 text-right">
										<button
											onclick={() => pedirConfirmacion('zona', z.id_zona, z.nombre)}
											class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 inline-flex items-center justify-center"
											title="Eliminar"
										>
											<span class="material-symbols-outlined text-[18px]">delete</span>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		<!-- ═══════ CATEGORÍAS ═══════ -->
		{#if pestana === 'categorias'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-lg font-bold text-on-surface">Categorías de restaurantes</h2>
						<p class="text-xs text-on-surface-variant mt-0.5">
							{categorias.length} categorías registradas
						</p>
					</div>
					<button
						onclick={() => abrirModal('categoria')}
						class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold transition-colors"
					>
						<span class="material-symbols-outlined text-[18px]">add</span>
						Nueva categoría
					</button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3 w-16">ID</th>
								<th class="py-2 px-3">Nombre</th>
								<th class="py-2 px-3 w-24 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each categorias as c, i (c.id_categoria)}
								<tr class="border-b border-gray-100 {i % 2 === 1 ? 'bg-surface-container-low/50' : ''}">
									<td class="py-3 px-3 text-on-surface-variant">{c.id_categoria}</td>
									<td class="py-3 px-3 font-semibold text-on-surface">{c.nombre}</td>
									<td class="py-3 px-3 text-right">
										<button
											onclick={() => pedirConfirmacion('categoria', c.id_categoria, c.nombre)}
											class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 inline-flex items-center justify-center"
											title="Eliminar"
										>
											<span class="material-symbols-outlined text-[18px]">delete</span>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		<!-- ═══════ TARIFAS ═══════ -->
		{#if pestana === 'tarifas'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
				<div>
					<h2 class="text-lg font-bold text-on-surface">Tarifas de envío por distancia</h2>
					<p class="text-xs text-on-surface-variant mt-0.5">
						Los rangos se definen en kilómetros. Puedes modificar el precio.
					</p>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3 w-16">ID</th>
								<th class="py-2 px-3">Rango</th>
								<th class="py-2 px-3 text-right">Precio</th>
								<th class="py-2 px-3 w-24 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each tarifas as t, i (t.id_tarifa)}
								<tr class="border-b border-gray-100 {i % 2 === 1 ? 'bg-surface-container-low/50' : ''}">
									<td class="py-3 px-3 text-on-surface-variant">{t.id_tarifa}</td>
									<td class="py-3 px-3 text-on-surface">
										{t.km_desde} km — {t.km_hasta >= 999 ? 'más' : t.km_hasta + ' km'}
									</td>
									<td class="py-3 px-3 text-right font-bold text-on-surface">{usd(t.precio)}</td>
									<td class="py-3 px-3 text-right">
										<button
											onclick={() => abrirEditarTarifa(t)}
											class="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary-container inline-flex items-center justify-center"
											title="Editar tarifa"
										>
											<span class="material-symbols-outlined text-[18px]">edit</span>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		<!-- ═══════ PARÁMETROS ═══════ -->
		{#if pestana === 'parametros'}
			<section class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
				<div>
					<h2 class="text-lg font-bold text-on-surface">Parámetros del sistema</h2>
					<p class="text-xs text-on-surface-variant mt-0.5">Valores configurables del negocio</p>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs text-on-surface-variant uppercase tracking-wide border-b border-gray-200">
								<th class="py-2 px-3">Clave</th>
								<th class="py-2 px-3 w-32">Valor</th>
								<th class="py-2 px-3">Descripción</th>
							</tr>
						</thead>
						<tbody>
							{#each parametros as p, i (p.clave)}
								<tr class="border-b border-gray-100 {i % 2 === 1 ? 'bg-surface-container-low/50' : ''}">
									<td class="py-3 px-3 font-mono text-xs text-on-surface">{p.clave}</td>
									<td class="py-3 px-3">
										<span class="inline-block bg-primary-fixed/40 text-primary-container text-xs font-bold px-2 py-1 rounded">
											{p.valor}
										</span>
									</td>
									<td class="py-3 px-3 text-on-surface-variant text-xs">{p.descripcion}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	</main>

	<!-- ═══════ MODAL CREAR (zona, categoría) ═══════ -->
	{#if modalAbierto}
		<div
			class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (modalAbierto = false)}
		>
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold text-on-surface">
						{modalTipo === 'zona' ? 'Nueva zona' : 'Nueva categoría'}
					</h3>
					<button
						onclick={() => (modalAbierto = false)}
						class="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center"
					>
						<span class="material-symbols-outlined text-on-surface-variant">close</span>
					</button>
				</div>

				<div class="flex flex-col gap-3">
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Nombre</span>
						<input
							type="text"
							bind:value={formNuevo.nombre}
							placeholder={modalTipo === 'zona' ? 'Ej: Lechería Centro' : 'Ej: Italiana & Pizza'}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>

					{#if modalTipo === 'zona'}
						<div class="grid grid-cols-2 gap-3">
							<label class="flex flex-col gap-1">
								<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Latitud</span>
								<input
									type="number"
									step="0.0001"
									bind:value={formNuevo.latitud}
									placeholder="8.2950"
									class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
								/>
							</label>
							<label class="flex flex-col gap-1">
								<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Longitud</span>
								<input
									type="number"
									step="0.0001"
									bind:value={formNuevo.longitud}
									placeholder="-62.7350"
									class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
								/>
							</label>
						</div>
					{/if}

					{#if modalTipo === 'categoria'}
						<label class="flex flex-col gap-1">
							<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Emoji</span>
							<input
								type="text"
								bind:value={formNuevo.emoji}
								placeholder="🍕"
								maxlength="4"
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
					{/if}
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button
						onclick={() => (modalAbierto = false)}
						class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
					>
						Cancelar
					</button>
					<button
						onclick={guardarNuevo}
						class="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold"
					>
						Guardar
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ═══════ MODAL EDITAR TARIFA ═══════ -->
	{#if modalTarifa}
		<div
			class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (modalTarifa = false)}
		>
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold text-on-surface">
						Editar tarifa #{tarifaEditando?.id_tarifa}
					</h3>
					<button
						onclick={() => (modalTarifa = false)}
						class="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center"
					>
						<span class="material-symbols-outlined text-on-surface-variant">close</span>
					</button>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Desde (km)</span>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={formTarifa.km_desde}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Hasta (km)</span>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={formTarifa.km_hasta}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
				</div>

				<label class="flex flex-col gap-1">
					<span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Precio (USD)</span>
					<input
						type="number"
						step="0.01"
						min="0"
						bind:value={formTarifa.precio}
						class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
					/>
				</label>

				<div class="flex justify-end gap-2 pt-2">
					<button
						onclick={() => (modalTarifa = false)}
						class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
					>
						Cancelar
					</button>
					<button
						onclick={guardarTarifa}
						class="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold"
					>
						Guardar cambios
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ═══════ MODAL NUEVO RESTAURANTE ═══════ -->
	{#if modalRestaurante}
		<div
			class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (modalRestaurante = false)}
		>
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold text-on-surface">Nuevo restaurante</h3>
					<button
						onclick={() => (modalRestaurante = false)}
						class="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center"
					>
						<span class="material-symbols-outlined text-on-surface-variant">close</span>
					</button>
				</div>

				<!-- Cuenta -->
				<div>
					<h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
						Cuenta de acceso
					</h4>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<label class="flex flex-col gap-1">
							<span class="text-xs font-semibold text-on-surface-variant">Email</span>
							<input
								type="email"
								bind:value={formRestaurante.email}
								placeholder="restaurante@demo.com"
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
						<label class="flex flex-col gap-1">
							<span class="text-xs font-semibold text-on-surface-variant">Contraseña</span>
							<input
								type="text"
								bind:value={formRestaurante.password}
								placeholder="mínimo 8 caracteres"
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
					</div>
				</div>

				<!-- Datos -->
				<div>
					<h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
						Datos del restaurante
					</h4>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<label class="flex flex-col gap-1 sm:col-span-2">
							<span class="text-xs font-semibold text-on-surface-variant">Nombre</span>
							<input
								type="text"
								bind:value={formRestaurante.nombre}
								placeholder="Ej: Burger Artisan Lab"
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
						<label class="flex flex-col gap-1">
							<span class="text-xs font-semibold text-on-surface-variant">Categoría</span>
							<select
								bind:value={formRestaurante.id_categoria}
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							>
								{#each categorias as c (c.id_categoria)}
									<option value={c.id_categoria}>{c.nombre}</option>
								{/each}
							</select>
						</label>
						<label class="flex flex-col gap-1">
							<span class="text-xs font-semibold text-on-surface-variant">Teléfono</span>
							<input
								type="tel"
								bind:value={formRestaurante.telefono}
								placeholder="+58 414 1234567"
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
						<label class="flex flex-col gap-1 sm:col-span-2">
							<span class="text-xs font-semibold text-on-surface-variant">Dirección (local)</span>
							<input
								type="text"
								bind:value={formRestaurante.direccion}
								placeholder="Av. Principal, Local 3"
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
						<label class="flex flex-col gap-1">
							<span class="text-xs font-semibold text-on-surface-variant">Tiempo prep. (min)</span>
							<input
								type="number"
								min="1"
								bind:value={formRestaurante.tiempo_prep_min}
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
					</div>
				</div>

				<!-- Datos fiscales -->
				<div>
					<h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
						Datos fiscales
					</h4>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<label class="flex flex-col gap-1">
							<span class="text-xs font-semibold text-on-surface-variant">RIF</span>
							<input
								type="text"
								bind:value={formRestaurante.rif}
								placeholder="J-40892184-2"
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-primary-container"
							/>
						</label>
						<label class="flex flex-col gap-1">
							<span class="text-xs font-semibold text-on-surface-variant">Razón social</span>
							<input
								type="text"
								bind:value={formRestaurante.razon_social}
								placeholder="Burger Artisan Lab C.A."
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
						<label class="flex flex-col gap-1 sm:col-span-2">
							<span class="text-xs font-semibold text-on-surface-variant">Dirección fiscal</span>
							<input
								type="text"
								bind:value={formRestaurante.direccion_fiscal}
								placeholder="Av. Francisco de Miranda, Torre Delta"
								class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
							/>
						</label>
					</div>
				</div>

				<!-- Ubicación -->
				<div>
					<h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
						Ubicación
					</h4>
					<MapaSelector
						bind:lat={formRestaurante.latitud}
						bind:lon={formRestaurante.longitud}
						height="300px"
					/>
				</div>

				<!-- Zonas -->
				<div>
					<h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
						Zonas de cobertura
					</h4>
					<div class="flex flex-wrap gap-2">
						{#each zonas as z (z.id_zona)}
							<button
								type="button"
								onclick={() => toggleZonaRestaurante(z.id_zona)}
								class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
									{formRestaurante.zonas.includes(z.id_zona)
										? 'bg-primary-container text-white'
										: 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
							>
								{z.nombre}
							</button>
						{/each}
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
					<button
						onclick={() => (modalRestaurante = false)}
						class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
					>
						Cancelar
					</button>
					<button
						onclick={guardarRestaurante}
						class="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold"
					>
						Crear restaurante
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ═══════ MODAL NUEVO REPARTIDOR ═══════ -->
	{#if modalRepartidor}
		<div
			class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (modalRepartidor = false)}
		>
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-4 my-8">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold text-on-surface">Nuevo repartidor</h3>
					<button
						onclick={() => (modalRepartidor = false)}
						class="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center"
					>
						<span class="material-symbols-outlined text-on-surface-variant">close</span>
					</button>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<label class="flex flex-col gap-1 sm:col-span-2">
						<span class="text-xs font-semibold text-on-surface-variant">Nombre completo</span>
						<input
							type="text"
							bind:value={formRepartidor.nombre}
							placeholder="Ej: Carlos Méndez"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant">Email</span>
						<input
							type="email"
							bind:value={formRepartidor.email}
							placeholder="repartidor@demo.com"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant">Contraseña</span>
						<input
							type="text"
							bind:value={formRepartidor.password}
							placeholder="mínimo 8 caracteres"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant">Cédula</span>
						<input
							type="text"
							bind:value={formRepartidor.cedula}
							placeholder="V-12345678"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant">Teléfono</span>
						<input
							type="tel"
							bind:value={formRepartidor.telefono}
							placeholder="+58 414 1234567"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant">Vehículo</span>
						<select
							bind:value={formRepartidor.tipo_vehiculo}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						>
							<option value="moto">Moto</option>
							<option value="bicicleta">Bicicleta</option>
							<option value="auto">Auto</option>
						</select>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant">Zona de trabajo</span>
						<select
							bind:value={formRepartidor.id_zona}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						>
							{#each zonas as z (z.id_zona)}
								<option value={z.id_zona}>{z.nombre}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
					<button
						onclick={() => (modalRepartidor = false)}
						class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
					>
						Cancelar
					</button>
					<button
						onclick={guardarRepartidor}
						class="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold"
					>
						Crear repartidor
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ═══════ MODAL NUEVO COORDINADOR ═══════ -->
	{#if modalCoordinador}
		<div
			class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (modalCoordinador = false)}
		>
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold text-on-surface">Nuevo coordinador</h3>
					<button
						onclick={() => (modalCoordinador = false)}
						class="w-8 h-8 rounded-lg hover:bg-surface-container-low flex items-center justify-center"
					>
						<span class="material-symbols-outlined text-on-surface-variant">close</span>
					</button>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<label class="flex flex-col gap-1 sm:col-span-2">
						<span class="text-xs font-semibold text-on-surface-variant">Nombre completo</span>
						<input
							type="text"
							bind:value={formCoordinador.nombre}
							placeholder="Ej: María González"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant">Email</span>
						<input
							type="email"
							bind:value={formCoordinador.email}
							placeholder="coordinador@demo.com"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs font-semibold text-on-surface-variant">Contraseña</span>
						<input
							type="text"
							bind:value={formCoordinador.password}
							placeholder="mínimo 8 caracteres"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
					<label class="flex flex-col gap-1 sm:col-span-2">
						<span class="text-xs font-semibold text-on-surface-variant">Teléfono</span>
						<input
							type="tel"
							bind:value={formCoordinador.telefono}
							placeholder="+58 414 1234567"
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-container"
						/>
					</label>
				</div>

				<div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
					<button
						onclick={() => (modalCoordinador = false)}
						class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
					>
						Cancelar
					</button>
					<button
						onclick={guardarCoordinador}
						class="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-sm font-semibold"
					>
						Crear coordinador
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ═══════ MODAL CONFIRMAR ELIMINAR ═══════ -->
	{#if confirmarAbierto}
		<div
			class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (confirmarAbierto = false)}
		>
			<div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-red-600">warning</span>
					</div>
					<div>
						<h3 class="text-base font-bold text-on-surface">¿Eliminar?</h3>
						<p class="text-xs text-on-surface-variant mt-0.5">
							Esta acción no se puede deshacer.
						</p>
					</div>
				</div>
				<p class="text-sm text-on-surface">
					Vas a eliminar: <span class="font-bold">{confirmarNombre}</span>
				</p>
				<div class="flex justify-end gap-2">
					<button
						onclick={() => (confirmarAbierto = false)}
						class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
					>
						Cancelar
					</button>
					<button
						onclick={confirmarEliminar}
						class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
					>
						Eliminar
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>