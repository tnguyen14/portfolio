import dotenv from "dotenv";
import { getPortfolio } from "../portfolio.js";
import money from "@tridnguyen/usd-formatter";
import chalk from "chalk";
import Table from "cli-table";

const log = console.log;

dotenv.config();

const catsTable = new Table({
  head: ["Category", "Percentage (%)", "Target (%)", "Value"],
  style: {
    head: ["cyan"]
  }
});

getPortfolio(process.env.AUTH_TOKEN, process.env.ACCOUNT)
  .then(port => {
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
