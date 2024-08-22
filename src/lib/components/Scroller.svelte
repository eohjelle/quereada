<script>
  import ItemContainer from "$lib/components/ItemContainer.svelte";
  import { onMount } from "svelte";

  // Inspiration for infinite scrolling: https://svelte.dev/repl/aacd1a2d8eb14bb19e5cb3b0ad20fdbe?version=3.32.3
  let itemsContainer;

  let items = [];
  $: sample_block = {
    header: "Articles in The Atlantic",
    prisma_function: "findMany",
    prisma_args: {
      take: 8,
      where: {
        source_name: "The Atlantic",
        seen: false,
        id: {
          not: {
            in: items.map((item) => item.id),
          },
        },
      },
      orderBy: {
        date_published: "desc",
      },
      include: {
        authors: true,
      },
    },
  };

  async function loadMoreItems(block) {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(block),
    });
    const newItems = await response.json();
    items = [...items, ...newItems];
    // console.log(`Loaded ${newItems.length} more items.`);
    // console.log(`Here is one of them: ${JSON.stringify(newItems[0])}`);
  }

  // onMount(() => loadMoreItemsPrisma(sample_block.prisma_args));

  onMount(() => {
    loadMoreItems(sample_block);
    window.addEventListener("scroll", handleScroll); // used for infinite scrolling effect

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            itemsContainer.classList.add("in-view");
          } else {
            itemsContainer.classList.remove("in-view");
          }
        });
      },
      {
        root: null,
        rootMargin: "-50% 0px -50% 0px", // create a 1px high area in the center
        threshold: 0.5, // Adjust this value as needed
      }
    );

    observer.observe(itemsContainer);
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
      await loadMoreItems(sample_block); // todo: change sample_block to next block or next page
    }
  };
</script>

<div class="items-container" bind:this={itemsContainer}>
  {#each items as item}
    <!-- <label> -->
    <ItemContainer {item} />
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
