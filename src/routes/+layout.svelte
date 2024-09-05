<script>
  import "../app.css";
  import RefreshButton from "$lib/components/RefreshButton.svelte";
  import { page } from "$app/stores";

  export let data;
</script>

<nav>
  <div class="settings">
    <RefreshButton />
  </div>
  <div class="feeds">
    {#each data.feeds as feed}
      <a
        href="/{feed}"
        aria-current={$page.url.pathname === `/${feed}`.replace(/\s/g, "%20")}
        >{feed}</a
      >
    {/each}
  </div>
</nav>

<slot></slot>

<style>
  body {
    margin: 0;
    padding: 0;
  }

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
