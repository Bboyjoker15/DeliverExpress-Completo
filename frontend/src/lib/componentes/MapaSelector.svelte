<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let {
		lat = $bindable(8.29),
		lon = $bindable(-62.74),
		zoom = 15,
		height = '300px'
	} = $props();

	let mapaEl;
	let mapa = null;
	let marker = null;
	let L = null;

	onMount(async () => {
		if (!browser || !mapaEl) return;

		try {
			const modulo = await import('leaflet');
			L = modulo.default;
			await import('leaflet/dist/leaflet.css');

			mapa = L.map(mapaEl, {
				center: [lat, lon],
				zoom,
				zoomControl: true
			});

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: 'OpenStreetMap',
				maxZoom: 19
			}).addTo(mapa);

			const icono = L.divIcon({
				className: 'marker-selector',
				html: `<div style="background:#cc4900;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.4);border:3px solid white;"><div style="transform:rotate(45deg);color:white;font-size:18px;">📍</div></div>`,
				iconSize: [36, 36],
				iconAnchor: [18, 36]
			});

			marker = L.marker([lat, lon], { icon: icono, draggable: true }).addTo(mapa);

			// Clic en el mapa → mover pin
			mapa.on('click', (e) => {
				lat = +e.latlng.lat.toFixed(6);
				lon = +e.latlng.lng.toFixed(6);
				marker.setLatLng([lat, lon]);
			});

			// Arrastrar pin
			marker.on('dragend', () => {
				const pos = marker.getLatLng();
				lat = +pos.lat.toFixed(6);
				lon = +pos.lng.toFixed(6);
			});
		} catch (error) {
			console.error('Error cargando Leaflet en MapaSelector:', error);
		}
	});
</script>

<div class="flex flex-col gap-2">
	<div
		bind:this={mapaEl}
		style="width: 100%; height: {height}; display: block; background: #e5e7eb;"
		class="rounded-xl overflow-hidden shadow-sm border border-gray-200"
	></div>

	<div class="flex items-center gap-2 text-[11px] text-on-surface-variant">
		<span class="material-symbols-outlined text-[14px] text-primary-container">touch_app</span>
		<span>Haz clic en el mapa o arrastra el pin para marcar la ubicación</span>
	</div>

	<div class="flex items-center gap-4 text-[11px] text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-lg">
		<span>
			<span class="font-semibold">Lat:</span>
			<span class="font-mono text-on-surface">{lat}</span>
		</span>
		<span>
			<span class="font-semibold">Lon:</span>
			<span class="font-mono text-on-surface">{lon}</span>
		</span>
	</div>
</div>

<style>
	:global(.marker-selector) {
		background: transparent !important;
		border: none !important;
	}
</style>