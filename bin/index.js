import dotenv from 'dotenv';
import {getAccountPortfolio} from '../portfolio.js';

dotenv.config();

getAccountPortfolio(process.env.AUTH_TOKEN).then(port => {
  port.forEach(position => {
    if (!position) {
      return;
    }
    console.log(`${position.symbol}: ${position.equity}`);
  });
}).catch(console.error);
