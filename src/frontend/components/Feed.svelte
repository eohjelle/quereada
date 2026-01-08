<script lang="ts">
  import type { Feed as FeedType, Block } from "$lib/types";
  import { isDigestBlock } from "$lib/types";
  import type { StreamInterface } from "$bridge/loading_items_to_feed/frontend";
  import ItemsStreamBlock from "./ItemsStreamBlock.svelte";
  import DigestBlock from "./DigestBlock.svelte";

  export let feed: FeedType;
  export let streamInterface: StreamInterface;

  // Group consecutive blocks by type (ItemsStream vs digest)
  // This allows us to render ItemsStream blocks together and digest blocks separately
  type BlockGroup = {
    type: "items" | "digest";
    blocks: Block[];
  };

  function groupBlocksByType(blocks: Block[]): BlockGroup[] {
    const groups: BlockGroup[] = [];
    let currentGroup: BlockGroup | null = null;

    for (const block of blocks) {
      const isDigest = isDigestBlock(block);
      const groupType = isDigest ? "digest" : "items";

      if (!currentGroup || currentGroup.type !== groupType) {
        currentGroup = { type: groupType, blocks: [] };
        groups.push(currentGroup);
      }
      currentGroup.blocks.push(block);
    }

    return groups;
  }

  $: blockGroups = groupBlocksByType(feed.blocks);

  // Create a modified feed for ItemsStream groups (containing only ItemsStream blocks)
  function createItemsStreamFeed(blocks: Block[]): FeedType {
    return {
      ...feed,
      blocks: blocks,
    };
  }
</script>

<div class="feed-container">
  {#each blockGroups as group, i}
    {#if i > 0}
      <hr class="block-separator" />
    {/if}
    {#if group.type === "items"}
      <!-- Render ItemsStream blocks as a group -->
      <ItemsStreamBlock
        feed={createItemsStreamFeed(group.blocks)}
        {streamInterface}
      />
    {:else}
      <!-- Render each digest block separately -->
      {#each group.blocks as block}
        <DigestBlock {block} feedTitle={feed.title} />
      {/each}
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
