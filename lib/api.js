const BASE_URL = "https://lists.cloud.tridnguyen.com";

async function getRobinhoodApi(uri) {
  const resp = await fetch(`${BASE_URL}/robinhood/${uri}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`
    }
  });
  return resp.json();
}

export async function getPositions() {
  return await getRobinhoodApi("positions/items");
}
// an instrument's tradability attribute can be:
// "tradable", "untradable", "position_closing_only"
export async function getInstrument(instrument) {
  return await getRobinhoodApi(`instruments/items/${instrument}`);
}

// quote can throw error such as:
// {"missing_instruments":["SCTY"]}
// {"inactive_instruments":["QCP"]}
export async function getQuote(quote) {
  return await getRobinhoodApi(`quotes/items/${quote}`);
}

export async function getAccount() {
  return await getRobinhoodApi(`account`);
}

export async function getOrders(instrument) {
  return await getRobinhoodApi(
    `orders/items?instrument=${encodeURIComponent(instrument)}`
  );
}
