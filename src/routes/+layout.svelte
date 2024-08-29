<script>
  import "../app.css";
  import RefreshButton from "$lib/components/RefreshButton.svelte";

  export let data;
</script>

<nav>
  <RefreshButton />
  {#each data.feeds as feed}
    <a href="/{feed}">{feed}</a>
  {/each}
</nav>

<slot></slot>

<style>
  nav {
    position: sticky;
    display: flex;
    gap: 1em;
    padding: 1em;
    background: #e6ffe0;
    z-index: 2;
    margin: 0 0 1em 0;
    border-radius: 15px;
  }

  nav a {
    background-color: #1f221e;
    padding: 10px;
    border-radius: 15px;
    color: #e6ffe0;
    font-weight: bold;
    text-decoration: none;
  }

  nav a:hover {
    background-color: red;
  }
</style>
