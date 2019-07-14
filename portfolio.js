import { ax, getPositions, getInstrument, getQuote, getAccount, getAccountPortfolio } from './api.js';

import compact from 'lodash.compact';

export function getPortfolio(authToken, accountNumber) {
  if (!authToken) {
    throw new Error('Auth token is needed. Please get it from robinhood.com');
  }
  ax.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  return Promise.all([getEquityPositions(),
    getAccountEquity(accountNumber)
  ]).then(([positions, portfolio]) => {
    return {
      positions: compact(positions).map(position => {
        position.percentage = position.equity / portfolio.marketValue
        return position;
      }),
      portfolio
    }
  }).then(null, err => {
    if (err.response && err.response.data) {
      console.error(err.response.data);
    } else {
      console.error(err);
    }
  })
}

function getEquityPositions() {
  return getPositions().then(positions => {
    return Promise.all(positions.map(position => {
      const positionQty = Number.parseInt(position.quantity);
      // skip over empty position
      if (positionQty == 0) {
        return;
      }
      // instrument is a URL instead of an ID
      // https://api.robinhood.com/instruments/48bbe4a0-d167-4bfe-8d3b-494f9bb56350/
      const instrumentUrlParts = position.instrument.split('/');
      const instrumentId = instrumentUrlParts[instrumentUrlParts.length - 2];
      return getInstrument(instrumentId).then(instrument => {
        return getQuote(instrument.symbol).then(quote => {
          const tradePrice = Number.parseFloat(quote.last_extended_hours_trade_price || quote.last_trade_price);
          if (quote.symbol == 'PHK') {
            console.log(quote);
          }
          return {
            symbol: quote.symbol,
            equity: positionQty * tradePrice
          }
        })
      });
    }));
  });
}


function getAccountEquity(accountNumber) {
  return Promise.all([
    getAccount(accountNumber),
    getAccountPortfolio(accountNumber)
  ]).then(([account, accountPortfolio]) => {
    return {
      cash: account.cash,
      marketValue: accountPortfolio.extended_hours_market_value
    }
  })
}

