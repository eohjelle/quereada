<script lang="ts">
  import { api } from "$bridge/api_endpoint";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let isOpen = false;
  let feedTitle = "";
  let isLoading = false;
  let error = "";

  // Available blocks to include in the feed
  let availableBlocks: Array<{ title: string; implementation: string }> = [];
  let selectedBlocks: string[] = [];

  export async function open() {
    isOpen = true;
    reset();
    await loadAvailableBlocks();
  }

  function reset() {
    feedTitle = "";
    selectedBlocks = [];
    error = "";
  }

  function close() {
    isOpen = false;
  }

  async function loadAvailableBlocks() {
    try {
      availableBlocks = await api.getAvailableBlocks();
    } catch (e) {
      console.error("Failed to load blocks:", e);
    }
  }

  function toggleBlockSelection(blockTitle: string) {
    if (selectedBlocks.includes(blockTitle)) {
      selectedBlocks = selectedBlocks.filter(b => b !== blockTitle);
    } else {
      selectedBlocks = [...selectedBlocks, blockTitle];
    }
  }

  function moveBlockUp(index: number) {
    if (index > 0) {
      const newBlocks = [...selectedBlocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      selectedBlocks = newBlocks;
    }
  }

  function moveBlockDown(index: number) {
    if (index < selectedBlocks.length - 1) {
      const newBlocks = [...selectedBlocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      selectedBlocks = newBlocks;
    }
  }

  async function handleSave() {
    if (!feedTitle.trim()) {
      error = "Please provide a feed title";
      return;
    }

    if (selectedBlocks.length === 0) {
      error = "Please select at least one block";
      return;
    }

    isLoading = true;
    error = "";

    try {
      const result = await api.addFeed({
        title: feedTitle,
        blocks: selectedBlocks
      });

      if (result.success) {
        dispatch("added");
        close();
        window.location.reload();
      } else {
        error = result.error || "Failed to create feed";
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to create feed";
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-overlay" on:click={close} on:keydown={handleKeydown} role="button" tabindex="-1">
    <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <button class="close-button" on:click={close} aria-label="Close">x</button>

      <h2>Create Feed</h2>
      <p class="subtitle">Combine blocks into a unified feed view.</p>

      {#if error}
        <div class="error">{error}</div>
      {/if}

      <form on:submit|preventDefault={handleSave}>
        <label>
          Feed Title:
          <input type="text" bind:value={feedTitle} required placeholder="My Custom Feed" autofocus />
        </label>

        <fieldset>
          <legend>Select Blocks</legend>
          <p class="hint">Choose which blocks to include in this feed.</p>
          {#if availableBlocks.length > 0}
            <div class="block-list">
              {#each availableBlocks as block}
                <label class="block-item">
                  <input
                    type="checkbox"
                    checked={selectedBlocks.includes(block.title)}
                    on:change={() => toggleBlockSelection(block.title)}
                  />
                  <span class="block-title">{block.title}</span>
                  <span class="block-type">{block.implementation}</span>
                </label>
              {/each}
            </div>
          {:else}
            <p class="hint">No blocks available. Create a query first.</p>
          {/if}
        </fieldset>

        {#if selectedBlocks.length > 1}
          <fieldset>
            <legend>Block Order</legend>
            <p class="hint">Arrange the order blocks appear in the feed.</p>
            <div class="order-list">
              {#each selectedBlocks as blockTitle, index}
                <div class="order-item">
                  <span class="order-number">{index + 1}</span>
                  <span class="order-title">{blockTitle}</span>
                  <div class="order-controls">
                    <button type="button" class="order-btn" on:click={() => moveBlockUp(index)} disabled={index === 0}>
                      ↑
                    </button>
                    <button type="button" class="order-btn" on:click={() => moveBlockDown(index)} disabled={index === selectedBlocks.length - 1}>
                      ↓
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </fieldset>
        {/if}

        <div class="button-row">
          <button type="button" class="secondary" on:click={close}>Cancel</button>
          <button type="submit" disabled={isLoading || !feedTitle.trim() || selectedBlocks.length === 0}>
            {isLoading ? "Creating..." : "Create Feed"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 550px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    line-height: 1;
  }

  .close-button:hover {
    color: var(--active-button-color, #4d9645);
  }

  h2 {
    margin-top: 0;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    color: #666;
    margin-top: 0;
    margin-bottom: 1.5rem;
  }

  .error {
    background: #fee;
    color: #c00;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  input[type="text"] {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:focus {
    outline: 2px solid var(--active-button-color, #4d9645);
    outline-offset: 1px;
  }

  fieldset {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  legend {
    padding: 0 0.5rem;
    font-weight: bold;
  }

  .hint {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }

  .block-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .block-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border: 1px solid #eee;
    border-radius: 4px;
    cursor: pointer;
  }

  .block-item:hover {
    background: #f9f9f9;
  }

  .block-title {
    font-weight: 500;
    flex: 1;
  }

  .block-type {
    font-size: 0.75rem;
    color: #999;
    background: #f0f0f0;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
  }

  .order-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .order-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fafafa;
  }

  .order-number {
    width: 1.5rem;
    height: 1.5rem;
    background: var(--active-button-color, #4d9645);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .order-title {
    flex: 1;
    font-weight: 500;
  }

  .order-controls {
    display: flex;
    gap: 0.25rem;
  }

  .order-btn {
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .order-btn:hover:not(:disabled) {
    background: #ddd;
  }

  .order-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .button-row {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  button {
    padding: 0.75rem 1.25rem;
    background: var(--active-button-color, #4d9645);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.secondary {
    background: #666;
  }
</style>
