import fs from 'fs';
import compact from 'lodash.compact';
import TOML from '@iarna/toml';
import { ax, getPositions, getInstrument, getQuote, getAccount, getAccountPortfolio } from './api.js';

const categoriesToml = fs.readFileSync('categories.toml', 'utf8');
const categories = TOML.parse(categoriesToml);
const lifekitCategories = Object.keys(categories.lifekit).map(cat => {
  return {
    id: cat,
    ...categories.lifekit[cat]
  };
});

export function getPortfolio(authToken, accountNumber) {
  if (!authToken) {
    throw new Error('Auth token is needed. Please get it from robinhood.com');
  }
  ax.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  return Promise.all([getEquityPositions(),
    getAccountEquity(accountNumber)
  ]).then(([positions, portfolio]) => {
    let totalPortfolio = 0;
    let byCategories = lifekitCategories.reduce((byCats, cat) => {
      byCats[cat.id] = cat;
      // instantiate empty amount
      byCats[cat.id].total = 0;
      return byCats;
    }, {});
    return {
      positions: compact(positions).map(position => {
        position.percentage = position.equity / portfolio.marketValue
        totalPortfolio += position.equity;
        let symbolIsExplicitlyListed = false;
        lifekitCategories.forEach((cat) => {
          if (cat.symbols.includes(position.symbol)) {
            byCategories[cat.id].total += position.equity
            symbolIsExplicitlyListed = true;
          }
        });
        // default to US Stocks
        if (!symbolIsExplicitlyListed) {
          byCategories['us-stocks'].total += position.equity
        }
        return position;
      }),
      byCategories,
      totalPortfolio,
      ...portfolio
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

