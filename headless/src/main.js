
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

      const imageUrl =
        product.media?.mainMedia?.image?.url ||
        product.media?.mainMedia?.thumbnail?.url ||
        '';

      return `
        <article class="product">
          <div class="product-image">
            ${imageUrl
              ? `<img src="${escapeHTML(imageUrl)}"
                  alt="${escapeHTML(product.name || 'Product')}"
                  loading="lazy">`
              : '<div class="image-placeholder">IMAGE COMING SOON</div>'}
          </div>
          <div class="product-info">
            <h2>${escapeHTML(product.name || 'Product')}</h2>
            <p class="product-price">${escapeHTML(price)}</p>
          </div>
        </article>
      `;
    }).join('');

  } catch (error) {
    console.error('Wix Catalog V1 error:', error);
    status.textContent = 'Could not load products. Check Wix connection.';
  }
}

loadProducts();
