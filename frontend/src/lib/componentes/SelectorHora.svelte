<script>
	let { value = $bindable('09:00') } = $props();

	// Parsear "HH:MM" a formato 12h
	let [h24Str, mStr] = value.split(':');
	let h24 = parseInt(h24Str) || 0;
	let minuto = parseInt(mStr) || 0;

	let periodo = $derived(h24 >= 12 ? 'PM' : 'AM');
	let hora12 = $derived(h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24);

	function actualizar(nuevaHora12, nuevoMinuto, nuevoPeriodo) {
		let h = nuevoHora12;
		if (nuevoPeriodo === 'AM') {
			if (h === 12) h = 0;
		} else {
			if (h !== 12) h = h + 12;
		}
		value = `${String(h).padStart(2, '0')}:${String(nuevoMinuto).padStart(2, '0')}`;
	}

	const HORAS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	const MINUTOS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
</script>

<div class="flex items-center gap-1">
	<select
		value={hora12}
		onchange={(e) => actualizar(parseInt(e.target.value), minuto, periodo)}
		class="h-9 pl-2 pr-6 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold border border-transparent focus:outline-none focus:border-primary-container focus:bg-white transition-all appearance-none"
	>
		{#each HORAS as h (h)}
			<option value={h}>{h}</option>
		{/each}
	</select>

	<span class="text-on-surface-variant text-xs font-bold">:</span>

	<select
		value={minuto}
		onchange={(e) => actualizar(hora12, parseInt(e.target.value), periodo)}
		class="h-9 pl-2 pr-6 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold border border-transparent focus:outline-none focus:border-primary-container focus:bg-white transition-all appearance-none"
	>
		{#each MINUTOS as m (m)}
			<option value={m}>{String(m).padStart(2, '0')}</option>
		{/each}
	</select>

	<select
		value={periodo}
		onchange={(e) => actualizar(hora12, minuto, e.target.value)}
		class="h-9 pl-2 pr-6 rounded-lg bg-surface-container-low text-on-surface text-xs font-bold border border-transparent focus:outline-none focus:border-primary-container focus:bg-white transition-all appearance-none"
	>
		<option value="AM">AM</option>
		<option value="PM">PM</option>
	</select>
</div>