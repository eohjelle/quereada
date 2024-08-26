<script>
  import ItemContainer from "$lib/components/ItemContainer.svelte";
  import { onMount, onDestroy, afterUpdate } from "svelte"; // Not sure if I need all. todo: remove superfluous imports

  // Inspiration for infinite scrolling: https://svelte.dev/repl/aacd1a2d8eb14bb19e5cb3b0ad20fdbe?version=3.32.3
  let itemsContainer;

  let items = [];

  // Sample blocks to be loaded
  // todo: write function to load blocks from a json file
  export let feed;

  // View block_stack as a LIFO stack to load the blocks in the correct order.
  // The spread operator is used to create a copy of the array. This is necessary because we don't want to remove items from the original array.
  let block_stack = [...feed.blocks].reverse();

  $: console.log(
    `Hello from Feed.svelte. This is the feed titled ${feed.feed_title}. There are ${feed.blocks.length} blocks to load.`
  );
  $: console.log(
    `To start with, the block stack has length ${block_stack.length}.`
  );

  // Elements of items on a page
  // todo: compute based on the size of the window
  const pageSize = 2;

  async function fetchBlock(block) {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(block),
    });

    return await response.json();
  }

  async function loadMoreItems(block_stack) {
    if (block_stack.length == 0) {
      console.log("No more items to show.");
      removeEventListener("scroll", loadMoreItemsIfCloseToBottom); // It's possible that this can lead to items failing to load. todo: revisit this later on
      return;
    }
    const block = JSON.parse(JSON.stringify(block_stack.pop())); // We create a deep copy of the block to avoid modifying the original block in feed.blocks
    let left_over;
    // First decide how many blocks to load
    if (block.prisma_args.take) {
      const [div, rem] = [
        Math.floor(block.prisma_args.take / pageSize),
        block.prisma_args.take % pageSize,
      ];
      block.prisma_args.take = div > 0 ? pageSize : rem;
      left_over = (div - 1) * pageSize + rem;
    } else {
      block.prisma_args.take = pageSize;
      left_over = Infinity;
    }
    const newItems = await fetchBlock(block);
    items = [...items, ...newItems]; // todo: try to use push with spread operator
    // Decide if there are potentially any more blocks left to load.
    if (left_over > 0 && newItems.length == pageSize) {
      block.prisma_args.skip = block.prisma_args.skip
        ? block.prisma_args.skip + block.prisma_args.take
        : block.prisma_args.take;
      left_over < Infinity
        ? (block.prisma_args.take = left_over)
        : delete block.prisma_args.take;
      block_stack.push(block);
    }
  }

  // We use a promise to keep track of calls to loadMoreItems, in order to prevent calling loadMoreItems again before the previous call has finished.
  let loadingPromise = null;

  async function loadMoreItemsIfCloseToBottom() {
    // If there's an ongoing loading operation, wait for it to complete
    if (loadingPromise) {
      await loadingPromise;
    }
    // Check if we're close to the bottom of the page
    if (
      itemsContainer.offsetHeight - window.scrollY <=
      window.innerHeight + 50 // todo: this is maybe not the optimal condition, so improve it
    ) {
      // Create a new loadingPromise
      loadingPromise = (async () => {
        try {
          await loadMoreItems(block_stack);
        } catch (error) {
          console.error("Error in loadMoreItems:", error);
        } finally {
          loadingPromise = null; // Reset the promise after completion
        }
      })();
      await loadingPromise; // Wait for the current loading operation to complete
    }
  }

  // todo: remove dependency of scroll event listener as it may be resource intensive. See https://johnresig.com/blog/learning-from-twitter/
  onMount(async () => {
    window.addEventListener("scroll", loadMoreItemsIfCloseToBottom); // used for infinite scrolling effect. Should also call when at the bottom? There seems to be a bug that this function isn't called if there are too few items already showing. todo: fix this
  });

  onDestroy(() => {
    // It's necessary to check if there is a window because onDestroy runs on the server as well as the client
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", loadMoreItemsIfCloseToBottom);
    }
  });

  afterUpdate(async () => {
    await loadMoreItemsIfCloseToBottom();
  });
</script>

<div class="items-container" bind:this={itemsContainer}>
  {#each items as item}
    <!-- <label> -->
    <ItemContainer {item} />
    <!-- {item.title} -->
    <!-- </label> -->
  {/each}
</div>

<style>
  .items-container {
    place-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    /* border: 2px solid red; */
  }
</style>
