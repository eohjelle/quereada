<script lang="ts">
  import Configbox from "./Configbox.svelte";
</script>

<main>
  <p>
    This is the start page of <a href="https://github.com/eohjelle/quereada"
      >Quereada</a
    >: an open-source and free to use app that provides tools to build your own
    feeds from the internet and display them in an elegant interface. Try
    navigating to some feeds using the navigation bar on the top of the window.
  </p>
  <p>
    All the feeds are controlled by a simple configuration file, which is
    previewed below.
  </p>
  <Configbox />
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
</style>
