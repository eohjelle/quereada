<script>
  import Feed from "$src/lib/components/Feed.svelte";

  export let data;
  $: feed = data.feed; // Needs to be reactive? https://github.com/sveltejs/kit/discussions/9533. todo: change for svelte 5?
</script>

{#key feed}
  <Feed {feed} />
{/key}
