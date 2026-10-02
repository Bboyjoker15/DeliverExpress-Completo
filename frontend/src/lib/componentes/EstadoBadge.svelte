<script>
	import { ESTADOS } from '$lib/estados.js';

	let { codigo } = $props();

	let estado = $derived(ESTADOS[codigo] ?? { texto: codigo, clase: 'bg-gray-200 text-gray-800' });
</script>

<span class="px-2 py-0.5 rounded text-xs font-medium {estado.clase}">
	{estado.texto}
</span>