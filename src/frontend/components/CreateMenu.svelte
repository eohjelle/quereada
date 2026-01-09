<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
  }

  function close() {
    isOpen = false;
  }

  function select(type: 'source' | 'query' | 'digest' | 'feed') {
    dispatch('select', { type });
    close();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.create-menu')) {
      close();
    }
  }
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="create-menu">
  <button
    class="menu-trigger"
    on:click|stopPropagation={toggle}
    aria-label="Create new item"
    aria-expanded={isOpen}
    aria-haspopup="menu"
    title="Create new..."
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  </button>

  {#if isOpen}
    <div class="menu-dropdown" role="menu">
      <button class="menu-item" role="menuitem" on:click={() => select('source')}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
        </svg>
        <span>RSS Source</span>
        <span class="menu-hint">Add a new RSS feed</span>
      </button>

      <button class="menu-item" role="menuitem" on:click={() => select('query')}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <span>Query</span>
        <span class="menu-hint">Filter items with conditions</span>
      </button>

      <button class="menu-item" role="menuitem" on:click={() => select('digest')}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <span>Digest</span>
        <span class="menu-hint">AI-generated news briefing</span>
      </button>

      <button class="menu-item" role="menuitem" on:click={() => select('feed')}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
        </svg>
        <span>Feed</span>
        <span class="menu-hint">Combine blocks into a feed</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .create-menu {
    position: relative;
  }

  .menu-trigger {
    background-color: transparent;
    border: none;
    padding: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    width: 44px;
    height: 44px;
  }

  .menu-trigger:hover {
    filter: drop-shadow(0 0 5px var(--hover-button-color));
  }

  .menu-trigger svg {
    fill: var(--inactive-button-color);
  }

  .menu-trigger:hover svg,
  .menu-trigger[aria-expanded="true"] svg {
    fill: var(--active-button-color);
  }

  .menu-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 320px;
    z-index: 1000;
    overflow: hidden;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    font-size: 0.95rem;
    color: #333;
    position: relative;
  }

  .menu-item:hover {
    background: #f5f5f5;
  }

  .menu-item svg {
    fill: #666;
    flex-shrink: 0;
  }

  .menu-item:hover svg {
    fill: var(--active-button-color, #4d9645);
  }

  .menu-item span:first-of-type {
    font-weight: 500;
  }

  .menu-hint {
    display: block;
    position: absolute;
    right: 1rem;
    font-size: 0.75rem;
    color: #999;
    font-weight: normal !important;
  }

  .menu-item + .menu-item {
    border-top: 1px solid #eee;
  }
</style>
