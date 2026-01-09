<script lang="ts">
  import { api } from "$bridge/api_endpoint";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  let isOpen = false;
  let queryTitle = "";
  let isLoading = false;
  let error = "";

  // Available sources and filters (fetched from backend)
  let availableSources: string[] = [];
  let availableFilters: Array<{ title: string; implementation: string }> = [];

  // Query builder fields
  let selectedSources: string[] = [];
  let orderByField: "date_published" | "date_added" | "id" = "date_published";
  let orderByDirection: "asc" | "desc" = "desc";
  let limitResults: number | null = null;

  // Filter conditions
  let filterReadLater = false;
  let filterSaved = false;
  let filterUnseen = false;
  let authorFilter = "";

  // Topic filter selections: { filterTitle: 'some' | 'none' | null }
  // 'some' = items must pass filter, 'none' = items must NOT pass filter, null = not selected
  let topicFilterSelections: Record<string, 'some' | 'none' | null> = {};

  // Also create feed checkbox
  let createFeed = true;

  export async function open() {
    isOpen = true;
    reset();
    await loadAvailableData();
  }

  function reset() {
    queryTitle = "";
    selectedSources = [];
    orderByField = "date_published";
    orderByDirection = "desc";
    limitResults = null;
    filterReadLater = false;
    filterSaved = false;
    filterUnseen = false;
    authorFilter = "";
    topicFilterSelections = {};
    createFeed = true;
    error = "";
  }

  function close() {
    isOpen = false;
  }

  async function loadAvailableData() {
    try {
      const [sources, filters] = await Promise.all([
        api.getAvailableSources(),
        api.getAvailableFilters()
      ]);
      availableSources = sources;
      availableFilters = filters;
      // Initialize selections to null (not selected)
      topicFilterSelections = {};
      for (const filter of filters) {
        topicFilterSelections[filter.title] = null;
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    }
  }

  function toggleSourceSelection(source: string) {
    if (selectedSources.includes(source)) {
      selectedSources = selectedSources.filter(s => s !== source);
    } else {
      selectedSources = [...selectedSources, source];
    }
  }

  function cycleFilterSelection(filterTitle: string) {
    // Cycle through: null -> 'some' -> 'none' -> null
    const current = topicFilterSelections[filterTitle];
    if (current === null) {
      topicFilterSelections[filterTitle] = 'some';
    } else if (current === 'some') {
      topicFilterSelections[filterTitle] = 'none';
    } else {
      topicFilterSelections[filterTitle] = null;
    }
    topicFilterSelections = topicFilterSelections; // trigger reactivity
  }

  function buildQuery() {
    const query: any = {
      title: queryTitle,
      orderBy: { [orderByField]: orderByDirection }
    };

    const whereConditions: any[] = [];

    // Source filter
    if (selectedSources.length > 0) {
      whereConditions.push({
        source_name: { in: selectedSources }
      });
    }

    // Boolean filters
    if (filterReadLater) {
      whereConditions.push({ read_later: true });
    }
    if (filterSaved) {
      whereConditions.push({ saved: true });
    }
    if (filterUnseen) {
      whereConditions.push({ seen: { equals: 0 } });
    }

    // Author filter
    if (authorFilter.trim()) {
      whereConditions.push({
        authors: {
          some: {
            name: authorFilter.trim()
          }
        }
      });
    }

    // Topic filters - group by mode (some/none)
    const mustPassFilters = Object.entries(topicFilterSelections)
      .filter(([_, mode]) => mode === 'some')
      .map(([title, _]) => title);
    const mustNotPassFilters = Object.entries(topicFilterSelections)
      .filter(([_, mode]) => mode === 'none')
      .map(([title, _]) => title);

    if (mustPassFilters.length > 0) {
      whereConditions.push({
        filters_passed: {
          some: {
            title: mustPassFilters.length === 1
              ? mustPassFilters[0]
              : { in: mustPassFilters }
          }
        }
      });
    }

    if (mustNotPassFilters.length > 0) {
      whereConditions.push({
        filters_passed: {
          none: {
            title: mustNotPassFilters.length === 1
              ? mustNotPassFilters[0]
              : { in: mustNotPassFilters }
          }
        }
      });
    }

    // Combine where conditions
    if (whereConditions.length === 1) {
      query.where = whereConditions[0];
    } else if (whereConditions.length > 1) {
      query.where = { AND: whereConditions };
    }

    // Limit
    if (limitResults && limitResults > 0) {
      query.take = limitResults;
    }

    return query;
  }

  async function handleSave() {
    if (!queryTitle.trim()) {
      error = "Please provide a query title";
      return;
    }

    isLoading = true;
    error = "";

    try {
      const query = buildQuery();
      const result = await api.addQuery(query, createFeed);

      if (result.success) {
        dispatch("added");
        close();
        window.location.reload();
      } else {
        error = result.error || "Failed to add query";
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to add query";
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    }
  }

  // Preview the generated query
  $: previewQuery = queryTitle ? buildQuery() : null;
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-overlay" on:click={close} on:keydown={handleKeydown} role="button" tabindex="-1">
    <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <button class="close-button" on:click={close} aria-label="Close">x</button>

      <h2>Create Query</h2>

      {#if error}
        <div class="error">{error}</div>
      {/if}

      <form on:submit|preventDefault={handleSave}>
        <label>
          Query Title:
          <input type="text" bind:value={queryTitle} required placeholder="My Custom Query" autofocus />
        </label>

        <fieldset>
          <legend>Filter by Source</legend>
          {#if availableSources.length > 0}
            <div class="checkbox-grid">
              {#each availableSources as source}
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    on:change={() => toggleSourceSelection(source)}
                  />
                  {source}
                </label>
              {/each}
            </div>
          {:else}
            <p class="hint">No sources available. Add some RSS sources first.</p>
          {/if}
        </fieldset>

        <fieldset>
          <legend>Filter Conditions</legend>

          <label class="checkbox-label">
            <input type="checkbox" bind:checked={filterReadLater} />
            Read Later items only
          </label>

          <label class="checkbox-label">
            <input type="checkbox" bind:checked={filterSaved} />
            Saved items only
          </label>

          <label class="checkbox-label">
            <input type="checkbox" bind:checked={filterUnseen} />
            Unseen items only
          </label>

          <label>
            By Author:
            <input type="text" bind:value={authorFilter} placeholder="Author name" />
          </label>
        </fieldset>

        <fieldset>
          <legend>Topic Filters</legend>
          {#if availableFilters.length > 0}
            <p class="hint">Click to cycle: off → must match → must NOT match → off</p>
            <div class="filter-list">
              {#each availableFilters as filter}
                <button
                  type="button"
                  class="filter-chip"
                  class:must-pass={topicFilterSelections[filter.title] === 'some'}
                  class:must-not-pass={topicFilterSelections[filter.title] === 'none'}
                  on:click={() => cycleFilterSelection(filter.title)}
                  title={topicFilterSelections[filter.title] === 'some'
                    ? 'Must match this filter'
                    : topicFilterSelections[filter.title] === 'none'
                      ? 'Must NOT match this filter'
                      : 'Click to require this filter'}
                >
                  {#if topicFilterSelections[filter.title] === 'some'}
                    <span class="filter-icon">✓</span>
                  {:else if topicFilterSelections[filter.title] === 'none'}
                    <span class="filter-icon">✗</span>
                  {/if}
                  {filter.title}
                </button>
              {/each}
            </div>
          {:else}
            <p class="hint">No topic filters available.</p>
          {/if}
        </fieldset>

        <fieldset>
          <legend>Sorting</legend>

          <label>
            Order By:
            <select bind:value={orderByField}>
              <option value="date_published">Date Published</option>
              <option value="date_added">Date Added</option>
              <option value="id">ID (insertion order)</option>
            </select>
          </label>

          <label>
            Direction:
            <select bind:value={orderByDirection}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </label>
        </fieldset>

        <label>
          Limit Results (optional):
          <input type="number" bind:value={limitResults} min="1" placeholder="No limit" />
        </label>

        <label class="checkbox-label">
          <input type="checkbox" bind:checked={createFeed} />
          Also create a feed with this query
        </label>

        {#if previewQuery}
          <details>
            <summary>Preview Query</summary>
            <pre class="query-preview">{JSON.stringify(previewQuery, null, 2)}</pre>
          </details>
        {/if}

        <div class="button-row">
          <button type="button" class="secondary" on:click={close}>Cancel</button>
          <button type="submit" disabled={isLoading || !queryTitle.trim()}>
            {isLoading ? "Creating..." : "Create Query"}
          </button>
        </div>
      </form>
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
    max-width: 600px;
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

  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem;
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

  .hint {
    color: #666;
    font-style: italic;
    margin: 0;
  }

  .query-preview {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }

  details summary {
    cursor: pointer;
    color: #666;
  }

  details summary:hover {
    color: var(--active-button-color, #4d9645);
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

  input[type="text"],
  input[type="number"],
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

  .filter-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: 1rem;
    border: 1px solid #ccc;
    background: #f5f5f5;
    color: #666;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .filter-chip:hover {
    border-color: #999;
    background: #eee;
  }

  .filter-chip.must-pass {
    background: #e8f5e9;
    border-color: #4caf50;
    color: #2e7d32;
  }

  .filter-chip.must-not-pass {
    background: #ffebee;
    border-color: #f44336;
    color: #c62828;
  }

  .filter-icon {
    font-weight: bold;
  }
</style>
