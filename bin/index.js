import dotenv from 'dotenv';
import {getPortfolio} from '../portfolio.js';

dotenv.config();

getPortfolio(process.env.AUTH_TOKEN, process.env.ACCOUNT).then(port => {
  port.positions.forEach(position => {
    if (!position) {
      return;
    }
    console.log(`${position.symbol}: ${position.equity} - ${position.percentage * 100}%`);
  });
}).catch(console.error);
