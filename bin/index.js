import dotenv from 'dotenv';
import {getPortfolio} from '../portfolio.js';
import money from '@tridnguyen/usd-formatter';

dotenv.config();

getPortfolio(process.env.AUTH_TOKEN, process.env.ACCOUNT).then(port => {
  port.positions.forEach(position => {
    if (!position) {
      return;
    }
    console.log(`${position.symbol}: ${money(position.equity)} - ${(position.percentage * 100).toFixed(2)}%`);
  });
}).catch(console.error);
