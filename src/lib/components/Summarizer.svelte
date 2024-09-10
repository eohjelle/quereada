<script>
  import { onMount } from "svelte";
  import { fetch_summary_stream } from "$lib/api";

  export let item;

  onMount(() => {
    get_summary();
  });

  let summary = "Loading summary...";

  async function get_summary() {
    const stream = await fetch_summary_stream({ id: item.id });
    // todo: use the following code to read the response body as a stream when [Symbol.asynciterator] becomes supported by Safari: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#browser_compatibility
    // for await (const chunk of stream) {
    //   summary += chunk;
    // }

    // todo: remove the following code when [Symbol.asynciterator] becomes supported by Safari
    const reader = stream.getReader();

    summary = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      summary += value;
    }
  }
</script>

<span>{summary}</span>

<style>
  span {
    white-space: pre-line;
  }
</style>
