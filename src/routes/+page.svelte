<script>
  import Query from "$lib/components/Query.svelte";
</script>

Hello I am a page.

<div class="items-container">
  <Query query={"SELECT * FROM Items LIMIT 10"} />
  <!-- <Query query={"SELECT * FROM Items WHERE source_name = 'The New York Times' LIMIT 10"} /> -->
</div>

<style>
  .items-container {
    place-items: center;
  }
</style>
