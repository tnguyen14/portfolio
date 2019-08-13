function getRobinhoodApi(uri) {
  return fetch(`${BASE_URL}/${uri}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`
    }
  }).then(response => {
    return response.json().then(resp => {
      // 401 responses have this body
      // {"detail":"Incorrect authentication credentials."}
      if (response.status == 401) {
        throw new Error(resp.detail);
      } else {
        return resp;
      }
    });
  });
}

export function getPositions() {
  return getRobinhoodApi("positions/").then(resp => {
    if (!resp || !resp.results) {
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
  return getRobinhoodApi(`accounts/${accountNumber}/portfolio/`);
}
