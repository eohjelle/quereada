<script lang="ts">
  import { inview } from "svelte-inview";
  import Article from "./Article.svelte";
  import ButtonContainer from "./ButtonContainer.svelte";
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { onMount, createEventDispatcher } from "svelte";
  import Link from "./Link.svelte";
  import type { DisplayItem } from "$lib/types";
  import { fade, fly } from "svelte/transition";
  import { api } from "$bridge/api_endpoint";

  // The item to be displayed
  export let item: DisplayItem;

  // A dictionary to map names of item types (used in db) to the corresponding svelte component
  type Component = typeof Article | typeof Link;
  const svelte_component_of_type: {
    [key in DisplayItem["item_type"]]: Component;
  } = {
    Article: Article,
    Link: Link,
  };

  // A timer that updates item to "seen" after it's been in view for 3 seconds
  let inview_options = { threshold: 0.9 }; // threshold = 1 means that the item is considered in view when it's fully visible
  let inview_timer: NodeJS.Timeout;

  // Initiate variable to indicate whether to show the summary.
  // This state is controlled by a button component, and will be read by the "content" component.
  // This is irrelevant for item types that don't have content, but the variable must be initialized here in order to be shared between the content and button components.
  const show_summary = setContext<Writable<boolean>>(
    "show_summary",
    writable(false)
  );

  onMount(() => {
    console.log("ItemContainer mounted");
    // todo: check if we need to clean up?
  });

  // Event dispatcher for when an item enters view.
  // It is used to tell the feed when to get more items.
  let hasEnteredView = false;
  const dispatch = createEventDispatcher();
</script>

<div
  class="item-box"
  in:fade
  use:inview={inview_options}
  on:inview_enter={() => {
    if (!hasEnteredView) {
      hasEnteredView = true;
      dispatch("entered_view");
    }
    if (!item.seen) {
      inview_timer = setTimeout(() => {
        item.seen = true;
        api.updateSeen(item.id, item.seen);
      }, 3000);
    }
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
    background-color: var(--item-hover-color);
  }
</style>
