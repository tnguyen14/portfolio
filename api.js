function getRobinhoodApi(uri) {
  return fetch(`https://api.robinhood.com/${uri}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`
    }
  }).then(response => response.json());
}

export function getPositions() {
  return getRobinhoodApi("positions/").then(resp => {
    if (!resp) {
      throw new Error("No positions data");
    }
    if (resp.previous) {
      console.log("positions previous: ", resp.previous);
    }
    if (resp.next) {
      console.log("positions next: ", resp.next);
    }
    return resp.results;
  });
}

// an instrument's tradability attribute can be:
// "tradable", "untradable", "position_closing_only"
export function getInstrument(instrument) {
  return getRobinhoodApi(`instruments/${instrument}/`);
}

// quote can throw error such as:
// {"missing_instruments":["SCTY"]}
// {"inactive_instruments":["QCP"]}
export function getQuote(quote) {
  return getRobinhoodApi(`quotes/${quote}/`);
}

export function getAccount(accountNumber) {
  return getRobinhoodApi(`accounts/${accountNumber}/`);
}

export function getAccountPortfolio(accountNumber) {
  return getRobinhoodApi(`accounts/${accountNumber}/portfolio`);
}
