<script lang="ts">
  import Home from "./components/Home.svelte";
  import RefreshButton from "./components/RefreshButton.svelte";
  import Feed from "./components/Feed.svelte";
  import { onMount } from "svelte";
  import { api } from "$bridge/api_endpoint";
  import type { Feed as FeedType } from "$lib/types";
  import {
    getStreamInterface,
    type StreamInterface,
  } from "$bridge/loading_items_to_feed";

  let feeds: FeedType[] = [];
  let selectedFeed: FeedType;
  let streamInterface: StreamInterface;

  onMount(async () => {
    console.log("Loading feed data...");
    feeds = await api.getFeedData();
    streamInterface = getStreamInterface();
  });
</script>

<nav>
  <div class="settings">
    <RefreshButton />
  </div>
  <div class="feeds">
    {#each feeds as feed}
      <a
        href={"javascript:void(0)"}
        aria-current={selectedFeed ? selectedFeed.title === feed.title : false}
        on:click={() => (selectedFeed = feed)}
      >
        {feed.title}
      </a>
    {/each}
  </div>
</nav>

<main>
  {#if selectedFeed}
    {#key selectedFeed}
      <Feed feed={selectedFeed} {streamInterface} />
    {/key}
  {:else}
    <Home />
  {/if}
</main>

<style>
  /* body {
    margin: 0;
    padding: 0;
  } */

  nav {
    position: sticky;
    top: 0;
    display: flex;
    gap: 0;
    z-index: 2;
    margin: 0 0 1em 0;
    /* width: 100%; */
    /* border: solid; */
    background-color: white;
    border-bottom: 2px solid #ddd;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    justify-content: center;
  }

  nav .settings {
    padding: 0 10px;
    margin-right: auto;
  }

  nav .feeds {
    flex: 1;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }

  .feeds a {
    /* flex: 1 1; */
    /* font-family: var(--author-font); */
    padding: 10px;
    font-weight: bold;
    text-decoration: none;
  }

  .feeds a[aria-current="true"] {
    border-bottom: 2px solid;
  }

  .feeds a:hover {
    background-color: var(--item-hover-color);
    /* border-bottom: 0; */
  }
</style>
