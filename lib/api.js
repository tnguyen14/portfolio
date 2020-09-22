async function getRobinhoodApi(uri) {
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
      } else if (response.status >= 400) {
        console.error(resp);
        throw new Error(resp.message);
      } else {
        return resp;
      }
    });
  });
}

export async function getPositions() {
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
export async function getInstrument(instrument) {
  return getRobinhoodApi(`instruments/${instrument}/`);
}

// quote can throw error such as:
// {"missing_instruments":["SCTY"]}
// {"inactive_instruments":["QCP"]}
export async function getQuote(quote) {
  try {
    const resp = await getRobinhoodApi(`quotes/${quote}/`);
    return resp;
  } catch (e) {
    console.error(e);
    return;
  }
}

export async function getAccount(accountNumber) {
  return getRobinhoodApi(`accounts/${accountNumber}/`);
}

export async function getAccountPortfolio(accountNumber) {
  return getRobinhoodApi(`accounts/${accountNumber}/portfolio/`);
}
