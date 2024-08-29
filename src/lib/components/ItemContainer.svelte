<script>
  import { inview } from "svelte-inview";
  import Article from "./Article.svelte";
  import ButtonContainer from "./ButtonContainer.svelte";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import Link from "./Link.svelte";

  // The item to be displayed
  export let item;

  // A dictionary to map names of item types (used in db) to the corresponding svelte component
  const svelte_component_of_type = {
    Article: Article,
    Link: Link,
  };

  // Function to update database when the item is seen
  async function updateSeenToDB() {
    const request = {
      prisma_function: "update",
      prisma_args: {
        where: { id: item.id },
        data: { seen: item.seen },
      },
    };
    await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  }

  // A timer that updates item to "seen" after it's been in view for 3 seconds
  let inview_options = { threshold: 1 }; // threshold = 1 means that the item is considered in view when it's fully visible
  let inview_timer;

  // Initiate variable to indicate whether to show the summary.
  // This state is controlled by a button component, and will be read by the "content" component.
  // This is irrelevant for item types that don't have content, but the variable must be initialized here in order to be shared between the content and button components.
  const show_summary = setContext("show_summary", writable(false));
</script>

<div
  class="item-box"
  use:inview={inview_options}
  on:inview_enter={() => {
    inview_timer = setTimeout(() => {
      item.seen = true;
      updateSeenToDB();
    }, 3000);
  }}
  on:inview_leave={() => {
    if (!item.seen) {
      clearTimeout(inview_timer);
    }
  }}
>
  <svelte:component this={svelte_component_of_type[item.item_type]} {item} />
  <ButtonContainer {item} />
</div>

<style>
  /* Container for the item item box */
  .item-box {
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin: 5px;
    background-color: #ffffff;
    display: grid;
    grid-template-columns: 90% 10%;
    width: 80%;
    height: 250px; /* If removed, text content seems to cut off in some cases. todo: investigate */
    max-height: 250px;
    border: 2px solid #ddd;
  }

  .item-box:hover {
    /* border: 2px solid orange; */
    background-color: #fffbf0;
  }
</style>
