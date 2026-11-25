
import './style.css';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { productsV3 } from '@wix/stores';

const clientId = import.meta.env.VITE_WIX_CLIENT_ID;
const app = document.querySelector('#app');

app.innerHTML = `
  <section class="status">
    <p class="eyebrow">PRIME FUEL STORE</p>
    <h1>Built for your next level.</h1>
    <p id="catalog-status">Connecting to the store...</p>
    <div id="products"></div>
  </section>
`;

async function loadProducts() {
  if (!clientId) {
    document.querySelector('#catalog-status').textContent =
      'Wix Client ID not configured.';
    return;
  }

  try {
    const wixClient = createClient({
      modules: { productsV3 },
      auth: OAuthStrategy({ clientId })
    });

    const result = await wixClient.productsV3
      .queryProducts({
        filter: { visible: { $eq: true } }
      })
      .limit(12)
      .find();

    const products = result.items || [];

    document.querySelector('#catalog-status').textContent =
      `${products.length} products found`;

    const container = document.querySelector('#products');

    if (!products.length) {
      container.textContent = 'No visible products found.';
      return;
    }

    container.innerHTML = products.map(product => {
      const price =
        product.actualPriceRange?.minValue?.formattedAmount || '';

      return `
        <article class="product">
          <h2>${escapeHTML(product.name || 'Product')}</h2>
          <p>${escapeHTML(price)}</p>
        </article>
      `;
    }).join('');

  } catch (error) {
    console.error('Wix catalog error:', error);
    document.querySelector('#catalog-status').textContent =
      'Could not load products. Check the Wix connection.';
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

loadProducts();
