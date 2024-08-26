<script>
  import Feed from "$src/lib/components/Feed.svelte";

  async function update_db() {
    // todo: move this to layout
    console.log("Updating database with fresh links...");
    await fetch("/api/refresh_database");
  }

  export let data;
  $: feed = data.feed; // Needs to be reactive? https://github.com/sveltejs/kit/discussions/9533. todo: change for svelte 5?
</script>

Hello I am a page. The feed under consideration is {feed.feed_title}.

<button on:click={update_db}>Update Database</button>

<div style="border: 2px solid red; position: relative; height: 50px;">
  <div
    style="background-color: lightblue; position: absolute; left: 0px; top: 0px; height: 100%; width: 100%;"
  >
    <p>Some text</p>
  </div>
</div>

{#key feed}
  <Feed {feed} />
{/key}

No more items to show.
