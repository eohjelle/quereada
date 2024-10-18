<script lang="ts">
  import { api } from "$bridge/api_endpoint";

  let isRefreshing = false;
</script>

<button
  on:click={async () => {
    isRefreshing = true;
    api.refreshFeeds().finally(() => {
      isRefreshing = false;
      window.location.reload();
    });
  }}
  class:refreshing={isRefreshing}
  aria-label="Refresh feeds"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    style:fill={isRefreshing
      ? "var(--active-button-color)"
      : "var(--inactive-button-color)"}
  >
    <path
      d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
    />
  </svg>
</button>

<style>
  button {
    background-color: transparent;
    border: none;
    color: black;
    padding: 10px;
    text-align: center;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 50%;
    width: 44px;
    height: 44px;
  }

  button:hover {
    filter: drop-shadow(0 0 5px var(--hover-button-color));
  }

  button.refreshing svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  svg {
    fill: currentColor;
  }
</style>
