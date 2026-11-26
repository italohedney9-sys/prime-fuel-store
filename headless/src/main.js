
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

    if (!items.length) {
      status.textContent = 'No visible products found.';
      return;
    }

    status.textContent = `Loading ${items.length} products...`;

    const cards = await Promise.all(items.map(async product => {
      let details = product;

      try {
        const result = await wixClient.products.getProduct(
          product._id || product.id
        );

        details = result.product || result;
      } catch (error) {
        console.warn('Could not load product details:', product.name, error);
      }

      const price =
        details.priceData?.formatted?.price ??
        product.priceData?.formatted?.price ??
        (details.priceData?.price != null
          ? `${details.priceData.currency || 'USD'} ${details.priceData.price}`
          : '');

      const imageUrl =
        details.media?.mainMedia?.image?.url ||
        details.media?.mainMedia?.thumbnail?.url ||
        details.media?.items?.find(item => item.mediaType === 'image')?.image?.url ||
        details.media?.items?.find(item => item.mediaType === 'image')?.thumbnail?.url ||
        '';

      return `
        <article class="product">
          <div class="product-image">
            ${imageUrl
              ? `<img src="${escapeHTML(imageUrl)}"
                  alt="${escapeHTML(details.name || product.name || 'Product')}"
                  loading="lazy">`
              : '<div class="image-placeholder">IMAGE COMING SOON</div>'}
          </div>
          <div class="product-info">
            <h2>${escapeHTML(details.name || product.name || 'Product')}</h2>
            <p class="product-price">${escapeHTML(price)}</p>
          </div>
        </article>
      `;
    }));

    container.innerHTML = cards.join('');
    status.textContent = `${items.length} products found`;

  } catch (error) {
    console.error('Wix Catalog error:', error);
    status.textContent = 'Could not load products. Check Wix connection.';
  }
}

loadProducts();
