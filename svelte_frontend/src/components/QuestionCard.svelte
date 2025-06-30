<script>
  export let questions;
  export let currentIndex;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="border p-4 rounded shadow max-w-xl mx-auto mt-8">
  <h2 class="text-xl font-bold mb-4">{questions[currentIndex].question}</h2>
  <div class="space-y-2">
    {#each questions[currentIndex].options as option, i}
      <button
        class="block w-full bg-gray-200 hover:bg-blue-300 px-4 py-2 rounded"
        on:click={() => dispatch('answer', i)}>
        {option}
      </button>
    {/each}
  </div>
</div>
