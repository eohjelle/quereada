<script lang="ts">
  import type { Feed as FeedType, Block } from "$lib/types";
  import { isDigestBlock } from "$lib/types";
  import type { StreamInterface } from "$bridge/loading_items_to_feed/frontend";
  import ItemsStreamBlock from "./ItemsStreamBlock.svelte";
  import DigestBlock from "./DigestBlock.svelte";

  export let feed: FeedType;
  export let streamInterface: StreamInterface;
</script>

<div class="feed-container">
  {#each feed.blocks as block, i}
    {#if i > 0}
      <hr class="block-separator" />
    {/if}
    {#if isDigestBlock(block)}
      <DigestBlock {block} feedTitle={feed.title} />
    {:else}
      <ItemsStreamBlock {block} feedTitle={feed.title} {streamInterface} />
    {/if}
  {/each}
</div>

<style>
  .feed-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .block-separator {
    width: min(1200px, 95vw);
    border: none;
    border-top: 1px solid #ddd;
    margin: 20px 0;
  }
</style>
