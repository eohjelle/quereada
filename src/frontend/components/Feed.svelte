<script lang="ts">
  import ItemContainer from "./ItemContainer.svelte";
  import { onMount, onDestroy } from "svelte";
  import { getStream } from "$bridge/loading_items_to_feed";
  import type { DisplayItem } from "$lib/types";
  import type { Feed as FeedType } from "$lib/types";
  import type { StreamFrontend } from "$bridge/loading_items_to_feed/frontend";

  export let feed: FeedType;
  let items: DisplayItem[] = [];
  const pageSize = 5;

  let showLoadingItemsMessage = false;
  let showLoadingItemsMessageTimer: NodeJS.Timeout;
  const startShowLoadingItemsMessageTimer = () => {
    return setTimeout(() => {
      showLoadingItemsMessage = true;
    }, 300);
  };

  let finishedLoading = false;

  let waitToGetAnotherItem: Promise<void> = Promise.resolve();
  let getAnotherItem: () => void;
  const setWaitToGetAnotherItem = () => {
    waitToGetAnotherItem = new Promise((resolve) => (getAnotherItem = resolve));
  };

  let itemsStream: StreamFrontend;

  onMount(async () => {
    console.log("Initializing items stream for feed", feed);
    itemsStream = await getStream({
      feed: feed,
      pageSize: pageSize,
    });
    itemsStream.stream.pipeTo(
      new WritableStream(
        {
          write: async (item) => {
            items = [...items, item];

            // If items hasn't been changed within 200ms, show "Loading items..."
            showLoadingItemsMessage = false;
            clearTimeout(showLoadingItemsMessageTimer);
            showLoadingItemsMessageTimer = startShowLoadingItemsMessageTimer();

            // Only push new items when we are close to the end of the stream.
            await waitToGetAnotherItem.then(setWaitToGetAnotherItem);

            // Don't push all the items at once -- set a 100ms delay before the next item is pushed.
            await new Promise((resolve) => setTimeout(resolve, 100));
          },
          close: () => {
            finishedLoading = true;
          },
        },
        new CountQueuingStrategy({ highWaterMark: pageSize })
      )
    );

    startShowLoadingItemsMessageTimer();
  });

  onDestroy(() => {
    console.log("Canceling items stream...");
    itemsStream.close();
    console.log("Items stream canceled. Destroying component...");
  });
</script>

<div class="items-container">
  {#each items as item}
    <ItemContainer {item} on:entered_view={getAnotherItem} />
  {/each}

  {#if finishedLoading}
    <h1 style="text-alignment: center">No more items to show.</h1>
  {:else if showLoadingItemsMessage}
    <h1 style="text-alignment: center">Loading items...</h1>
  {/if}
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
