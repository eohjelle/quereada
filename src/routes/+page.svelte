<script>
  import Prism from "prismjs";
  export let data;

  const config = data.config;
</script>

<main>
  <p>
    This page is a demo of Querygator, a news and media aggregator which offers
    high degree of customizability. Try navigating to some feeds using the
    navigation bar on the top of the window.
  </p>
  <p>For this demo, the following configuration file is used.</p>
  <div class="codebox">
    <div class="codebox-header">
      <span class="filename">config.ts</span>
      <span class="language">(TypeScript)</span>
    </div>
    <pre><code class="language-javascript">
        {config}
    </code></pre>
  </div>
</main>

<svelte:head>
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/themes/prism.min.css"
    rel="stylesheet"
  />
</svelte:head>

<style>
  main {
    margin: 0 auto;
    max-width: 800px;
    padding: 2em;
  }
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
  }
</style>
