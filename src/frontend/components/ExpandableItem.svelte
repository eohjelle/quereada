<script lang="ts">
  import { createEventDispatcher, setContext } from "svelte";
  import { slide } from "svelte/transition";
  import { writable } from "svelte/store";
  import type { DigestItem } from "$lib/types";
  import { byline } from "$lib/utils";

  export let item: DigestItem;

  const dispatch = createEventDispatcher();

  // Set up context for show_summary (needed by Article component pattern)
  const show_summary = writable(false);
  setContext("show_summary", show_summary);

  const date = item.date_published
    ? new Date(item.date_published).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
</script>

<div class="expandable-item" transition:slide={{ duration: 300 }}>
  <button class="close-btn" on:click={() => dispatch("close")}>Close</button>
  <div class="item-content">
    <header class="item-header">
      <span class="source">{item.source_name}</span>
      {#if date}
        <span class="date">{date}</span>
      {/if}
    </header>
    <h3 class="title">
      <a href={item.link} target="_blank" rel="noopener noreferrer">
        {item.title}
      </a>
    </h3>
    {#if item.authors && item.authors.length > 0}
      <p class="byline">{byline(item.authors)}</p>
    {/if}
    {#if item.description}
      <p class="description">{@html item.description}</p>
    {/if}
  </div>
</div>

<style>
  .expandable-item {
    background-color: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0;
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
  }

  .close-btn:hover {
    background-color: #eee;
  }

  .item-content {
    margin-top: 8px;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.85em;
    color: #666;
    margin-bottom: 8px;
  }

  .source {
    font-family: var(--outlet-font);
  }

  .title {
    margin: 0 0 8px 0;
    font-size: 1.1em;
  }

  .title a {
    color: inherit;
    text-decoration: none;
  }

  .title a:hover {
    text-decoration: underline;
  }

  .byline {
    font-family: var(--author-font);
    font-size: 0.9em;
    margin: 0 0 8px 0;
    color: #555;
  }

  .description {
    font-size: 0.95em;
    line-height: 1.5;
    margin: 0;
    color: #333;
  }
</style>
