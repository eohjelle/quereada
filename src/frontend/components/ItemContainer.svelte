<script lang="ts">
  import { inview } from "svelte-inview";
  import Article from "./Article.svelte";
  import ButtonContainer from "./ButtonContainer.svelte";
  import { onDestroy, setContext } from "svelte";
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
  let seen_timer: NodeJS.Timeout;

  // Initiate variable to indicate whether to show the summary.
  // This state is controlled by a button component, and will be read by the "content" component.
  // This is irrelevant for item types that don't have content, but the variable must be initialized here in order to be shared between the content and button components.
  const show_summary = setContext<Writable<boolean>>(
    "show_summary",
    writable(false)
  );

  // Event dispatcher for when an item enters view.
  // It is used to tell the feed when to get more items.
  let hasEnteredView = false;
  const dispatch = createEventDispatcher();

  onDestroy(() => {
    clearTimeout(seen_timer);
  });
</script>

<!-- Use two div boxes because we have two separate inviews. -->
<div
  use:inview={{ threshold: 0, unobserveOnEnter: true }}
  on:inview_enter={() => {
    if (!hasEnteredView) {
      hasEnteredView = true;
      dispatch("entered_view");
    }
  }}
>
  <div
    class="item-box"
    in:fade
    use:inview={{ threshold: 1 }}
    on:inview_enter={(event) => {
      seen_timer = setTimeout(() => {
        item.seen += 1;
        api.updateSeen(item.id, item.feed_title, item.block_title);
        event.detail.observer.unobserve(event.detail.node);
      }, 3000);
    }}
    on:inview_leave={() => {
      clearTimeout(seen_timer);
    }}
  >
    <svelte:component this={svelte_component_of_type[item.item_type]} {item} />
    <ButtonContainer {item} />
  </div>
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
    grid-template-columns: 1fr 50px;
    width: min(1200px, 95vw);
    height: 250px; /* If removed, text content seems to cut off in some cases. todo: investigate */
    max-height: 250px;
    border: 2px solid #ddd;
  }

  .item-box:hover {
    background-color: var(--item-hover-color);
  }
</style>
