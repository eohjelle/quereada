<script>
  import { fade } from "svelte/transition";

  let refreshPromise;
  let clicked = false;

  async function update_db() {
    clicked = true;
    console.log("Updating database with fresh links...");
    refreshPromise = fetch("/api/refresh_database");
  }

  // Copied from here: https://learn.svelte.dev/tutorial/custom-js-transitions
  function typewriter(node, { speed = 1 }) {
    const valid =
      node.childNodes.length === 1 &&
      node.childNodes[0].nodeType === Node.TEXT_NODE;

    if (!valid) {
      throw new Error(
        `This transition only works on elements with a single text node child`
      );
    }

    const text = node.textContent;
    const duration = text.length / (speed * 0.01);

    return {
      duration,
      tick: (t) => {
        const i = Math.trunc(text.length * t);
        node.textContent = text.slice(0, i);
      },
    };
  }
</script>

<button on:click={update_db}>
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
