<script>
  import { byline } from "$lib/components/helpers";
  import { getContext } from "svelte";
  import Summarizer from "./Summarizer.svelte";

  export let item;

  // Initiate variable to indicate whether to show the summary. This will be controlled by a button in a child component.
  const show_summary = getContext("show_summary");
</script>

<div class="item-content">
  <div class="base-layer">
    <img src={item.image_link} class="item-photo" />
    <div class="text-content">
      <header class="outlet-header">
        <!-- <img src={item.outlet_logo} class="logo" /> -->
        <h3>{item.source_name}</h3>
      </header>
      <h2><a href={item.link}>{@html item.title}</a></h2>
      <footer>{byline(item.authors)}</footer>
      <p class="description">
        {@html item.description}
      </p>
    </div>
  </div>
  {#if $show_summary}
    <div class="summary-overlay">
      <Summarizer {item} />
    </div>
  {/if}
</div>

<style>
  /* Container for all content */
  .item-content {
    position: relative;
  }

  /* Base layer for the item */
  .base-layer {
    z-index: 0;
    position: relative;
    top: 0px;
    left: 0px;
    display: grid;
    grid-template-columns: 33% 67%;
  }

  /* summary overlay layer */
  .summary-overlay {
    position: absolute;
    z-index: 1;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: #fffbf0ee;
  }

  /* Image of the item */
  .item-photo {
    max-width: 100%;
    object-fit: cover;
    border-radius: 15px 0 0 15px;
  }

  /* Logo of the outlet */
  .logo {
    width: 50px;
    height: auto;
    margin: 10px;
  }

  /* Container for the text content */
  .text-content {
    padding: 5px;
  }

  /* Headline of the item */
  .item-content h2 {
    font-size: 1.5em;
    margin: 5px 0;
    color: #333;
  }

  /* Outlet logo and headline row */
  .outlet-header {
    display: flex;
    align-items: center;
  }

  /* Logo inside the headline row */
  .outlet-header img.logo {
    margin-right: 10px;
  }
</style>
