<script lang="ts">
  import ItemContainer from "./ItemContainer.svelte";
  import { onMount, onDestroy } from "svelte";
  import type { DisplayItem } from "$lib/types";
  import type { Feed as FeedType } from "$lib/types";
  import { StreamInterface } from "$bridge/loading_items_to_feed/frontend";
  import { WebStreamInterface } from "$bridge/loading_items_to_feed/web/frontend";
  import { fade } from "svelte/transition";

  export let feed: FeedType;
  export let streamInterface: StreamInterface;
  let abortController = new AbortController();
  let items: DisplayItem[] = [];
  const pageSize = 5;

  let showLoadingItemsMessage = false;
  const resetShowLoadingItemsMessageTimer = (timeout?: NodeJS.Timeout) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    return setTimeout(() => {
      showLoadingItemsMessage = true;
    }, 300);
  };

  let showLoadingItemsMessageTimer: NodeJS.Timeout;
  let finishedLoading = false;

  let waitToGetAnotherItem: Promise<void> = Promise.resolve();
  let getAnotherItem: () => void;
  const setWaitToGetAnotherItem = () => {
    waitToGetAnotherItem = new Promise((resolve) => (getAnotherItem = resolve));
  };

  onMount(async () => {
    showLoadingItemsMessageTimer = resetShowLoadingItemsMessageTimer();
    console.log(`Initializing stream for feed ${feed.title}...`);
    await streamInterface
      .start({
        feed: feed,
        pageSize: pageSize,
      })
      .then((message) => {
        console.log(message);
      });
    streamInterface.stream.pipeTo(
      new WritableStream(
        {
          write: async (item) => {
            items = [...items, item];

            // If items hasn't been changed within 300ms, show "Loading items..."
            showLoadingItemsMessage = false;
            showLoadingItemsMessageTimer = resetShowLoadingItemsMessageTimer(
              showLoadingItemsMessageTimer
            );

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
      ),
      { signal: abortController.signal }
    );
  });

  onDestroy(async () => {
    console.log(`Closing stream for feed ${feed.title}...`);
    abortController.abort();
    await streamInterface.close();
    clearTimeout(showLoadingItemsMessageTimer);
    console.log(`Stream for feed ${feed.title} closed.`);
  });
</script>

<div class="items-container">
  {#each items as item}
    <ItemContainer {item} on:entered_view={getAnotherItem} />
  {/each}

  {#if finishedLoading}
    <h1 style="text-alignment: center">No more items to show.</h1>
  {:else if streamInterface instanceof WebStreamInterface && !streamInterface.isConnected}
    <h1 style="text-alignment: center">
      WebSocket disconnected. Refresh the page to reconnect.
    </h1>
  {:else if showLoadingItemsMessage}
    <h1 style="text-alignment: center" in:fade>Loading items...</h1>
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
