
import './style.css';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

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

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

async function loadProducts() {
  const status = document.querySelector('#catalog-status');
  const container = document.querySelector('#products');

  if (!clientId) {
    status.textContent = 'Wix Client ID not configured.';
    return;
  }

  try {
    const wixClient = createClient({
      modules: { products },
      auth: OAuthStrategy({ clientId })
    });

    const response = await wixClient.products.queryProducts({
      query: {
        paging: {
          limit: 12,
          offset: 0
        }
      }
    });

    const items = response.products || [];
    status.textContent = `${items.length} products found`;

    if (!items.length) {
      container.textContent = 'No visible products found.';
      return;
    }

    container.innerHTML = items.map(product => {
      const price =
        product.priceData?.formatted?.price ??
        (product.priceData?.price != null
          ? `${product.priceData.currency || 'USD'} ${product.priceData.price}`
          : '');

      return `
        <article class="product">
          <h2>${escapeHTML(product.name || 'Product')}</h2>
          <p>${escapeHTML(price)}</p>
        </article>
      `;
    }).join('');

  } catch (error) {
    console.error('Wix Catalog V1 error:', error);
    status.textContent =
      'Could not load products. Check the Wix Catalog V1 connection and app permissions.';
  }
}

loadProducts();

