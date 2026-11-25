
import './style.css';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { productsV3 } from '@wix/stores';

const clientId = import.meta.env.VITE_WIX_CLIENT_ID;
const app = document.querySelector('#app');

const LIST_FIELDS = [
  'CURRENCY',
  'PLAIN_DESCRIPTION',
  'MIN_PRICE_VARIANT'
];

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
      modules: { productsV3 },
      auth: OAuthStrategy({ clientId })
    });

    const { items = [] } = await wixClient.productsV3
      .queryProducts({ fields: LIST_FIELDS })
      .limit(12)
      .find();

    status.textContent = `${items.length} products found`;

    if (!items.length) {
      container.textContent = 'No visible products found.';
      return;
    }

    container.innerHTML = items.map(product => {
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
    status.textContent =
      'Could not load products. Check the Wix connection.';
  }
}

loadProducts();
