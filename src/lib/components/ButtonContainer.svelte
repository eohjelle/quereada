<script>
  import { getContext } from "svelte";

  // Function to update the database when the item is marked as read later
  async function updateReadLaterToDB() {
    const request = {
      prisma_function: "update",
      prisma_query: {
        where: { id: item.id },
        data: { read_later: item.read_later },
      },
    };
    await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  }

  // Function to update the database when the item is marked as saved
  async function updateSavedToDB() {
    const request = {
      prisma_function: "update",
      prisma_query: {
        where: { id: item.id },
        data: { saved: item.saved },
      },
    };
    await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  }

  export let item;

  // Initiate variable to indicate whether to show the summary. It is only relevant for items that are summarizable.
  const show_summary = getContext("show_summary");
</script>

<div class="button-container">
  <div
    class="seen-button"
    style="background-color: {item.seen ? 'green' : 'red'}"
  />
  <button
    on:click={() => {
      item.read_later = !item.read_later;
      updateReadLaterToDB();
    }}>{item.read_later ? "Remove from read later" : "Read later"}</button
  >
  <button
    on:click={() => {
      item.saved = !item.saved;
      updateSavedToDB();
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
    justify-content: space-evenly;
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
