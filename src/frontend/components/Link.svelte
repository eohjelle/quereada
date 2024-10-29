<script>
  import Headline from "./Headline.svelte";

  export let item;
</script>

<div class="link-container">
  <h3 style:font-family="var(--outlet-font)">{item.source_name}</h3>
  <Headline {item} />
</div>

<style>
  /* Container for the link */
  .link-container {
    padding: 10px;
  }
</style>
