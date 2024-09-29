<script lang="ts">
  import { getContext } from "svelte";
  import { api } from "$bridge/api_endpoint";
  import type { DisplayItem } from "$lib/types";
  import type { Writable } from "svelte/store";

  export let item: DisplayItem;

  // Initiate variable to indicate whether to show the summary. It is only relevant for items that are summarizable.
  const show_summary = getContext<Writable<boolean>>("show_summary");
</script>

<div class="button-container">
  <div
    class="seen-button"
    style="background-color: {item.seen ? 'green' : 'red'}"
  />
  <button
    on:click={() => {
      item.read_later = !item.read_later;
      api.updateReadLater(item.id, item.read_later);
    }}>{item.read_later ? "Remove from read later" : "Read later"}</button
  >
  <button
    on:click={() => {
      item.saved = !item.saved;
      api.updateSaved(item.id, item.saved);
    }}>{item.saved ? "Remove from saved" : "Save"}</button
  >
  {#if item.summarizable}
    <button
      on:click={() => {
        show_summary.update((bool) => !bool);
      }}>{$show_summary ? "Close Summary" : "Summarize"}</button
    >
  {/if}
</div>

<style>
  .button-container {
    margin-left: auto; /* Pushes the button container to the far right */
    display: flex;
    flex-direction: column;
    gap: 5px;
    /* justify-content: space-evenly; */
    width: 100%;
  }

  .seen-button {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-left: 10px;
    justify-self: end;
  }

  .button-container > button {
    min-height: 50px;
    margin: 10px;
  }
</style>
