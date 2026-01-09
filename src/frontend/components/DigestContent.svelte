<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import { marked } from "marked";
  import type { DigestDisplayItem, DisplayItem } from "$lib/types";
  import ItemContainer from "./ItemContainer.svelte";

  export let content: string;
  export let expandedItemId: number | null = null;
  export let expandedItemData: DigestDisplayItem | null = null;
  export let blockTitle: string = "";
  export let feedTitle: string = "";

  const dispatch = createEventDispatcher();

  // Convert DigestDisplayItem to DisplayItem for ItemContainer
  function toDisplayItem(item: DigestDisplayItem): DisplayItem {
    return {
      ...item,
      feed_title: feedTitle,
      block_title: blockTitle,
    };
  }

  // Convert markdown content to HTML
  function markdownToHtml(markdown: string): string {
    return marked.parse(markdown, { async: false }) as string;
  }

  // Replace [ID] references with button HTML, marking the expanded one
  function replaceRefsWithButtons(text: string, skipId?: number): string {
    return text.replace(/\[(?:item:)?(\d+)\]/g, (_, id) => {
      const numId = parseInt(id);
      if (skipId !== undefined && numId === skipId) {
        return ''; // Will be handled separately
      }
      const isExpanded = expandedItemId === numId;
      return `<button class="item-ref${isExpanded ? ' expanded' : ''}" data-item-id="${id}">[${id}]</button>`;
    });
  }

  // Split content at the expanded item reference for inline insertion
  function splitAtExpandedItem(text: string): { before: string; after: string } | null {
    if (expandedItemId === null) return null;

    const regex = new RegExp(`\\[(?:item:)?(${expandedItemId})\\]`);
    const match = text.match(regex);
    if (!match || match.index === undefined) return null;

    const beforeText = text.slice(0, match.index);
    const afterText = text.slice(match.index + match[0].length);

    return {
      before: replaceRefsWithButtons(beforeText) +
              `<button class="item-ref expanded" data-item-id="${expandedItemId}">[${expandedItemId}]</button>`,
      after: replaceRefsWithButtons(afterText),
    };
  }

  // First convert markdown to HTML, then process [ID] references
  $: htmlContent = markdownToHtml(content);
  $: split = expandedItemData ? splitAtExpandedItem(htmlContent) : null;
  $: fullHtml = !split ? replaceRefsWithButtons(htmlContent) : null;

  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains("item-ref")) {
      const itemId = parseInt(target.dataset.itemId!);
      dispatch("itemClick", { itemId });
    }
  }

  function handleClose() {
    dispatch("closeItem");
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="digest-content" on:click={handleClick}>
  {#if split}
    {@html split.before}
    <div class="inline-item-wrapper" transition:slide={{ duration: 200 }}>
      <button class="close-btn" on:click|stopPropagation={handleClose}>&times;</button>
      <ItemContainer item={toDisplayItem(expandedItemData)} autoMarkSeen={true} />
    </div>
    {@html split.after}
  {:else if fullHtml}
    {@html fullHtml}
  {/if}
</div>

<style>
  .digest-content {
    line-height: 1.6;
    font-size: 1em;
    padding: 0;
  }

  .digest-content :global(h1) {
    font-size: 1.5em;
    margin: 1em 0 0.5em 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.3em;
  }

  .digest-content :global(h2) {
    font-size: 1.3em;
    margin: 1em 0 0.5em 0;
    color: #333;
  }

  .digest-content :global(h3) {
    font-size: 1.1em;
    margin: 0.8em 0 0.4em 0;
    color: #444;
  }

  .digest-content :global(p) {
    margin: 0.5em 0;
  }

  .digest-content :global(.item-ref) {
    display: inline;
    background: #e3f2fd;
    border: 1px solid #90caf9;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    font-size: 0.85em;
    font-family: monospace;
    color: #1565c0;
    transition: background-color 0.2s;
  }

  .digest-content :global(.item-ref:hover) {
    background: #bbdefb;
  }

  .digest-content :global(.item-ref.expanded) {
    background: #1565c0;
    color: white;
    border-color: #1565c0;
  }

  .inline-item-wrapper {
    position: relative;
    display: block;
    margin: 16px 0;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 40px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 1.2em;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .close-btn:hover {
    background: #f0f0f0;
    color: #333;
  }
</style>
