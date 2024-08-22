<script>
  import Scroller from "$lib/components/Scroller.svelte";

  async function update_db() {
    console.log("Updating database with fresh links...");
    await fetch("/api/refresh_database");
  }
</script>

Hello I am a page.

<button on:click={update_db}>Update Database</button>

<div style="border: 2px solid red; position: relative; height: 50px;">
  <div
    style="background-color: lightblue; position: absolute; left: 0px; top: 0px; height: 100%; width: 100%;"
  >
    <p>Some text</p>
  </div>
</div>

<Scroller />

No more items to show.
