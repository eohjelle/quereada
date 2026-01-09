<script lang="ts">
  import { api } from "$bridge/api_endpoint";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let isOpen = false;
  let digestTitle = "";
  let isLoading = false;
  let error = "";

  // Available blocks to use as input
  let availableBlocks: Array<{ title: string; implementation: string }> = [];
  let selectedInputBlocks: string[] = [];

  // Focus areas for the digest
  let focusAreasText = "";

  export async function open() {
    isOpen = true;
    reset();
    await loadAvailableBlocks();
  }

  function reset() {
    digestTitle = "";
    selectedInputBlocks = [];
    focusAreasText = "";
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
    if (selectedInputBlocks.includes(blockTitle)) {
      selectedInputBlocks = selectedInputBlocks.filter(b => b !== blockTitle);
    } else {
      selectedInputBlocks = [...selectedInputBlocks, blockTitle];
    }
  }

  async function handleSave() {
    if (!digestTitle.trim()) {
      error = "Please provide a digest title";
      return;
    }

    if (selectedInputBlocks.length === 0) {
      error = "Please select at least one input block";
      return;
    }

    isLoading = true;
    error = "";

    try {
      // Parse focus areas from comma-separated text
      const focus_areas = focusAreasText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const result = await api.addDigest({
        title: digestTitle,
        implementation: 'NewsBriefing',
        args: {
          input_blocks: selectedInputBlocks,
          focus_areas: focus_areas.length > 0 ? focus_areas : undefined
        }
      });

      if (result.success) {
        dispatch("added");
        close();
        window.location.reload();
      } else {
        error = result.error || "Failed to create digest";
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to create digest";
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

      <h2>Create Digest</h2>
      <p class="subtitle">Generate an AI-powered news briefing from your items.</p>

      {#if error}
        <div class="error">{error}</div>
      {/if}

      <form on:submit|preventDefault={handleSave}>
        <label>
          Digest Title:
          <input type="text" bind:value={digestTitle} required placeholder="Daily Briefing" autofocus />
        </label>

        <fieldset>
          <legend>Input Blocks</legend>
          <p class="hint">Select which queries/blocks to summarize in this digest.</p>
          {#if availableBlocks.length > 0}
            <div class="block-list">
              {#each availableBlocks as block}
                <label class="block-item">
                  <input
                    type="checkbox"
                    checked={selectedInputBlocks.includes(block.title)}
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

        <label>
          Focus Areas (optional):
          <input
            type="text"
            bind:value={focusAreasText}
            placeholder="politics, technology, culture"
          />
          <span class="field-hint">Comma-separated topics to emphasize in the briefing</span>
        </label>

        <div class="button-row">
          <button type="button" class="secondary" on:click={close}>Cancel</button>
          <button type="submit" disabled={isLoading || !digestTitle.trim() || selectedInputBlocks.length === 0}>
            {isLoading ? "Creating..." : "Create Digest"}
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

  .field-hint {
    color: #999;
    font-size: 0.8rem;
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
