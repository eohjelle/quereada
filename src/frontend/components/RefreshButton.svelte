<script lang="ts">
  import { api } from "$bridge/api_endpoint";

  let refreshPromise: Promise<void>;
  let clicked = false;
</script>

<button
  on:click={async () => {
    clicked = true;
    refreshPromise = api.refreshFeeds();
    await refreshPromise;
    location.reload();
  }}
>
  {#if !clicked}
    Refresh feeds
  {:else}
    {#await refreshPromise}
      <p>Refreshing...</p>
    {:then}
      <p>Feeds refreshed!</p>
    {/await}
  {/if}
</button>

<style>
  button {
    background-color: #f0f0f0;
    border: none;
    color: black;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
  }

  button:hover {
    background-color: #e0e0e0;
  }
</style>
