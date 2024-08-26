<script>
  export let data;
</script>

<nav>
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
    background: var(--bg-2);
    z-index: 2;
    margin: 0 0 1em 0;
    border-radius: var(--border-radius);
  }
</style>
