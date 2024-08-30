<script>
  import ItemContainer from "$lib/components/ItemContainer.svelte";
  import { onMount, onDestroy, afterUpdate } from "svelte";

  // Feed is a variable supplied by the parent component.
  // It contains the blocks that define the feed.
  export let feed;

  // View block_stack as a LIFO stack to load the blocks in the correct order.
  // The spread operator is used to create a copy of the array. This is necessary because we don't want to remove items from the original array.
  let block_stack = [...feed.blocks].reverse();
  // Initialize some variables
  let items = []; // List of items to be displayed
  let itemsContainer; // Reference to the container of items
  const pageSize = 2; // Number of items to be loaded at a time. todo: compute based on the size of the window

  // Make an API call to fetch data from the database
  async function fetchBlock(block) {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prisma_function: "findMany",
        ...block,
      }),
    });
    return await response.json();
  }

  // Load more items based on the current state of block_stack and pageSize
  async function loadMoreItems() {
    if (block_stack.length == 0) {
      console.log("No more items to show.");
      removeEventListener("scroll", loadMoreItemsIfCloseToBottom); // It's possible that this can lead to items failing to load. todo: revisit this later on
      return;
    }
    const block = JSON.parse(JSON.stringify(block_stack.pop())); // We create a deep copy of the block to avoid modifying the original block in feed.blocks
    let left_over;
    // First decide how many items to load
    if (block.prisma_query.take) {
      const [div, rem] = [
        Math.floor(block.prisma_query.take / pageSize),
        block.prisma_query.take % pageSize,
      ];
      block.prisma_query.take = div > 0 ? pageSize : rem;
      left_over = (div - 1) * pageSize + rem;
    } else {
      block.prisma_query.take = pageSize;
      left_over = Infinity;
    }
    // Fetch new items and add to the list of items
    const newItems = await fetchBlock(block);
    items = [...items, ...newItems];
    // Decide if there are potentially any more items in the block left to load.
    if (left_over > 0 && newItems.length == pageSize) {
      block.prisma_query.skip = block.prisma_query.skip
        ? block.prisma_query.skip + block.prisma_query.take
        : block.prisma_query.take;
      left_over < Infinity
        ? (block.prisma_query.take = left_over)
        : delete block.prisma_query.take;
      block_stack.push(block);
    }
  }

  // Events trigger the wrapper function loadMoreItemsIfCloseToBottom, which calls loadMoreItems if the user is close to the bottom of the page.
  // A promise is used to keep track of calls to loadMoreItems, in order to prevent calling loadMoreItems again before the previous call has finished.
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
          await loadMoreItems();
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
    <ItemContainer {item} />
  {/each}
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
