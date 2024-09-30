<script lang="ts">
  import { api } from "$bridge/api_endpoint";

  export let item: {
    id: number;
    title: string;
    link: string;
    feed_title: string;
    block_title: string;
  };
</script>

<h2>
  <a
    href={item.link}
    on:click={() =>
      api.updateClicks(item.id, item.feed_title, item.block_title)}
    >{@html item.title}</a
  >
</h2>

<style>
  h2 a {
    margin: 0;
  }
</style>
