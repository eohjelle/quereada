<main>
  <p>
    This is the start page of <a href="https://github.com/eohjelle/querygator"
      >Querygator</a
    >, a news and media aggregator which offers a high degree of
    customizability. Try navigating to some feeds using the navigation bar on
    the top of the window.
  </p>
  <p>
    The visible feeds are controlled by a configuration file in the root folder
    called 'config.ts`.
  </p>
</main>

<style>
  main {
    margin: 0 auto;
    max-width: 800px;
    padding: 2em;
  }

  main p a {
    color: blue;
  }

  main p a:hover {
    color: blue;
    text-decoration: underline;
    border-bottom: 0;
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
