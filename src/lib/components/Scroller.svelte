<script>
  import ItemContainer from "$lib/components/ItemContainer.svelte";
  import { onMount } from "svelte";

  // Inspiration for infinite scrolling: https://svelte.dev/repl/aacd1a2d8eb14bb19e5cb3b0ad20fdbe?version=3.32.3
  let itemsContainer;

  let items = [];

  // $: sample_block = {
  //   header: "Articles in The Atlantic",
  //   prisma_function: "findMany",
  //   prisma_args: {
  //     take: 8,
  //     where: {
  //       source_name: "The Atlantic",
  //       seen: false,
  //       id: {
  //         not: {
  //           in: items.map((item) => item.id),
  //         },
  //       },
  //     },
  //     orderBy: {
  //       date_published: "desc",
  //     },
  //     include: {
  //       authors: true,
  //     },
  //   },
  // };

  // Sample blocks to be loaded
  // todo: write function to load blocks from a json file
  const sampleBlocks = [
    {
      header: "Articles in The Atlantic",
      prisma_function: "findMany",
      prisma_args: {
        take: 10,
        where: {
          source_name: "The Atlantic",
        },
        include: {
          authors: true,
        },
      },
    },
    {
      header: "Articles in The New York Times",
      prisma_function: "findMany",
      prisma_args: {
        take: 10,
        where: {
          source_name: "The New York Times",
        },
        include: {
          authors: true,
        },
      },
    },
  ];

  // Reverse the order of the blocks to use it as LIFO stack
  // This should be the output of the loader function
  const blockStack = sampleBlocks.reverse();

  // Elements of items on a page
  // todo: compute based on the size of the window
  const pageSize = 4;

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

  async function loadMoreItems(blockStack) {
    const block = blockStack.pop();
    if (block.prisma_args.take) {
      const [div, rem] = [
        Math.floor(block.prisma_args.take / pageSize),
        block.prisma_args.take % pageSize,
      ];
      block.prisma_args.take = div > 0 ? pageSize : rem;
      const newItems = await fetchBlock(block);
      items = [...items, ...newItems]; // todo: try to use push with spread operator
      if (newItems.length == block.prisma_args.take && div > 0) {
        block.prisma_args.take = (div - 1) * pageSize + rem;
        blockStack.push(block);
      }
    } else {
      block.prisma_args.take = pageSize;
      const newItems = await fetchBlock(block);
      items = [...items, ...newItems]; // todo: ..
      if (newItems.length == pageSize) {
        delete block.prisma_args.take;
        blockStack.push(block);
      }
    }
  }

  // onMount(() => loadMoreItemsPrisma(sample_block.prisma_args));

  onMount(() => {
    loadMoreItems(blockStack);
    window.addEventListener("scroll", handleScroll); // used for infinite scrolling effect. Should also call when at the bottom? There seems to be a bug that this function isn't called if there are too few items already showing.
  });

  // This function is used for infinite scrolling effect. It calls a function to load more items when the client gets close to the bottom.
  let timerActive = false;
  const handleScroll = async () => {
    if (
      itemsContainer.offsetHeight - window.scrollY <= window.innerHeight + 50 &&
      !timerActive
    ) {
      timerActive = true;
      setTimeout(() => {
        timerActive = false;
      }, 1000);
      await loadMoreItems(blockStack); // todo: change sample_block to next block or next page
    }
  };
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
