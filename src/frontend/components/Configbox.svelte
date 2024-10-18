<script lang="ts">
  import { api } from "$bridge/api_endpoint";
  import { onMount } from "svelte";

  let config: string;

  onMount(async () => {
    config = await api.getRawConfig();
  });
</script>

<div class="codebox">
  <div class="codebox-header">
    <span class="filename">config.ts</span>
    <span class="language">(TypeScript)</span>
  </div>
  <pre><code class="language-javascript">
        {config}
    </code></pre>
</div>

<svelte:head>
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/themes/prism.min.css"
    rel="stylesheet"
  />
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/plugins/line-numbers/prism-line-numbers.min.css"
    rel="stylesheet"
  />
</svelte:head>

<style>
  /* Codebox container */
  .codebox {
    border: 1px solid #ccc;
    border-radius: 8px;
    margin: 20px 0;
    overflow: hidden;
    font-family: "Courier New", Courier, monospace;
  }

  /* Codebox header */
  .codebox-header {
    background-color: #f5f5f5;
    padding: 10px;
    font-weight: bold;
    border-bottom: 1px solid #ccc;
    display: flex;
    justify-content: space-between;
  }

  /* File name */
  .filename {
    font-style: italic;
  }

  /* Language */
  .language {
    color: #888;
  }

  /* Code block */
  pre {
    margin: 0;
    padding: 15px;
    overflow-x: auto;
  }
</style>
