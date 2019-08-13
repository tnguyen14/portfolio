import {
  getPositions,
  getInstrument,
  getQuote,
  getAccount,
  getAccountPortfolio
} from "./api.js";

import categories from "../categories.js";

const lifekitCategories = Object.keys(categories.lifekit).map(cat => {
  return {
    id: cat,
    ...categories.lifekit[cat]
  };
});

export function getPortfolio(accountNumber) {
  return Promise.all([getEquityPositions(), getAccountEquity(accountNumber)])
    .then(([positions, portfolio]) => {
      let byCategories = lifekitCategories.reduce((byCats, cat) => {
        byCats[cat.id] = cat;
        // instantiate empty amount
        byCats[cat.id].total = 0;
        return byCats;
      }, {});
      if (!positions) {
        return;
      }
      return {
        positions: positions
          .filter(p => p)
          .map(position => {
            position.percentage = position.equity / portfolio.marketValue;
            let symbolIsExplicitlyListed = false;
            lifekitCategories.forEach(cat => {
              if (cat.symbols.includes(position.symbol)) {
                byCategories[cat.id].total += position.equity;
                symbolIsExplicitlyListed = true;
              }
            });
            // default to US Stocks
            if (!symbolIsExplicitlyListed) {
              byCategories["us-stocks"].total += position.equity;
            }
            return position;
          }),
        byCategories,
        ...portfolio
      };
    })
    .then(null, err => {
      if (err.response && err.response.data) {
        console.error(err.response.data);
      }
      throw err;
    });
}

function getEquityPositions() {
  return getPositions().then(positions => {
    if (!positions) {
      return;
    }
    return Promise.all(
      positions.map(position => {
        const positionQty = Number.parseInt(position.quantity);
        // skip over empty position
        if (positionQty == 0) {
          return;
        }
        // instrument is a URL instead of an ID
        // https://api.robinhood.com/instruments/48bbe4a0-d167-4bfe-8d3b-494f9bb56350/
        const instrumentUrlParts = position.instrument.split("/");
        const instrumentId = instrumentUrlParts[instrumentUrlParts.length - 2];
        return getInstrument(instrumentId).then(instrument => {
          return getQuote(instrument.symbol).then(quote => {
            const tradePrice = Number.parseFloat(
              quote.last_extended_hours_trade_price || quote.last_trade_price
            );
            return {
              symbol: quote.symbol,
              equity: positionQty * tradePrice
            };
          });
        });
      })
    );
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
    };
  });
}
