<script>
  import { byline } from "$lib/components/helpers";

  export let item;
</script>

<div class="link-container">
  <h3>{item.source_name}</h3>
  <h2><a href={item.link}>{@html item.title}</a></h2>
</div>

<style>
  /* Container for the link */
  .link-container {
    padding: 10px;
  }
</style>
