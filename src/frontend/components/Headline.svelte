<script lang="ts">
  import { api } from "$bridge/api_endpoint";

  export let item: { id: number; title: string; link: string };
</script>

<h2>
  <a href={item.link} on:click={() => api.incrementClicked(item.id)}
    >{@html item.title}</a
  >
</h2>

<style>
  h2 a {
    margin: 0;
  }
</style>
