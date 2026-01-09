<script lang="ts">
  import { api } from "$bridge/api_endpoint";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let isOpen = false;
  let step: "input" | "discovered" | "confirm" = "input";
  let inputUrl = "";
  let sourceName = "";
  let selectedUrls: string[] = [];
  let discoveredFeeds: Array<{ url: string; title?: string }> = [];
  let isLoading = false;
  let error = "";
  let validationResult: { valid: boolean; title?: string; itemCount?: number } | null = null;

  // Default values
  let itemType: "Article" | "Link" = "Article";
  let langId = "en";
  let summarizable = true;

  export function open() {
    isOpen = true;
    reset();
  }

  function reset() {
    step = "input";
    inputUrl = "";
    sourceName = "";
    selectedUrls = [];
    discoveredFeeds = [];
    isLoading = false;
    error = "";
    validationResult = null;
    itemType = "Article";
    langId = "en";
    summarizable = true;
  }

  function close() {
    isOpen = false;
    reset();
  }

  async function handleUrlSubmit() {
    if (!inputUrl) return;
    isLoading = true;
    error = "";

    try {
      // First try to validate as direct RSS feed
      const validation = await api.validateRssFeed(inputUrl);

      if (validation.valid) {
        validationResult = validation;
        selectedUrls = [inputUrl];
        sourceName = validation.title || new URL(inputUrl).hostname;
        step = "confirm";
      } else {
        // Try to discover feeds from the URL
        const discovery = await api.discoverRssFeeds(inputUrl);

        if (discovery.feeds.length > 0) {
          discoveredFeeds = discovery.feeds;
          step = "discovered";
        } else {
          error = validation.error || "No RSS feeds found. Please enter a direct RSS feed URL.";
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to process URL";
    } finally {
      isLoading = false;
    }
  }

  function toggleFeedSelection(url: string) {
    if (selectedUrls.includes(url)) {
      selectedUrls = selectedUrls.filter(u => u !== url);
    } else {
      selectedUrls = [...selectedUrls, url];
    }
  }

  async function handleFeedSelection() {
    if (selectedUrls.length === 0) {
      error = "Please select at least one feed";
      return;
    }

    // Auto-generate name from first feed if not set
    if (!sourceName && selectedUrls.length > 0) {
      const firstFeed = discoveredFeeds.find(f => f.url === selectedUrls[0]);
      sourceName = firstFeed?.title || new URL(selectedUrls[0]).hostname;
    }

    step = "confirm";
  }

  async function handleSave() {
    if (!sourceName || selectedUrls.length === 0) {
      error = "Please provide a name and at least one feed URL";
      return;
    }

    isLoading = true;
    error = "";

    try {
      const result = await api.addRssSource({
        name: sourceName,
        urls: selectedUrls,
        defaultValues: {
          item_type: itemType,
          lang_id: langId,
          summarizable
        }
      });

      if (result.success) {
        dispatch("added");
        close();
        window.location.reload();
      } else {
        error = result.error || "Failed to add source";
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to add source";
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-overlay" on:click={close} on:keydown={handleKeydown} role="button" tabindex="-1">
    <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <button class="close-button" on:click={close} aria-label="Close">x</button>

      <h2>Add RSS Source</h2>

      {#if error}
        <div class="error">{error}</div>
      {/if}

      {#if step === "input"}
        <form on:submit|preventDefault={handleUrlSubmit}>
          <label>
            Enter RSS feed URL or website URL:
            <input
              type="url"
              bind:value={inputUrl}
              placeholder="https://example.com/feed.xml"
              required
              autofocus
            />
          </label>
          <div class="button-row">
            <button type="button" class="secondary" on:click={close}>Cancel</button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Checking..." : "Continue"}
            </button>
          </div>
        </form>

      {:else if step === "discovered"}
        <p>Found {discoveredFeeds.length} RSS feed(s). Select which to add:</p>
        <div class="feed-list">
          {#each discoveredFeeds as feed}
            <label class="feed-item">
              <input
                type="checkbox"
                checked={selectedUrls.includes(feed.url)}
                on:change={() => toggleFeedSelection(feed.url)}
              />
              <div class="feed-info">
                <span class="feed-title">{feed.title || "Untitled Feed"}</span>
                <span class="feed-url">{feed.url}</span>
              </div>
            </label>
          {/each}
        </div>
        <div class="button-row">
          <button type="button" class="secondary" on:click={() => step = "input"}>Back</button>
          <button on:click={handleFeedSelection} disabled={selectedUrls.length === 0}>
            Continue
          </button>
        </div>

      {:else if step === "confirm"}
        <form on:submit|preventDefault={handleSave}>
          <label>
            Source Name:
            <input type="text" bind:value={sourceName} required />
          </label>

          <div class="urls-preview">
            <strong>Feed URLs:</strong>
            <ul>
              {#each selectedUrls as url}
                <li>{url}</li>
              {/each}
            </ul>
          </div>

          <fieldset>
            <legend>Default Values</legend>

            <label>
              Item Type:
              <select bind:value={itemType}>
                <option value="Article">Article</option>
                <option value="Link">Link</option>
              </select>
            </label>

            <label>
              Language:
              <input type="text" bind:value={langId} placeholder="en" />
            </label>

            <label class="checkbox-label">
              <input type="checkbox" bind:checked={summarizable} />
              Summarizable
            </label>
          </fieldset>

          <div class="button-row">
            <button type="button" class="secondary" on:click={() => step = discoveredFeeds.length > 0 ? "discovered" : "input"}>Back</button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Source"}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    line-height: 1;
  }

  .close-button:hover {
    color: var(--active-button-color, #4d9645);
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .error {
    background: #fee;
    color: #c00;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .checkbox-label {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  input[type="url"],
  input[type="text"],
  select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--active-button-color, #4d9645);
    outline-offset: 1px;
  }

  .button-row {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  button {
    padding: 0.75rem 1.25rem;
    background: var(--active-button-color, #4d9645);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.secondary {
    background: #666;
  }

  .feed-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .feed-item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid #eee;
    border-radius: 4px;
    cursor: pointer;
  }

  .feed-item:hover {
    background: #f9f9f9;
  }

  .feed-item input[type="checkbox"] {
    margin-top: 0.25rem;
  }

  .feed-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .feed-title {
    font-weight: bold;
  }

  .feed-url {
    font-size: 0.8rem;
    color: #666;
    word-break: break-all;
  }

  fieldset {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  legend {
    padding: 0 0.5rem;
    font-weight: bold;
  }

  .urls-preview {
    background: #f5f5f5;
    padding: 0.75rem;
    border-radius: 4px;
  }

  .urls-preview ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
    font-size: 0.9rem;
    color: #666;
  }

  .urls-preview li {
    word-break: break-all;
  }
</style>
