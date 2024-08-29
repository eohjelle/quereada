<script>
  import { onMount } from "svelte";

  export let item;

  onMount(() => {
    get_summary();
  });

  let summary = "";

  async function get_summary() {
    const response = await fetch("/api/summarize", {
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
    });
    // todo: use the following code to read the response body as a stream when [Symbol.asynciterator] becomes supported by Safari: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#browser_compatibility
    // const decoder = new TextDecoder();
    // for await (const chunk of response.body) {
    //   console.log(decoder.decode(chunk));
    //   summary += decoder.decode(chunk);
    // }

    // todo: remove the following code when [Symbol.asynciterator] becomes supported by Safari
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      summary += decoder.decode(value);
    }
  }
</script>

<p>{summary}</p>

<style>
  p {
    padding: 20px;
    white-space: pre-line;
  }
</style>
