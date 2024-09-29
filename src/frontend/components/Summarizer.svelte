<script lang="ts">
  import { onMount } from "svelte";
  import type { DisplayItem } from "$lib/types";
  import { api } from "$bridge/api_endpoint";

  export let item: DisplayItem;
  let summary = "Loading summary...";

  onMount(async () => {
    const summaryStream = await api.getSummary(item.id);
    summary = "";
    summaryStream.pipeTo(
      new WritableStream({
        write(chunk) {
          summary += chunk;
        },
      })
    );
  });
</script>

<span>{summary}</span>

<style>
  span {
    white-space: pre-line;
  }
</style>
