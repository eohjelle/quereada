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
  <button class="icon-button">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      style:fill={item.seen > 0
        ? "var(--active-button-color)"
        : "var(--inactive-button-color)"}
    >
      <path
        d="M12 5c-7.633 0-11.45 7-11.45 7s3.817 7 11.45 7 11.45-7 11.45-7-3.817-7-11.45-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z"
      />
      <circle cx="12" cy="12" r="2.5" fill="#fff" />
    </svg>
  </button>
  <button
    class="icon-button"
    on:click={() => {
      item.read_later = !item.read_later;
      api.updateReadLater(item.id, item.read_later);
    }}
  >
    <svg
      class="svg-icon"
      width="24"
      height="24"
      viewBox="0 0 500 500"
      style:fill={item.read_later
        ? "var(--active-button-color)"
        : "var(--inactive-button-color)"}
    >
      <path
        d="M353.7,85.738c6.5-2,13.5-1.3,19.5,1.9c6,3.2,10.4,8.6,12.4,15.1v0.1c0,0,0,0,0,0.1l43,136.4c-13-5.9-27.5-9.2-42.7-9.2
    c-52,0-95.1,38.4-102.5,88.4H206c-8.2-49-50.9-86.5-102.3-86.5c-15.3,0-29.8,3.3-42.8,9.3l43.5-138.3c0,0,0,0,0-0.1v-0.1
    c4.1-13.5,18.4-21.1,31.9-17c9.1,2.7,18.6-2.4,21.4-11.4c2.8-9.1-2.4-18.6-11.4-21.4c-31.5-9.6-64.9,8.2-74.6,39.6c0,0,0,0,0,0.1
    v0.1l0,0l0,0l-63.8,202.6c-0.2,0.6-0.3,1.2-0.5,1.8c-4.8,11.9-7.4,24.9-7.4,38.4c0,57.2,46.5,103.7,103.7,103.7
    c51.3,0,94.1-37.5,102.3-86.5h78c8.9,48.1,51.2,84.7,101.9,84.7c57.2,0,103.7-46.5,103.7-103.7c0-13.7-2.7-26.7-7.5-38.7
    l-63.8-202.5v-0.1c-4.7-15.2-15-27.7-29-35.2c-14.1-7.5-30.3-9.1-45.6-4.5c-9.1,2.8-14.2,12.3-11.4,21.4
    C335,83.438,344.6,88.538,353.7,85.738z M103.7,405.038c-38.3,0-69.4-31.1-69.4-69.4s31.1-69.4,69.4-69.4s69.4,31.1,69.4,69.4
    S142,405.038,103.7,405.038z M385.9,403.238c-38.3,0-69.4-31.1-69.4-69.4s31.1-69.4,69.4-69.4s69.4,31.1,69.4,69.4
    S424.1,403.238,385.9,403.238z"
      />
    </svg>
  </button>
  <button
    class="icon-button"
    on:click={() => {
      item.saved = !item.saved;
      api.updateSaved(item.id, item.saved);
    }}
  >
    <svg
      class="svg-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      style:fill={item.saved
        ? "var(--active-button-color)"
        : "var(--inactive-button-color)"}
    >
      <path d="M6 4v16l6-4 6 4V4H6z" />
    </svg>
  </button>
  {#if item.summarizable}
    <button
      class="icon-button"
      on:click={() => {
        show_summary.update((bool) => !bool);
      }}
    >
      <svg
        class="svg-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        style:fill={$show_summary
          ? "var(--active-button-color)"
          : "var(--inactive-button-color)"}
      >
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-6 14H7v-2h6v2zm0-4H7v-2h6v2zm0-4H7V7h6v2z"
        />
      </svg>
    </button>
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

  .icon-button {
    background-color: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    margin: 15px;
    min-height: 20px;
    border-radius: 50%;
  }

  .icon-button:hover .svg-icon {
    filter: drop-shadow(0 0 5px var(--hover-button-color));
  }
</style>
