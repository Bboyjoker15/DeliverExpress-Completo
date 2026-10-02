<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let { restaurantes = [], repartidores = [], pedidos = [], clientes = [] } = $props();

  let mapaEl;
  let mapa = null;
  let marcadoresLayer = null;
  let L = null;
  let listo = false;
  let filtroActivo = $state('todos');

  const COLORES = {
    restaurante: '#cc4900',
    repartidor_libre: '#2563eb',
    repartidor_ocupado: '#9ca3af',
    pedido: '#8b5cf6',
    cliente: '#7c3aed'
  };

  function crearIcono(color, icono) {
    if (!L) return null;
    return L.divIcon({
      className: 'marcador-custom',
      html: `<div style="background:${color};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid white;color:white;"><span class="material-symbols-outlined" style="font-size:18px;line-height:1;">${icono}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
  }

  function pintarMarcadores() {
    if (!mapa || !marcadoresLayer || !L || !listo) return;
    marcadoresLayer.clearLayers();

    if (filtroActivo === 'todos' || filtroActivo === 'restaurantes') {
      restaurantes.forEach(r => {
        const icono = crearIcono(COLORES.restaurante, 'storefront');
        if (icono) {
          L.marker([r.latitud, r.longitud], { icon: icono })
            .bindPopup(`<b>${r.nombre}</b><br/>${r.categoria ?? ''}`)
            .addTo(marcadoresLayer);
        }
      });
    }

    if (filtroActivo === 'todos' || filtroActivo === 'clientes') {
      clientes.forEach(c => {
        const icono = crearIcono(COLORES.cliente, 'home');
        if (icono) {
          L.marker([c.latitud, c.longitud], { icon: icono })
            .bindPopup(`<b>${c.nombre}</b><br/>${c.direccion ?? ''}`)
            .addTo(marcadoresLayer);
        }
      });
    }

    if (filtroActivo === 'todos' || filtroActivo === 'repartidores') {
      repartidores.forEach(r => {
        const color = r.disponibilidad === 'libre' ? COLORES.repartidor_libre : COLORES.repartidor_ocupado;
        const icono = crearIcono(color, 'two_wheeler');
        if (icono) {
          L.marker([r.latitud_actual, r.longitud_actual], { icon: icono })
            .bindPopup(`<b>${r.nombre}</b><br/>${r.vehiculo ?? ''} - ${r.zona ?? ''}<br/>${r.calificacion_promedio ?? ''} estrellas`)
            .addTo(marcadoresLayer);
        }
      });
    }

    if (filtroActivo === 'todos' || filtroActivo === 'pedidos') {
      pedidos.forEach(p => {
        if (p.restaurante?.latitud && p.restaurante?.longitud) {
          const icono = crearIcono(COLORES.pedido, 'shopping_bag');
          if (icono) {
            L.marker([p.restaurante.latitud, p.restaurante.longitud], { icon: icono })
              .bindPopup(`<b>#${p.id_pedido}</b><br/>${p.restaurante.nombre}`)
              .addTo(marcadoresLayer);
          }
        }
      });
    }
  }

  function cambiarFiltro(nuevo) {
    filtroActivo = nuevo;
    pintarMarcadores();
  }

  onMount(async () => {
    if (!browser || !mapaEl) return;

    try {
      const modulo = await import('leaflet');
      L = modulo.default;
      await import('leaflet/dist/leaflet.css');

      mapa = L.map(mapaEl, {
        center: [8.29, -62.715],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap',
        maxZoom: 19
      }).addTo(mapa);

      marcadoresLayer = L.layerGroup().addTo(mapa);
      listo = true;
      pintarMarcadores();
    } catch (error) {
      console.error('Error cargando Leaflet:', error);
    }
  });
</script>

<div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center gap-2">
    <button
      onclick={() => cambiarFiltro('todos')}
      class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
        {filtroActivo === 'todos'
          ? 'bg-primary-container text-white'
          : 'bg-white text-on-surface-variant border border-gray-200 hover:border-primary'}"
    >
      Todos
    </button>

    {#if restaurantes.length > 0}
      <button
        onclick={() => cambiarFiltro('restaurantes')}
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5
          {filtroActivo === 'restaurantes'
            ? 'bg-primary-container text-white'
            : 'bg-white text-on-surface-variant border border-gray-200 hover:border-primary'}"
      >
        <span class="w-2 h-2 rounded-full bg-[#cc4900]"></span>
        Restaurantes ({restaurantes.length})
      </button>
    {/if}

    {#if clientes.length > 0}
      <button
        onclick={() => cambiarFiltro('clientes')}
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5
          {filtroActivo === 'clientes'
            ? 'bg-primary-container text-white'
            : 'bg-white text-on-surface-variant border border-gray-200 hover:border-primary'}"
      >
        <span class="w-2 h-2 rounded-full bg-[#7c3aed]"></span>
        Cliente ({clientes.length})
      </button>
    {/if}

    {#if repartidores.length > 0}
      <button
        onclick={() => cambiarFiltro('repartidores')}
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5
          {filtroActivo === 'repartidores'
            ? 'bg-primary-container text-white'
            : 'bg-white text-on-surface-variant border border-gray-200 hover:border-primary'}"
      >
        <span class="w-2 h-2 rounded-full bg-[#2563eb]"></span>
        Repartidores ({repartidores.length})
      </button>
    {/if}

    {#if pedidos.length > 0}
      <button
        onclick={() => cambiarFiltro('pedidos')}
        class="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5
          {filtroActivo === 'pedidos'
            ? 'bg-primary-container text-white'
            : 'bg-white text-on-surface-variant border border-gray-200 hover:border-primary'}"
      >
        <span class="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
        Pedidos ({pedidos.length})
      </button>
    {/if}
  </div>

  <div class="relative">
    <div
      bind:this={mapaEl}
      style="width: 100%; height: 520px; min-height: 520px; display: block; background: #e5e7eb;"
      class="rounded-2xl overflow-hidden shadow-sm border border-gray-200"
    ></div>

    <div class="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur rounded-xl shadow-md px-4 py-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px]">
      {#if restaurantes.length > 0}
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#cc4900]"></span>
          <span class="text-on-surface-variant font-medium">Restaurantes: <b class="text-on-surface">{restaurantes.length}</b></span>
        </span>
      {/if}
      {#if clientes.length > 0}
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#7c3aed]"></span>
          <span class="text-on-surface-variant font-medium">Cliente: <b class="text-on-surface">{clientes.length}</b></span>
        </span>
      {/if}
      {#if repartidores.length > 0}
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
          <span class="text-on-surface-variant font-medium">Repartidores: <b class="text-on-surface">{repartidores.length}</b></span>
        </span>
      {/if}
      {#if pedidos.length > 0}
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
          <span class="text-on-surface-variant font-medium">Pedidos: <b class="text-on-surface">{pedidos.length}</b></span>
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.marcador-custom) {
    background: transparent !important;
    border: none !important;
  }
</style>