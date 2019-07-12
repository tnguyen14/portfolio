import axios from 'axios';

const ax = axios.create({
  baseURL: 'https://api.robinhood.com',
});

export async function getAccountPortfolio(authToken) {
  if (!authToken) {
    throw new Error('Auth token is needed. Please get it from robinhood.com');
  }
  ax.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  return getPositions().then(positions => {
    return Promise.all(positions.map(position => {
      const positionQty = Number.parseInt(position.quantity);
      // skip over empty position
      if (positionQty == 0) {
        return;
      }
      return getInstrument(position.instrument).then(instrument => {
        return getQuote(instrument.quote).then(quote => {
          const extendHoursTradePrice = Number.parseFloat(quote.last_extended_hours_trade_price);
          return {
            symbol: quote.symbol,
            equity: positionQty * extendHoursTradePrice
          }
        }, err => {
          console.error('Unable to get quote for', instrument.name, instrument.symbol, position.quantity);
          console.error(err);
        })
      }, err => {
        console.error('Unable to get instrument for', position.url);
        console.error(err);
      });
    }));
  }).then(null, err => {
    if (err.response && err.response.data) {
      console.error(err.response.data);
    } else {
      console.error(err);
    }
  })
}

function getPositions() {
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
function getInstrument(instrumentUrl) {
  return ax.get(instrumentUrl).then(resp => {
    return resp.data;
  }, err => {
    if (err.response.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
  })
}

// quote can throw error such as:
// {"missing_instruments":["SCTY"]}
// {"inactive_instruments":["QCP"]}
function getQuote(quoteUrl) {
  return ax.get(quoteUrl).then(resp => {
    // console.log('QUOTE: ');
    // console.log(resp.data);
    return resp.data;
  }, err => {
    if (err.response.data) {
      throw new Error(JSON.stringify(err.response.data));
    }
  });
}
