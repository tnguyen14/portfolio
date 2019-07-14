import axios from 'axios';

export const ax = axios.create({
  baseURL: 'https://api.robinhood.com'
});

export function getPositions() {
  return ax.get('positions/').then(resp => {
    if (!resp.data) {
      throw new Error('No positions data');
    }
    if (resp.data.previous) {
      console.log('positions previous: ', resp.data.previous);
    }
    if (resp.data.next) {
      console.log('positions next: ', resp.data.next);
    }
    return resp.data.results;
  })
}

// an instrument's tradability attribute can be:
// "tradable", "untradable", "position_closing_only"
export function getInstrument(instrument) {
  return ax.get(`instruments/${instrument}/`).then(resp => {
    return resp.data;
  })
}

// quote can throw error such as:
// {"missing_instruments":["SCTY"]}
// {"inactive_instruments":["QCP"]}
export function getQuote(quote) {
  return ax.get(`quotes/${quote}/`).then(resp => {
    return resp.data;
  });
}

export function getAccount(accountNumber) {
  return ax.get(`accounts/${accountNumber}/`).then(resp => resp.data);
}

export function getAccountPortfolio(accountNumber) {
  return ax.get(`accounts/${accountNumber}/portfolio`).then(resp => resp.data);
}
