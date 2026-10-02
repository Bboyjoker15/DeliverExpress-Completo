<script>
	let { valor = $bindable(0), soloLectura = false, tamaño = 'md' } = $props();

	let hover = $state(0);

	const tamaños = {
		sm: 'text-[20px]',
		md: 'text-[28px]',
		lg: 'text-[36px]'
	};

	function elegir(n) {
		if (soloLectura) return;
		valor = n;
	}
</script>

<div class="flex items-center gap-1">
	{#each [1, 2, 3, 4, 5] as n (n)}
		<button
			type="button"
			disabled={soloLectura}
			onclick={() => elegir(n)}
			onmouseenter={() => !soloLectura && (hover = n)}
			onmouseleave={() => !soloLectura && (hover = 0)}
			class="transition-transform {soloLectura ? 'cursor-default' : 'cursor-pointer hover:scale-110'}"
			aria-label="{n} estrellas"
		>
			<span
				class="material-symbols-outlined {tamaños[tamaño]} transition-colors
					{(hover || valor) >= n ? 'text-amber-400' : 'text-gray-300'}"
				style="font-variation-settings: 'FILL' 1;"
			>
				star
			</span>
		</button>
	{/each}
</div>