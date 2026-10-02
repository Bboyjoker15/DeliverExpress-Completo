<script>
	import { goto } from '$app/navigation';
	import { iniciarSesion, RUTA_POR_ROL } from '$lib/stores/sesion.js';
	import { mostrarToast } from '$lib/toast.js';

	let nombre = $state('');
	let email = $state('');
	let telefono = $state('');
	let cedula = $state('');
	let password = $state('');
	let confirmar = $state('');
	let acepta = $state(false);
	let cargando = $state(false);
	let mostrarPassword1 = $state(false);
	let mostrarPassword2 = $state(false);

	const DOMINIOS_VALIDOS = [
		'gmail.com',
		'googlemail.com',
		'hotmail.com',
		'hotmail.es',
		'hotmail.com.ve',
		'outlook.com',
		'outlook.es',
		'outlook.com.ve',
		'live.com',
		'live.com.ve',
		'yahoo.com',
		'yahoo.es',
		'yahoo.com.ve',
		'icloud.com',
		'me.com',
		'protonmail.com',
		'proton.me',
		'gmx.com',
		'aol.com'
	];

	const PATTERN_TELEFONO = '[0-9]{10,11}';
	const PATTERN_CEDULA = '[VvJj]-?[0-9]{7,9}(-[0-9])?';

	async function enviar(e) {
		e.preventDefault();

		const form = e.currentTarget;
		const emailInput = form.querySelector('#email');
		const confirmInput = form.querySelector('#confirmPassword');
		const termsInput = form.querySelector('#terms');

		// Limpiar mensajes personalizados previos
		emailInput.setCustomValidity('');
		confirmInput.setCustomValidity('');
		termsInput.setCustomValidity('');

		// 1. Dominio permitido (Gmail, Hotmail, Outlook, etc.)
		const dominio = (email.split('@')[1] || '').toLowerCase();
		if (!DOMINIOS_VALIDOS.includes(dominio)) {
			emailInput.setCustomValidity(
				`"${dominio}" no es un dominio de correo válido. Usa gmail.com, hotmail.com, outlook.com, yahoo.com, etc.`
			);
			emailInput.reportValidity();
			return;
		}

		// 2. Contraseñas iguales
		if (password !== confirmar) {
			confirmInput.setCustomValidity('Las contraseñas no coinciden');
			confirmInput.reportValidity();
			return;
		}

		// 3. Términos aceptados
		if (!acepta) {
			termsInput.setCustomValidity('Debes aceptar los términos y condiciones');
			termsInput.reportValidity();
			return;
		}

		cargando = true;

		try {
			await new Promise((r) => setTimeout(r, 700));

			const data = {
				token: 'fake-jwt-cliente-nuevo',
				rol: 'cliente',
				id_perfil: 99,
				nombre
			};

			iniciarSesion(data);
			mostrarToast('exito', `¡Bienvenido, ${nombre}!`);

			setTimeout(() => {
				goto(RUTA_POR_ROL[data.rol]);
			}, 500);
		} catch (err) {
			mostrarToast('error', err.message || 'Error al crear la cuenta');
			cargando = false;
		}
	}
</script>

<style>
	.registro-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 100vh;
		background: white;
	}
	.registro-izq {
		width: 100%;
		position: relative;
		background: #cc4900;
		color: white;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
		min-height: 520px;
	}
	.registro-der {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: #f9f9ff;
	}
	@media (min-width: 640px) {
		.registro-wrapper { flex-direction: row; }
		.registro-izq { width: 50%; padding: 3.5rem; min-height: 100vh; }
		.registro-der { width: 50%; padding: 3rem; }
	}
	.logo-mobile { display: flex; }
	@media (min-width: 640px) { .logo-mobile { display: none; } }
	.insignia-envios {
		position: absolute; top: 0.5rem; left: -0.5rem; z-index: 20;
		background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px);
		border-radius: 0.75rem; padding: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15);
		display: flex; align-items: center; gap: 0.625rem;
	}
	.insignia-tiempo {
		position: absolute; bottom: 1rem; right: -0.5rem; z-index: 20;
		background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px);
		border-radius: 0.75rem; padding: 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15);
		display: flex; align-items: center; gap: 0.625rem;
	}
	.insignia-seguimiento {
		position: absolute; top: 50%; right: -1rem; transform: translateY(-50%); z-index: 20;
		background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px);
		border-radius: 0.75rem; padding: 0.5rem 0.75rem; box-shadow: 0 10px 25px rgba(0,0,0,0.15);
		display: flex; align-items: center; gap: 0.5rem;
	}
</style>

<div class="registro-wrapper">
	<!-- ══════════ COLUMNA IZQUIERDA ══════════ -->
	<div class="registro-izq">
		<div class="absolute inset-0 opacity-10 pointer-events-none">
			<svg class="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern height="90" id="gastro-pattern" patternUnits="userSpaceOnUse" width="90">
						<path d="M15 15 L35 22 L22 35 Z" opacity="0.8" />
						<circle cx="24" cy="22" r="2" />
						<path d="M55 20 Q65 12 75 20 Q75 24 65 24 Q55 24 55 20 Z" opacity="0.8" />
						<rect height="4" opacity="0.6" rx="2" width="22" x="54" y="26" />
						<path d="M20 65 L26 71 M26 65 L20 71" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
						<line stroke="currentColor" stroke-linecap="round" stroke-width="3" x1="55" x2="80" y1="65" y2="65" />
						<line stroke="currentColor" stroke-linecap="round" stroke-width="2" x1="62" x2="85" y1="73" y2="73" />
					</pattern>
				</defs>
				<rect fill="url(#gastro-pattern)" height="100%" width="100%" />
			</svg>
		</div>

		<div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary opacity-40 blur-3xl pointer-events-none"></div>
		<div class="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-on-primary-fixed-variant opacity-30 blur-3xl pointer-events-none"></div>

		<div class="relative z-10">
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-md">
					<span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">electric_moped</span>
				</div>
				<div>
					<span class="text-2xl tracking-tight font-bold text-white leading-none block">DeliverExpress</span>
					<span class="text-[11px] tracking-widest text-primary-fixed uppercase font-semibold mt-0.5 block">Logística & Sabor</span>
				</div>
			</div>
			<p class="text-lg font-semibold text-white mt-6 max-w-md">
				Tus pedidos favoritos en minutos a tu puerta.
			</p>
		</div>

		<div class="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
			<div class="relative w-full max-w-md flex items-center justify-center">
				<div class="insignia-envios">
					<span class="relative flex h-3 w-3">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
						<span class="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
					</span>
					<div>
						<span class="block text-[11px] text-on-surface-variant leading-none uppercase">Envíos Activos</span>
						<span class="text-sm font-semibold text-on-surface leading-tight">1,842 repartidores</span>
					</div>
				</div>

				<div class="insignia-tiempo">
					<div class="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
						<span class="material-symbols-outlined text-[20px]">timer</span>
					</div>
					<div>
						<span class="block text-[11px] text-on-surface-variant leading-none">Tiempo récord</span>
						<span class="text-sm font-semibold text-on-surface leading-tight">28 min prom.</span>
					</div>
				</div>

				<div class="insignia-seguimiento">
					<span class="material-symbols-outlined text-primary text-[18px]">satellite_alt</span>
					<span class="text-xs font-medium text-on-surface">Seguimiento en vivo</span>
				</div>

				<div class="w-72 h-72 sm:w-80 sm:h-80 relative flex items-center justify-center">
					<svg class="w-full h-full filter drop-shadow-2xl" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
						<circle cx="160" cy="160" fill="#ffdbce" opacity="0.2" r="130" />
						<circle cx="160" cy="160" fill="none" opacity="0.3" r="105" stroke="white" stroke-dasharray="8 8" stroke-width="2" />
						<path d="M20 180 L80 180 M10 200 L95 200 M35 220 L75 220" opacity="0.8" stroke="#FFF" stroke-linecap="round" stroke-width="4" />
						<path d="M45 130 L90 130 M25 150 L65 150" opacity="0.6" stroke="#FFF" stroke-linecap="round" stroke-width="3" />
						<ellipse cx="165" cy="255" fill="#000000" opacity="0.2" rx="90" ry="10" />
						<circle cx="230" cy="225" fill="#141B2B" r="26" />
						<circle cx="230" cy="225" fill="#E9EDFF" r="14" />
						<circle cx="230" cy="225" fill="#141B2B" r="5" />
						<circle cx="105" cy="225" fill="#141B2B" r="26" />
						<circle cx="105" cy="225" fill="#E9EDFF" r="14" />
						<circle cx="105" cy="225" fill="#141B2B" r="5" />
						<path d="M110 220 L145 220 L170 190 L210 185 L225 220" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="8" />
						<path d="M165 190 L185 145 L205 145" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="7" />
						<polygon fill="#FFFFFF" points="135,215 170,215 185,175 145,175" />
						<polygon fill="#FFDBCE" opacity="0.5" points="215,150 260,135 260,175" />
						<path d="M150 175 L165 210 L185 210" fill="none" stroke="#141B2B" stroke-linecap="round" stroke-linejoin="round" stroke-width="9" />
						<path d="M152 145 L175 125 L198 147" fill="none" stroke="#141B2B" stroke-linecap="round" stroke-linejoin="round" stroke-width="9" />
						<rect fill="#FFFFFF" height="48" rx="6" width="42" x="110" y="115" />
						<rect fill="#EA580C" height="36" rx="4" width="32" x="115" y="121" />
						<path d="M125 130 L137 130 M125 137 L134 137 M125 144 L138 144" stroke="#FFFFFF" stroke-linecap="round" stroke-width="2.5" />
						<circle cx="178" cy="106" fill="#141B2B" r="16" />
						<path d="M182 102 Q193 105 188 114" stroke="#FFDBCE" stroke-linecap="round" stroke-width="4" />
					</svg>
				</div>
			</div>
		</div>

		<div class="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-6">
			<div class="flex items-center gap-3">
				<div class="flex -space-x-2">
					<div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary font-bold text-[11px] shadow">JP</div>
					<div class="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-[11px] shadow">LM</div>
					<div class="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-[11px] shadow">+9k</div>
				</div>
				<p class="text-sm text-white">
					Más de <strong>45,000 órdenes</strong> entregadas sin retrasos este mes.
				</p>
			</div>
			<div class="flex items-center gap-1.5 text-xs font-medium text-primary-fixed bg-on-primary-fixed-variant/40 py-1.5 px-3 rounded-full">
				<span class="material-symbols-outlined text-[16px] text-tertiary-fixed">verified</span>
				Cobertura nacional
			</div>
		</div>
	</div>

	<!-- ══════════ COLUMNA DERECHA: Formulario ══════════ -->
	<div class="registro-der">
		<div class="w-full max-w-[420px] bg-white rounded-xl p-8 shadow-sm flex flex-col">
			<div class="mb-6">
				<div class="logo-mobile items-center gap-2 mb-2">
					<span class="material-symbols-outlined text-primary text-[24px]">electric_moped</span>
					<span class="text-lg font-bold text-primary">DeliverExpress</span>
				</div>
				<h1 class="text-2xl font-bold text-on-surface">Crea tu cuenta</h1>
				<p class="text-sm text-on-surface-variant mt-1">Únete a DeliverExpress y pide sin demoras</p>
			</div>

			<!-- ⚠️ SIN novalidate: dejamos que el navegador valide pattern, required, minlength -->
			<form onsubmit={enviar} class="flex flex-col gap-4">
				<!-- 1. Nombre -->
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-semibold text-on-surface" for="fullName">Nombre completo</label>
					<div class="relative flex items-center">
						<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">person</span>
						<input
							id="fullName"
							type="text"
							bind:value={nombre}
							placeholder="Ej. Carlos Mendoza"
							required
							minlength="3"
							title="Escribe tu nombre completo (mínimo 3 letras)"
							class="w-full h-11 pl-10 pr-3.5 bg-surface-container-low rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
						/>
					</div>
				</div>

				<!-- 2. Email -->
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-semibold text-on-surface" for="email">Correo electrónico</label>
					<div class="relative flex items-center">
						<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">mail</span>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="tuemail@gmail.com"
							required
							title="Escribe un correo válido, por ejemplo: nombre@gmail.com"
							oninput={(e) => e.currentTarget.setCustomValidity('')}
							class="w-full h-11 pl-10 pr-3.5 bg-surface-container-low rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
						/>
					</div>
				</div>

				<!-- 3. Teléfono -->
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-semibold text-on-surface" for="phone">Teléfono</label>
					<div class="flex items-stretch">
						<div class="flex items-center gap-1 px-3 bg-surface-container rounded-l-lg border border-r-0 border-outline-variant/30 select-none shrink-0">
							<span class="material-symbols-outlined text-on-surface-variant text-[18px]">call</span>
							<span class="text-sm font-semibold text-on-surface">+58</span>
						</div>
						<input
							id="phone"
							type="tel"
							bind:value={telefono}
							placeholder="4141234567"
							required
							pattern={PATTERN_TELEFONO}
							maxlength="11"
							title="Escribe 10 u 11 dígitos sin espacios (sin el +58)"
							class="w-full h-11 pl-3 pr-3.5 bg-surface-container-low rounded-r-lg text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
						/>
					</div>
				</div>

				<!-- 4. Cédula o RIF (ahora SÍ valida los dígitos) -->
				<div class="flex flex-col gap-1.5">
					<div class="flex items-center justify-between">
						<label class="text-xs font-semibold text-on-surface" for="govId">Cédula o RIF</label>
						<span class="text-[11px] text-on-surface-variant">Opcional</span>
					</div>
					<div class="relative flex items-center">
						<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">badge</span>
						<input
							id="govId"
							type="text"
							bind:value={cedula}
							placeholder="V-12345678 o J-12345678-9"
							pattern={PATTERN_CEDULA}
							title="Cédula incompleta. Debe ser V- seguido de 7 a 9 dígitos, o J- seguido de 8 dígitos y guion"
							class="w-full h-11 pl-10 pr-3.5 bg-surface-container-low rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all uppercase"
						/>
					</div>
				</div>

				<!-- 5. Contraseña -->
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-semibold text-on-surface" for="password">Contraseña</label>
					<div class="relative flex items-center">
						<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">lock</span>
						<input
							id="password"
							type={mostrarPassword1 ? 'text' : 'password'}
							bind:value={password}
							placeholder="Mínimo 8 caracteres"
							required
							minlength="8"
							title="Aumenta la longitud del texto a 8 caracteres como mínimo"
							class="w-full h-11 pl-10 pr-10 bg-surface-container-low rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
						/>
						<button
							type="button"
							onclick={() => (mostrarPassword1 = !mostrarPassword1)}
							class="absolute right-3 text-on-surface-variant hover:text-on-surface transition-colors p-1"
							aria-label="Mostrar contraseña"
						>
							<span class="material-symbols-outlined text-[20px]">
								{mostrarPassword1 ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</div>

				<!-- 6. Confirmar contraseña -->
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-semibold text-on-surface" for="confirmPassword">Confirmar contraseña</label>
					<div class="relative flex items-center">
						<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">lock_clock</span>
						<input
							id="confirmPassword"
							type={mostrarPassword2 ? 'text' : 'password'}
							bind:value={confirmar}
							placeholder="Repite tu contraseña"
							required
							minlength="8"
							title="Aumenta la longitud del texto a 8 caracteres como mínimo"
							oninput={(e) => e.currentTarget.setCustomValidity('')}
							class="w-full h-11 pl-10 pr-10 bg-surface-container-low rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
						/>
						<button
							type="button"
							onclick={() => (mostrarPassword2 = !mostrarPassword2)}
							class="absolute right-3 text-on-surface-variant hover:text-on-surface transition-colors p-1"
							aria-label="Mostrar contraseña"
						>
							<span class="material-symbols-outlined text-[20px]">
								{mostrarPassword2 ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</div>

				<!-- Términos -->
				<div class="flex items-start gap-2.5 pt-1">
					<input
						id="terms"
						type="checkbox"
						bind:checked={acepta}
						title="Debes aceptar los términos y condiciones"
						oninput={(e) => e.currentTarget.setCustomValidity('')}
						class="w-4 h-4 mt-0.5 rounded accent-[#a33900] cursor-pointer"
					/>
					<label for="terms" class="text-xs text-on-surface-variant leading-tight cursor-pointer">
						Acepto los <a href="#" class="text-primary hover:underline font-semibold">términos y condiciones</a> y
						las <a href="#" class="text-primary hover:underline font-semibold">políticas de privacidad</a>.
					</label>
				</div>

				<!-- Submit -->
				<button
					type="submit"
					disabled={cargando}
					class="w-full h-11 mt-2 bg-primary-container hover:bg-primary disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
				>
					{#if cargando}
						<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
						<span>Creando cuenta...</span>
					{:else}
						<span>Registrarme</span>
						<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
					{/if}
				</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-on-surface-variant">
					¿Ya tienes cuenta?
					<a href="/login" class="text-sm font-bold text-primary ml-1 hover:underline">Inicia sesión</a>
				</p>
			</div>

			<div class="mt-6 pt-4 flex items-center justify-center gap-5 text-on-surface-variant bg-surface-container-low rounded-lg py-2.5 px-3">
				<div class="flex items-center gap-1.5">
					<span class="material-symbols-outlined text-tertiary text-[18px]">verified_user</span>
					<span class="text-[11px] font-medium">Datos cifrados SSL</span>
				</div>
				<span class="text-outline-variant">•</span>
				<div class="flex items-center gap-1.5">
					<span class="material-symbols-outlined text-primary text-[18px]">bolt</span>
					<span class="text-[11px] font-medium">Entrega asegurada</span>
				</div>
			</div>
		</div>
	</div>
</div>