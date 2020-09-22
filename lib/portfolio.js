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

export async function getPortfolio(accountNumber) {
  const [positions, portfolio] = await Promise.all([
    getEquityPositions(),
    getAccountEquity(accountNumber)
  ]);
  let byCategories = lifekitCategories.reduce((byCats, cat) => {
    byCats[cat.id] = cat;
    // instantiate empty amount
    byCats[cat.id].total = 0;
    byCats[cat.id].positions = [];
    return byCats;
  }, {});
  if (!positions) {
    return;
  }
  return {
    positions: positions
      .filter(p => p)
      .map(position => {
        if (!position.equity) {
          return position;
        }
        position.percentage = position.equity / portfolio.marketValue;
        let symbolIsExplicitlyListed = false;
        lifekitCategories.forEach(cat => {
          if (cat.symbols.includes(position.symbol)) {
            byCategories[cat.id].total += position.equity;
            byCategories[cat.id].positions.push(position);
            symbolIsExplicitlyListed = true;
          }
        });
        // default to US Stocks
        if (!symbolIsExplicitlyListed) {
          byCategories["us-stocks"].total += position.equity;
          byCategories["us-stocks"].positions.push(position);
        }
        return position;
      }),
    byCategories,
    ...portfolio
  };
}

async function getEquityPositions() {
  const positions = await getPositions();
  if (!positions) {
    return;
  }
  return await Promise.all(
    positions.map(async position => {
      const positionQty = Number.parseInt(position.quantity);
      // skip over empty position
      if (positionQty == 0) {
        return;
      }
      // instrument is a URL instead of an ID
      // https://api.robinhood.com/instruments/48bbe4a0-d167-4bfe-8d3b-494f9bb56350/
      const instrumentUrlParts = position.instrument.split("/");
      const instrumentId = instrumentUrlParts[instrumentUrlParts.length - 2];
      const instrument = await getInstrument(instrumentId);
      const quote = await getQuote(instrument.symbol);
      if (!quote) {
        console.error(
          `${instrument.symbol} has no quote, but has a position of ${positionQty}`
        );
        return {
          symbol: instrument.symbol
        };
      }
      const tradePrice = Number.parseFloat(
        quote.last_extended_hours_trade_price || quote.last_trade_price
      );
      return {
        symbol: quote.symbol,
        equity: positionQty * tradePrice,
        ...position
      };
    })
  );
}

async function getAccountEquity(accountNumber) {
  const [account, accountPortfolio] = await Promise.all([
    getAccount(accountNumber),
    getAccountPortfolio(accountNumber)
  ]);
  return {
    cash: account.cash,
    marketValue: accountPortfolio.extended_hours_market_value
  };
}
