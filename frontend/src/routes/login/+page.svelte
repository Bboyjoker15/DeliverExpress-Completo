<script>
	import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { iniciarSesion, RUTA_POR_ROL, sesion, cargarSesion } from '$lib/stores/sesion.js';
    import { mostrarToast } from '$lib/toast.js';
    import { loginMock } from '$lib/mock/usuarios.js';

	let email = $state('cliente01@demo.com');
    let password = $state('demo1234');
    let cargando = $state(false);
    let mostrarPassword = $state(false);

	onMount(() => {
	        cargarSesion();
	        if ($sesion.token && $sesion.rol) {
		            goto(RUTA_POR_ROL[$sesion.rol]);
	        }
    });

	async function enviar(e) {
		e.preventDefault();

		if (!email || !password) {
			mostrarToast('error', 'Completa todos los campos');
			return;
		}

		cargando = true;

		try {
			const data = await loginMock(email, password);
			iniciarSesion(data);
			mostrarToast('exito', `¡Bienvenido, ${data.nombre}!`);

			setTimeout(() => {
				goto(RUTA_POR_ROL[data.rol] ?? '/');
			}, 400);
		} catch (err) {
			mostrarToast('error', err.message || 'Error al iniciar sesión');
			cargando = false;
		}
	}
</script>

<div class="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
	<!-- ============================================ -->
	<!-- COLUMNA IZQUIERDA: Panel naranja con ilustración -->
	<!-- ============================================ -->
	<div class="relative hidden lg:flex flex-col justify-between p-12 bg-[#cc4900] text-white overflow-hidden">
		<!-- Patrón de fondo SVG -->
		<svg
			class="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
			height="100%"
			width="100%"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<pattern height="120" id="delivery-grid" patternUnits="userSpaceOnUse" width="120">
					<path d="M20 20h20v20H20z" fill="none" stroke="currentColor" stroke-dasharray="2 3" stroke-width="1.5" />
					<circle cx="85" cy="30" fill="none" r="14" stroke="currentColor" stroke-width="1.5" />
					<path d="M78 30h14M85 23v14" stroke="currentColor" stroke-width="1.5" />
					<path d="M30 85c0-8 16-8 16 0" fill="none" stroke="currentColor" stroke-width="1.5" />
					<path d="M26 90h24" stroke="currentColor" stroke-width="1.5" />
					<path d="M80 80l15 20M95 80L80 100" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
				</pattern>
			</defs>
			<rect fill="url(#delivery-grid)" height="100%" width="100%" />
		</svg>

		<!-- Glow ambiental -->
		<div class="absolute -top-32 -left-32 w-96 h-96 bg-[#ffdbce] opacity-20 rounded-full blur-3xl pointer-events-none"></div>
		<div class="absolute -bottom-20 -right-20 w-80 h-80 bg-[#a33900] opacity-30 rounded-full blur-2xl pointer-events-none"></div>

		<!-- Header con logo -->
		<div class="relative z-10 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="w-11 h-11 rounded-xl bg-white text-[#cc4900] flex items-center justify-center shadow-md">
					<span class="material-symbols-outlined text-xl font-bold" style="font-variation-settings: 'FILL' 1;">
						electric_moped
					</span>
				</div>
				<div class="flex flex-col">
					<span class="text-xl font-bold tracking-tight text-white">
						Deliver<span class="text-[#ffdbce] font-bold">Express</span>
					</span>
					<span class="text-[11px] font-medium tracking-widest text-[#ffdbce]/80 uppercase">
						Logística & Sabor
					</span>
				</div>
			</div>
			<div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md">
				<span class="inline-block w-2 h-2 rounded-full bg-[#6ffbbe] animate-pulse"></span>
				<span class="text-[11px] font-medium text-white">Envíos activos hoy</span>
			</div>
		</div>

		<!-- Centro: ilustración del repartidor -->
		<div class="relative z-10 my-auto py-10 flex flex-col items-center justify-center">
			<!-- Badge flotante 1: Pizza -->
			<div
				class="absolute top-2 left-6 bg-white/95 text-[#141b2b] px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 -rotate-6 animate-bounce"
				style="animation-duration: 4s;"
			>
				<span class="material-symbols-outlined text-[#cc4900]" style="font-variation-settings: 'FILL' 1;">
					local_pizza
				</span>
				<div class="flex flex-col text-left">
					<span class="text-[11px] font-bold leading-tight">Pizza Artesanal</span>
					<span class="text-[10px] text-[#5a4138]">18-25 min</span>
				</div>
			</div>

			<!-- Badge flotante 2: Smash Burger -->
			<div
				class="absolute bottom-16 right-4 bg-white/95 text-[#141b2b] px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 rotate-3 animate-bounce"
				style="animation-duration: 4.5s; animation-delay: 1s;"
			>
				<span class="material-symbols-outlined text-[#cc4900]" style="font-variation-settings: 'FILL' 1;">
					lunch_dining
				</span>
				<div class="flex flex-col text-left">
					<span class="text-[11px] font-bold leading-tight">Smash Burger</span>
					<span class="text-[10px] font-semibold text-[#006947]">Envío Gratis</span>
				</div>
			</div>

			<!-- Ilustración SVG del repartidor en moto -->
			<div class="w-full max-w-[420px] aspect-[4/3] flex items-center justify-center relative">
				<svg
					class="w-full h-auto drop-shadow-xl"
					fill="none"
					viewBox="0 0 500 350"
					xmlns="http://www.w3.org/2000/svg"
				>
					<!-- Líneas de movimiento -->
					<path d="M30 180H120" opacity="0.6" stroke="currentColor" stroke-dasharray="10 14" stroke-linecap="round" stroke-width="4" />
					<path d="M60 210H140" opacity="0.4" stroke="currentColor" stroke-dasharray="8 12" stroke-linecap="round" stroke-width="4.5" />
					<path d="M15 240H110" opacity="0.5" stroke="currentColor" stroke-dasharray="12 16" stroke-linecap="round" stroke-width="3" />
					<path d="M70 140H150" opacity="0.4" stroke="currentColor" stroke-dasharray="6 10" stroke-linecap="round" stroke-width="3" />

					<!-- Línea del camino -->
					<path d="M40 290C120 290 380 290 470 290" opacity="0.8" stroke="#FFDBCE" stroke-dasharray="24 16" stroke-linecap="round" stroke-width="5" />

					<!-- Rueda trasera -->
					<circle cx="165" cy="255" fill="#141B2B" r="38" stroke="#FFFFFF" stroke-width="6" />
					<circle cx="165" cy="255" fill="#DCE2F7" r="16" />
					<circle cx="165" cy="255" fill="#FFFFFF" r="6" />

					<!-- Rueda delantera -->
					<circle cx="370" cy="255" fill="#141B2B" r="38" stroke="#FFFFFF" stroke-width="6" />
					<circle cx="370" cy="255" fill="#DCE2F7" r="16" />
					<circle cx="370" cy="255" fill="#FFFFFF" r="6" />

					<!-- Chasis de la moto -->
					<path d="M165 255L220 255L270 230L340 230L370 255" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="14" />
					<path d="M225 255L245 185L325 185L340 230" fill="#FFFFFF" />
					<path d="M315 185L345 125L370 125" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" />

					<!-- Faro y luz -->
					<polygon fill="#FFFDB7" opacity="0.35" points="370,130 460,110 470,165 370,140" />
					<circle cx="365" cy="130" fill="#FFFDB7" r="8" />

					<!-- Caja de reparto -->
					<rect fill="#FFFFFF" height="75" rx="10" width="70" x="145" y="120" />
					<rect fill="#CC4900" height="55" rx="6" width="50" x="155" y="130" />
					<path d="M182 140L172 158H183L177 175L192 153H181L186 140H182Z" fill="#FFFFFF" />

					<!-- Repartidor -->
					<path d="M220 185C215 160 230 135 255 130L295 130C305 130 325 145 325 165L305 185Z" fill="#141B2B" />
					<path d="M280 145L340 135" stroke="#141B2B" stroke-linecap="round" stroke-width="12" />

					<!-- Casco -->
					<circle cx="280" cy="98" fill="#FFFFFF" r="26" />
					<path d="M275 88C290 88 302 96 304 108H275V88Z" fill="#CC4900" />

					<!-- Bufanda -->
					<path d="M255 125C230 120 210 110 190 115C200 125 220 132 250 132Z" fill="#FFDBCE" />
				</svg>
			</div>

			<!-- Cápsula de métricas -->
			<div class="mt-4 flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-[#ffddb7] text-lg">bolt</span>
					<span class="text-sm font-semibold text-white">28 min prom.</span>
				</div>
				<div class="w-px h-5 bg-white/30"></div>
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-[#ffddb7] text-lg">verified</span>
					<span class="text-sm font-semibold text-white">Seguimiento en vivo</span>
				</div>
			</div>
		</div>

		<!-- Tagline inferior -->
		<div class="relative z-10 max-w-md">
			<h2 class="text-2xl font-bold text-white mb-2 leading-tight">
				Tus pedidos favoritos en minutos a tu puerta
			</h2>
			<p class="text-sm text-[#ffdbce] leading-relaxed">
				Accede a los mejores restaurantes y mercados locales con despacho optimizado y entregas sin demoras.
			</p>
		</div>
	</div>

	<!-- ============================================ -->
	<!-- COLUMNA DERECHA: Formulario -->
	<!-- ============================================ -->
	<div class="flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 bg-white min-h-screen">
		<!-- Logo mobile (visible solo en pantallas pequeñas) -->
		<div class="lg:hidden flex items-center gap-2.5 mb-8">
			<div class="w-10 h-10 rounded-xl bg-[#cc4900] text-white flex items-center justify-center shadow-md">
				<span class="material-symbols-outlined font-bold">electric_moped</span>
			</div>
			<span class="text-xl font-bold text-[#141b2b]">
				Deliver<span class="text-[#cc4900] font-bold">Express</span>
			</span>
		</div>

		<!-- Card del formulario -->
		<div class="w-full max-w-[400px] bg-white rounded-xl p-8 shadow-sm flex flex-col">
			<div class="mb-6">
				<h1 class="text-2xl font-bold text-[#141b2b] tracking-tight mb-1">
					Bienvenido de nuevo
				</h1>
				<p class="text-sm text-[#8e7166]">Ingresa con tu cuenta para continuar</p>
			</div>

			<form onsubmit={enviar} class="flex flex-col gap-4">
				<!-- Email -->
				<div class="flex flex-col gap-1.5 text-left">
					<label for="email" class="text-sm text-[#141b2b] font-medium">Correo electrónico</label>
					<div class="relative flex items-center">
						<span class="material-symbols-outlined absolute left-3 text-[#8e7166] text-base pointer-events-none select-none">
							mail
						</span>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="ejemplo@correo.com"
							class="w-full h-[44px] pl-10 pr-3 rounded-lg bg-[#f9f9ff] text-[#141b2b] text-sm placeholder:text-[#8e7166] focus:outline-none focus:ring-2 focus:ring-[#cc4900]/20 transition-all shadow-inner"
						/>
					</div>
				</div>

				<!-- Password -->
				<div class="flex flex-col gap-1.5 text-left">
					<div class="flex items-center justify-between">
						<label for="password" class="text-sm text-[#141b2b] font-medium">Contraseña</label>
					</div>
					<div class="relative flex items-center">
						<span class="material-symbols-outlined absolute left-3 text-[#8e7166] text-base pointer-events-none select-none">
							lock
						</span>
						<input
							id="password"
							type={mostrarPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="••••••••"
							class="w-full h-[44px] pl-10 pr-10 rounded-lg bg-[#f9f9ff] text-[#141b2b] text-sm placeholder:text-[#8e7166] focus:outline-none focus:ring-2 focus:ring-[#cc4900]/20 transition-all shadow-inner"
						/>
						<button
							type="button"
							onclick={() => (mostrarPassword = !mostrarPassword)}
							class="absolute right-3 text-[#8e7166] hover:text-[#141b2b] p-1 rounded transition-colors flex items-center justify-center"
							aria-label="Alternar visibilidad de contraseña"
						>
							<span class="material-symbols-outlined text-base select-none">
								{mostrarPassword ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</div>

				<!-- Remember -->
				<div class="flex items-center gap-2 mt-1">
					<input
						id="remember"
						type="checkbox"
						checked
						class="w-4 h-4 rounded accent-[#cc4900] focus:ring-0 cursor-pointer"
					/>
					<label for="remember" class="text-xs text-[#141b2b] select-none cursor-pointer">
						Recordar en este dispositivo
					</label>
				</div>

				<!-- Submit -->
				<button
					type="submit"
					disabled={cargando}
					class="w-full h-[44px] mt-2 bg-[#cc4900] hover:bg-[#a33900] disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.99]"
				>
					{#if cargando}
						<span class="material-symbols-outlined text-base animate-spin">progress_activity</span>
						<span>Ingresando...</span>
					{:else}
						<span>Iniciar sesión</span>
						<span class="material-symbols-outlined text-base font-bold">arrow_forward</span>
					{/if}
				</button>
			</form>

			<!-- Link a registro -->
			<div class="text-center mt-5">
				<p class="text-sm text-[#8e7166]">
					¿No tienes cuenta?
					<a href="/registro" class="text-sm font-bold text-[#cc4900] hover:underline ml-1">
						Regístrate
					</a>
				</p>
			</div>

			<!-- Demo -->
			<div class="mt-6 py-2.5 px-3 rounded-lg bg-[#f9f9ff] text-center flex items-center justify-center gap-2">
				<span class="material-symbols-outlined text-base text-[#8e7166]">key</span>
				<span class="text-xs text-[#8e7166] font-medium tracking-tight">
					Demo: <strong class="text-[#141b2b]">cliente01@demo.com</strong> /
					<strong class="text-[#141b2b]">demo1234</strong>
				</span>
			</div>

			<!-- Seguridad al pie -->
			<div class="mt-8 flex items-center justify-center gap-4 text-[#8e7166] text-xs">
				<span class="flex items-center gap-1">
					<span class="material-symbols-outlined text-[15px] text-[#006947]">shield</span>
					Transacción Segura
				</span>
				<span>•</span>
				<span class="flex items-center gap-1">
					<span class="material-symbols-outlined text-[15px] text-[#cc4900]">support_agent</span>
					Soporte 24/7
				</span>
			</div>
		</div>
	</div>
</div>