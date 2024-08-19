<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import FullTextArticle from "./FullTextArticle.svelte";
  // import Video from './Video.svelte';

  export let query = "SELECT * FROM Items LIMIT 10";
  let items = [];

  // Fetch data from the API when the component is loaded
  async function loadItems() {
    const response = await fetch(
      `/api/data?query=${encodeURIComponent(query)}`
    );
    items = await response.json();
  }

  // Load users when the component is created
  onMount(loadItems);

  const item_types = {
    FullTextArticle: FullTextArticle,
  };
</script>

<h1>Hello I am a component</h1>

<div>
  {#each items as item}
    <svelte:component this={item_types[item.item_type]} {item} />
  {/each}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    place-items: center;
  }
</style>
