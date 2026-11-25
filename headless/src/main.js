
import './style.css';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

const clientId = import.meta.env.VITE_WIX_CLIENT_ID;

const app = document.querySelector('#app');

if (!clientId) {
  app.innerHTML = `
    <section class="status">
      <h1>Prime Fuel</h1>
      <p>Wix Client ID not configured.</p>
    </section>
  `;
} else {
  const wixClient = createClient({
    modules: { products },
    auth: OAuthStrategy({
      clientId
    })
  });

  app.innerHTML = `
    <section class="status">
      <p class="eyebrow">PRIME FUEL STORE</p>
      <h1>Built for your next level.</h1>
      <p>Wix Headless client initialized.</p>
      <p class="note">
        Store connection prepared. Product catalog loading will be
        configured in the next step.
      </p>
    </section>
  `;

  console.log('Prime Fuel Wix client initialized:', wixClient);
}

