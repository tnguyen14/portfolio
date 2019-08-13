import dotenv from "dotenv";
import { getPortfolio } from "./lib/portfolio.js";
import money from "@tridnguyen/usd-formatter";
import chalk from "chalk";
import Table from "cli-table";
import fetch from "node-fetch";

global.fetch = fetch;
const log = console.log;

dotenv.config();

const catsTable = new Table({
  head: ["Category", "Percentage (%)", "Target (%)", "Value"],
  style: {
    head: ["cyan"]
  }
});

if (!process.env.AUTH_TOKEN) {
  console.error("Auth token is needed. Please get it from robinhood.com");
  process.exit(1);
}

global.AUTH_TOKEN = process.env.AUTH_TOKEN;
global.BASE_URL = process.env.BASE_URL || "https://api.robinhood.com";

getPortfolio(process.env.ACCOUNT)
  .then(port => {
    if (!port) {
      console.error("Something went wrong in retrieving portfolio.");
      return;
    }
    port.positions.forEach(position => {
      // console.log(`${position.symbol}: ${money(position.equity)} - ${(position.percentage * 100).toFixed(2)}%`);
    });

    Object.keys(port.byCategories).forEach(catId => {
      const cat = port.byCategories[catId];
      const actualPercentage = cat.total / port.marketValue;
      const color = actualPercentage < cat.percentage ? "yellow" : "blue";
      catsTable.push([
        cat.name,
        chalk[color]((actualPercentage * 100).toFixed(2)),
        cat.percentage * 100,
        chalk.magenta(money(cat.total))
      ]);
    });
    log(catsTable.toString());
  })
  .catch(console.error);
