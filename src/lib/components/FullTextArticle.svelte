<script>
  export let item;
</script>

<div class="news-box">
  <img src={item.image_link} class="item-photo" />
  <div class="news-content">
    <header class="outlet-header">
      <!-- <img src={item.outlet_logo} class="logo" /> -->
      <h3>{item.source}</h3>
    </header>
    <h2><a href={item.link}>{@html item.title}</a></h2>
    <footer>{item.authors}</footer>
    <p class="summary">
      {@html item.description}
    </p>
  </div>
</div>

<style>
  /* Container for the news item box */
  .news-box {
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin: 20px;
    background-color: #ffffff;
    display: flex;
    flex-direction: row;
    width: 70%;
    border: 1px solid #ddd;
  }

  /* Image of the item */
  .news-box img.item-photo {
    max-width: 800px;
    max-height: 200px;
    border-radius: 15px;
    height: auto;
    border-bottom: 1px solid #ddd;
  }

  /* Logo of the outlet */
  .news-box img.logo {
    width: 50px;
    height: auto;
    margin: 10px;
  }

  /* Container for the text content */
  .news-content {
    padding: 15px;
  }

  /* Headline of the item */
  .news-content h2 {
    font-size: 1.5em;
    margin: 10px 0;
    color: #333;
  }

  /* Summary of the item */
  .news-content p.summary {
    font-size: 1em;
    color: #666;
    margin: 10px 0;
  }

  /* Outlet logo and headline row */
  .outlet-header {
    display: flex;
    align-items: center;
  }

  /* Logo inside the headline row */
  .outlet-header img.logo {
    margin-right: 10px;
  }
</style>
