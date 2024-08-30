<script>
  import Feed from "$src/lib/components/Feed.svelte";

  export let data;
  $: feed = data.feed; // Needs to be reactive? https://github.com/sveltejs/kit/discussions/9533. todo: change for svelte 5?
  $: console.log(`From [feed]/+page.svelte, we observe feed: ${feed}`);
</script>

{#key feed}
  {#if feed}
    The feed is {feed.title}!!!!!!!!
    <Feed {feed} />
  {:else}
    <p>Loading feed...</p>
  {/if}
{/key}
