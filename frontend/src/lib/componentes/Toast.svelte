<script>
  import { toasts } from '$lib/toast.js';
</script>

<div class="fixed bottom-4 right-4 space-y-2 z-50">
  {#each $toasts as t (t.id)}
    <div
      class="px-4 py-2 rounded shadow-lg text-white text-sm"
      class:bg-red-600={t.tipo === 'error'}
      class:bg-green-600={t.tipo === 'exito'}
      class:bg-blue-600={t.tipo === 'info'}
    >
      {t.mensaje}
    </div>
  {/each}
</div>