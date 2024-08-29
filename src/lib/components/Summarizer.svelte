<script>
  import { onMount } from "svelte";

  export let item;
  let summary_promise;

  async function get_summary() {
    console.log(`Sending api request to summarize item with id ${item.id}...`);
    // const test_summary = await fetch("/api/summarize", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     id: item.id,
    //     source: item.source_name,
    //     title: item.title,
    //     authors: item.authors,
    //     description: item.description,
    //     content: item.content,
    //   }),
    // });
    // console.log(`Received response: ${await test_summary.text()}`);
    summary_promise = fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: item.id,
        source: item.source_name,
        title: item.title,
        authors: item.authors,
        description: item.description,
        content: item.content,
      }),
    }).then((response) => response.text());
  }

  onMount(() => get_summary());
</script>

{#await summary_promise}
  <p>Loading summary...</p>
{:then summary}
  <p>{summary}</p>
{:catch}
  <p>Failed to load summary.</p>
{/await}

<style>
  p {
    padding: 20px;
    white-space: pre-line;
  }
</style>
