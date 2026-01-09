<script lang="ts">
  import Configbox from "./Configbox.svelte";
</script>

<main>
  <h1>Welcome to Quereada</h1>
  <p class="tagline">Build personalized feeds from anything on the internet.</p>

  <section>
    <h2>Getting Started</h2>
    <ul>
      <li>Click the <strong>+</strong> button to add RSS sources, create queries, or generate AI digests</li>
      <li>Use the navigation bar to switch between your feeds</li>
      <li>Click the refresh button to fetch new items</li>
    </ul>
  </section>

  <section>
    <h2>Current Configuration</h2>
    <Configbox />
  </section>

  <p class="footer">
    <a href="https://github.com/eohjelle/quereada">View on GitHub</a>
  </p>
</main>

<style>
  main {
    margin: 0 auto;
    max-width: 700px;
    padding: 2em;
  }

  h1 {
    margin-bottom: 0.25em;
  }

  .tagline {
    color: #666;
    font-size: 1.1em;
    margin-top: 0;
    margin-bottom: 2em;
  }

  section {
    margin-bottom: 2em;
  }

  h2 {
    font-size: 1.1em;
    margin-bottom: 0.5em;
  }

  ul {
    margin: 0;
    padding-left: 1.5em;
  }

  li {
    margin-bottom: 0.5em;
  }

  .footer {
    margin-top: 3em;
    font-size: 0.9em;
  }

  a {
    color: var(--active-button-color, #4d9645);
  }

  a:hover {
    text-decoration: underline;
  }
</style>
