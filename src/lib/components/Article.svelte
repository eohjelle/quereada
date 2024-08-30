<script>
  import { byline } from "$lib/components/helpers";
  import { getContext } from "svelte";
  import Summarizer from "./Summarizer.svelte";

  export let item;

  // Initiate variable to indicate whether to show the summary. This will be controlled by a button in a child component.
  const show_summary = getContext("show_summary");

  // Paths to outlet logos (stored in the static folder)
  const outlet_logos = {
    "The Atlantic": "the_atlantic.svg",
  };
  const logo_path = outlet_logos[item.source_name]; // could be null if the outlet is not in the dictionary

  const date = new Date(item.date_published).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
</script>

<div class="item-content">
  <div class="base-layer">
    <img src={item.image_link} class="item-photo" />
    <div class="text-content">
      <header class="outlet-header">
        <p>{item.source_name}</p>
        <img src={logo_path} class="logo" style="fill: #e7131a" />
      </header>
      <h2 class="headline"><a href={item.link}>{@html item.title}</a></h2>
      <footer class="headline-footer">
        <p class="byline">{byline(item.authors)}</p>
        {#if item.number_of_words}
          <span>{Math.round(item.number_of_words / 250)} minutes</span>
        {/if}
        <span>{date}</span>
      </footer>
      <p class="description">
        {@html item.description}
      </p>
    </div>
  </div>
  {#if $show_summary}
    <div class="summary-overlay-background">
      <div class="summary-overlay-content">
        <Summarizer {item} />
      </div>
    </div>
  {/if}
</div>

<style>
  /* Container for all content */
  .item-content {
    position: relative;
    width: 100%;
    max-height: inherit; /* todo: make sure this keeps the item-content within the parent container */
    background-color: inherit;
  }

  /* Base layer for the item */
  .base-layer {
    z-index: 0;
    position: relative;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 33% 67%;
    background-color: inherit;
  }

  /* summary overlay layer */
  .summary-overlay-background {
    position: absolute;
    z-index: 1;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: inherit;
    opacity: 0.9;
  }

  .summary-overlay-content {
    position: absolute;
    z-index: 2;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    padding: 20px;
  }

  /* Image of the item */
  .item-photo {
    height: 100%;
    width: 100%;
    object-fit: cover;
    border-radius: 15px 0 0 15px;
    overflow: hidden;
  }

  /* Logo of the outlet */
  .logo {
    height: 30px;
  }

  /* Container for the text content */
  .text-content {
    padding: 15px;
    display: flex;
    max-height: inherit;
    width: 100%;
    box-sizing: border-box;
    flex-direction: column;
    justify-content: space-evenly;
  }

  /* Outlet logo and headline row */
  .outlet-header {
    display: flex;
    justify-content: space-between;
    font-family: var(--outlet-font);
    font-weight: 400;
    font-style: normal;
  }
  .outlet-header p {
    margin: 0;
  }

  /* Logo inside the headline row */
  .outlet-header img.logo {
    margin-right: 5%;
  }

  .headline a {
    margin: 0;
  }

  .headline-footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-content: center;
  }

  .byline {
    font-family: var(--author-font);
    text-align: left;
    margin: 0;
  }

  .description {
    text-align: left;
    margin: 0;
  }
</style>
