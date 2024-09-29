<script lang="ts">
  import ItemContainer from "./ItemContainer.svelte";
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { getStream } from "$bridge/loading_items_to_feed";
  import type { DisplayItem } from "$lib/types";
  import type { Feed as FeedType } from "$lib/types";

  export let feed: FeedType;
  let items: DisplayItem[] = [];
  const pageSize = 5;

  let waitingToGetAnotherItem: Promise<void>;
  let getAnotherItem: () => void;
  const startWaitingToGetAnotherItem = () => {
    waitingToGetAnotherItem = new Promise<void>((resolve) => {
      getAnotherItem = resolve;
    });
  };

  // todo: remove dependency of scroll event listener as it may be resource intensive. See https://johnresig.com/blog/learning-from-twitter/
  onMount(async () => {
    console.log("Initializing items stream for feed", feed);
    const itemsStream = await getStream({
      blocks: feed.blocks,
      pageSize: pageSize,
    });
    itemsStream.stream.pipeTo(
      new WritableStream({
        write: async (item) => {
          console.log("Writing item", item.title);
          await new Promise((resolve) => {
            setTimeout(resolve, 100);
          });
          console.log("Waiting to get another item...");
          await waitingToGetAnotherItem;
          items = [...items, item];
          console.log("Items:", items);
          startWaitingToGetAnotherItem();
        },
      })
    );
    console.log("Items stream initialized.");
  });
</script>

<div class="items-container">
  {#each items as item}
    <ItemContainer {item} on:entered_view={getAnotherItem} />
  {/each}

  <!-- {#if !finishedLoading}
    <h1 style="text-alignment: center">Loading more items...</h1>
  {:else}
    <h1 style="text-alignment: center">No more items to show.</h1>
  {/if} -->
</div>

<style>
  .items-container {
    place-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    /* border: 2px solid red; */ /* For development purposes */
  }
</style>
