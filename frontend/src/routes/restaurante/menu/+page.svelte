<script>
	import { usd } from '$lib/formato.js';
	import { mostrarToast } from '$lib/toast.js';
	import {
		menu,
		estadisticas,
		agregarProducto,
		editarProducto,
		toggleDisponible,
		toggleExentoIva,
		eliminarProducto
	} from '$lib/stores/menu.js';

	// Modal
	let modalAbierto = $state(false);
	let modoEdicion = $state(false);
	let productoEditando = $state(null);
	let formulario = $state({
		nombre: '',
		descripcion: '',
		precio: '',
		exento_iva: false,
		categoria: 'Populares'
	});

	// Confirmación eliminar
	let confirmarAbierto = $state(false);
	let productoAEliminar = $state(null);

	function abrirNuevo() {
		modoEdicion = false;
		productoEditando = null;
		formulario = {
			nombre: '',
			descripcion: '',
			precio: '',
			exento_iva: false,
			categoria: 'Populares'
		};
		modalAbierto = true;
	}

	function abrirEditar(prod) {
		modoEdicion = true;
		productoEditando = prod;
		formulario = {
			nombre: prod.nombre,
			descripcion: prod.descripcion,
			precio: prod.precio,
			exento_iva: prod.exento_iva,
			categoria: prod.categoria || 'Populares'
		};
		modalAbierto = true;
	}

	function guardar() {
		if (!formulario.nombre.trim()) {
			mostrarToast('error', 'Escribe el nombre del producto');
			return;
		}
		if (!formulario.precio || Number(formulario.precio) <= 0) {
			mostrarToast('error', 'El precio debe ser mayor a 0');
			return;
		}

		if (modoEdicion && productoEditando) {
			editarProducto(productoEditando.id_producto, {
				nombre: formulario.nombre.trim(),
				descripcion: formulario.descripcion.trim(),
				precio: Number(formulario.precio),
				exento_iva: formulario.exento_iva,
				categoria: formulario.categoria
			});
			mostrarToast('exito', 'Producto actualizado');
		} else {
			agregarProducto({
				nombre: formulario.nombre.trim(),
				descripcion: formulario.descripcion.trim(),
				precio: Number(formulario.precio),
				exento_iva: formulario.exento_iva,
				categoria: formulario.categoria
			});
			mostrarToast('exito', 'Producto agregado');
		}

		modalAbierto = false;
	}

	function pedirEliminar(prod) {
		productoAEliminar = prod;
		confirmarAbierto = true;
	}

	function confirmarEliminar() {
		if (productoAEliminar) {
			eliminarProducto(productoAEliminar.id_producto);
			mostrarToast('exito', 'Producto eliminado');
		}
		confirmarAbierto = false;
		productoAEliminar = null;
	}
</script>

<div class="min-h-screen bg-surface">
	<main class="max-w-[1200px] mx-auto px-4 py-6 flex flex-col gap-6">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-xs text-on-surface-variant">
			<a href="/restaurante" class="flex items-center gap-1 hover:text-primary-container transition-colors">
				<span class="material-symbols-outlined text-[16px]">arrow_back</span>
				Restaurante
			</a>
			<span class="text-outline-variant">/</span>
			<span class="text-on-surface font-semibold">Menú</span>
		</nav>

		<!-- Header -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold text-on-surface">Gestión del menú</h1>
				<p class="text-sm text-on-surface-variant mt-1">
					Administra tus productos, precios, disponibilidad y condiciones de IVA.
				</p>
			</div>
			<button
				onclick={abrirNuevo}
				class="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-white font-semibold text-sm transition-colors"
			>
				<span class="material-symbols-outlined text-[18px]">add</span>
				Nuevo producto
			</button>
		</div>

		<!-- Stats -->
		<div class="flex flex-wrap items-center gap-3">
			<div class="flex items-center gap-2 bg-surface-container-high text-on-surface px-3 py-1.5 rounded-full text-xs font-semibold">
				<span class="material-symbols-outlined text-[16px] text-primary-container">restaurant_menu</span>
				{$estadisticas.total} productos en total
			</div>
			<div class="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
				<span class="w-2 h-2 rounded-full bg-green-500"></span>
				{$estadisticas.disponibles} activos
			</div>
			{#if $estadisticas.agotados > 0}
				<div class="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold">
					<span class="w-2 h-2 rounded-full bg-red-500"></span>
					{$estadisticas.agotados} agotados / pausados
				</div>
			{/if}
		</div>

		<!-- Tabla -->
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			{#if $menu.length === 0}
				<div class="py-16 text-center">
					<span class="material-symbols-outlined text-5xl text-on-surface-variant/40">restaurant_menu</span>
					<p class="text-sm text-on-surface-variant mt-3">Aún no tienes productos en el menú</p>
					<button
						onclick={abrirNuevo}
						class="mt-4 px-4 py-2 bg-primary-container hover:bg-primary text-white text-sm font-semibold rounded-lg transition-colors"
					>
						Agregar primer producto
					</button>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="bg-surface-container-low text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
								<th class="py-3 px-4 w-[80px]">Imagen</th>
								<th class="py-3 px-4 min-w-[180px]">Nombre</th>
								<th class="py-3 px-4 min-w-[280px]">Descripción</th>
								<th class="py-3 px-4 w-[100px]">Precio</th>
								<th class="py-3 px-4 w-[100px]">IVA</th>
								<th class="py-3 px-4 w-[130px]">Disponible</th>
								<th class="py-3 px-4 w-[100px] text-right">Acciones</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100">
							{#each $menu as p (p.id_producto)}
								<tr class="hover:bg-surface-container-low/40 transition-colors">
									<td class="py-3 px-4 align-middle">
										<img
											src={p.imagen}
											alt={p.nombre}
											class="w-14 h-14 object-cover rounded-lg shadow-sm"
										/>
									</td>
									<td class="py-3 px-4 align-middle">
										<div class="flex flex-col gap-1">
											<span class="text-sm font-semibold text-on-surface">{p.nombre}</span>
											{#if p.badge}
												<span class="self-start bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
													{p.badge}
												</span>
											{/if}
										</div>
									</td>
									<td class="py-3 px-4 align-middle">
										<p class="text-xs text-on-surface-variant line-clamp-2 max-w-md">
											{p.descripcion}
										</p>
									</td>
									<td class="py-3 px-4 align-middle">
										<span class="text-sm font-bold text-on-surface">{usd(p.precio)}</span>
									</td>
									<td class="py-3 px-4 align-middle">
										{#if p.exento_iva}
											<span class="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-semibold px-2 py-1 rounded-full">
												<span class="material-symbols-outlined text-[13px]">verified</span>
												Exento
											</span>
										{:else}
											<span class="inline-flex items-center bg-surface-container text-on-surface-variant text-[11px] font-semibold px-2 py-1 rounded-full">
												16%
											</span>
										{/if}
									</td>
									<td class="py-3 px-4 align-middle">
										<label class="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={p.disponible}
												onchange={() => toggleDisponible(p.id_producto)}
												class="sr-only peer"
											/>
											<div class="w-10 h-5.5 rounded-full bg-gray-300 peer-checked:bg-primary-container relative transition-colors">
												<div
													class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform
														{p.disponible ? 'translate-x-5' : 'translate-x-0'}"
												></div>
											</div>
										</label>
									</td>
									<td class="py-3 px-4 align-middle text-right">
										<div class="inline-flex items-center gap-1">
											<button
												onclick={() => abrirEditar(p)}
												class="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary-container transition-colors inline-flex items-center justify-center"
												title="Editar"
											>
												<span class="material-symbols-outlined text-[18px]">edit</span>
											</button>
											<button
												onclick={() => pedirEliminar(p)}
												class="w-8 h-8 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors inline-flex items-center justify-center"
												title="Eliminar"
											>
												<span class="material-symbols-outlined text-[18px]">delete</span>
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="px-4 py-3 bg-surface-container-low flex items-center justify-between text-xs text-on-surface-variant">
					<span>Mostrando {$menu.length} productos registrados</span>
					<span class="flex items-center gap-1.5">
						<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
						Actualización en tiempo real
					</span>
				</div>
			{/if}
		</div>
	</main>

	<!-- ══════════════ MODAL: Crear / Editar ══════════════ -->
	{#if modalAbierto}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (modalAbierto = false)}
		>
			<div class="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
				<div class="flex items-center justify-between mb-5">
					<h3 class="text-lg font-bold text-on-surface">
						{modoEdicion ? 'Editar producto' : 'Nuevo producto'}
					</h3>
					<button
						type="button"
						onclick={() => (modalAbierto = false)}
						class="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors"
						aria-label="Cerrar"
					>
						<span class="material-symbols-outlined text-[20px]">close</span>
					</button>
				</div>

				<div class="flex flex-col gap-4">
					<!-- Nombre -->
					<div>
						<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
							Nombre del producto *
						</label>
						<input
							type="text"
							bind:value={formulario.nombre}
							placeholder="Ej: Hamburguesa clásica"
							class="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-sm text-on-surface border border-transparent focus:outline-none focus:border-primary-container focus:bg-white transition-all"
						/>
					</div>

					<!-- Descripción -->
					<div>
						<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
							Descripción
						</label>
						<textarea
							bind:value={formulario.descripcion}
							placeholder="Ingredientes principales, presentación..."
							rows="3"
							class="w-full p-3 rounded-lg bg-surface-container-low text-sm text-on-surface border border-transparent focus:outline-none focus:border-primary-container focus:bg-white transition-all resize-none"
						></textarea>
					</div>

					<!-- Precio -->
					<div>
						<label class="block text-xs font-semibold text-on-surface-variant mb-1.5">
							Precio (USD) *
						</label>
						<div class="flex rounded-lg bg-surface-container-low overflow-hidden focus-within:ring-2 focus-within:ring-primary-container/30 transition-all">
    <span class="flex items-center justify-center w-10 bg-surface-container text-on-surface-variant font-bold text-sm shrink-0">
        $
    </span>
    <input
        type="number"
        min="0"
        step="0.01"
        bind:value={formulario.precio}
        placeholder="0.00"
        class="w-full h-11 px-3 bg-transparent text-sm font-semibold text-on-surface border-0 focus:outline-none"
    />
</div>
					</div>

					<!-- Exento IVA -->
					<label class="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low cursor-pointer">
						<input
							type="checkbox"
							bind:checked={formulario.exento_iva}
							class="w-4 h-4 mt-0.5 rounded accent-primary-container cursor-pointer"
						/>
						<div>
							<span class="block text-sm font-semibold text-on-surface">Exento de IVA</span>
							<span class="block text-[11px] text-on-surface-variant mt-0.5">
								Productos con tasa 0% según normativa fiscal.
							</span>
						</div>
					</label>
				</div>

				<div class="flex items-center justify-end gap-2 mt-6">
					<button
						type="button"
						onclick={() => (modalAbierto = false)}
						class="px-5 py-2.5 rounded-lg text-on-surface hover:bg-surface-container font-semibold text-sm transition-colors"
					>
						Cancelar
					</button>
					<button
						type="button"
						onclick={guardar}
						class="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-white font-bold text-sm transition-colors flex items-center gap-2"
					>
						<span class="material-symbols-outlined text-[18px]">save</span>
						{modoEdicion ? 'Guardar cambios' : 'Agregar producto'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ══════════════ MODAL: Confirmar eliminar ══════════════ -->
	{#if confirmarAbierto}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
			role="presentation"
			onclick={(e) => e.target === e.currentTarget && (confirmarAbierto = false)}
		>
			<div class="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-red-600">warning</span>
					</div>
					<div>
						<h3 class="text-base font-bold text-on-surface">¿Eliminar producto?</h3>
						<p class="text-xs text-on-surface-variant mt-0.5">
							Esta acción no se puede deshacer.
						</p>
					</div>
				</div>

				<p class="text-sm text-on-surface">
					Vas a eliminar:
					<span class="font-bold">{productoAEliminar?.nombre}</span>
				</p>

				<div class="flex justify-end gap-2 mt-5">
					<button
						type="button"
						onclick={() => (confirmarAbierto = false)}
						class="px-4 py-2 rounded-lg text-on-surface hover:bg-surface-container font-semibold text-sm"
					>
						Cancelar
					</button>
					<button
						type="button"
						onclick={confirmarEliminar}
						class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
					>
						Sí, eliminar
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>