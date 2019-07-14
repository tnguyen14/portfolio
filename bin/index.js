import dotenv from 'dotenv';
import {getPortfolio} from '../portfolio.js';
import money from '@tridnguyen/usd-formatter';

dotenv.config();

getPortfolio(process.env.AUTH_TOKEN, process.env.ACCOUNT).then(port => {
  console.log(`total: ${money(port.totalPortfolio)}`);
  console.log(`marketValue: ${money(port.marketValue)}`);
  port.positions.forEach(position => {
    // console.log(`${position.symbol}: ${money(position.equity)} - ${(position.percentage * 100).toFixed(2)}%`);
  });

  Object.keys(port.byCategories).forEach(catId => {
    const cat = port.byCategories[catId];
    console.log(`${cat.name}: ${money(cat.total)} (${(cat.total * 100 / port.marketValue).toFixed(2)}%)`);
  })
}).catch(console.error);
