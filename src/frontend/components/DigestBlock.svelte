<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { api } from "$bridge/api_endpoint";
  import type { Block, DigestDisplayItem } from "$lib/types";
  import DigestContent from "./DigestContent.svelte";

  export let block: Block;
  export let feedTitle: string = "";

  let digestContent = "";
  let isLoading = true;
  let error: string | null = null;
  let expandedItemId: number | null = null;
  let expandedItemData: DigestDisplayItem | null = null;
  let abortController: AbortController | null = null;

  onMount(async () => {
    try {
      abortController = new AbortController();
      const stream = await api.generateDigest(block.title);

      const reader = stream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        digestContent += value;
        isLoading = false;
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        error = err.message;
        console.error("Error generating digest:", err);
      }
    } finally {
      isLoading = false;
    }
  });

  onDestroy(() => {
    if (abortController) {
      abortController.abort();
    }
  });

  async function handleItemClick(event: CustomEvent<{ itemId: number }>) {
    const { itemId } = event.detail;

    if (expandedItemId === itemId) {
      // Toggle off
      expandedItemId = null;
      expandedItemData = null;
    } else {
      // Expand this item
      expandedItemId = itemId;
      try {
        const items = await api.getDigestItems([itemId]);
        if (items.length > 0) {
          expandedItemData = items[0];
        } else {
          console.warn(`Item ${itemId} not found`);
          expandedItemData = null;
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        expandedItemData = null;
      }
    }
  }

  function handleItemClose() {
    expandedItemId = null;
    expandedItemData = null;
  }
</script>

<div class="digest-block">
  <header class="block-header">
    <h2>{block.title}</h2>
  </header>

  <div class="digest-body">
    {#if error}
      <div class="error" in:fade>
        <p>Error generating digest: {error}</p>
      </div>
    {:else if isLoading && !digestContent}
      <div class="loading" in:fade>
        <p>Generating digest...</p>
      </div>
    {:else}
      <DigestContent
        content={digestContent}
        {expandedItemId}
        {expandedItemData}
        blockTitle={block.title}
        {feedTitle}
        on:itemClick={handleItemClick}
        on:closeItem={handleItemClose}
      />

      {#if isLoading}
        <div class="streaming-indicator">
          <span class="dot">.</span><span class="dot">.</span><span class="dot"
            >.</span
          >
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .digest-block {
    background-color: #fff;
    margin: 5px;
    width: min(1200px, 95vw);
  }

  .block-header {
    padding: 0 0 8px 0;
  }

  .block-header h2 {
    margin: 0;
    font-size: 1.8em;
    font-weight: 600;
    color: #222;
  }

  .digest-body {
    padding: 0;
  }

  .loading,
  .error {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  .error {
    color: #c62828;
  }

  .streaming-indicator {
    text-align: center;
    padding: 10px;
  }

  .dot {
    animation: blink 1.4s infinite;
    font-size: 2em;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0%,
    80%,
    100% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
  }
</style>
