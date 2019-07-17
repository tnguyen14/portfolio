// convert categories.toml to categories.json for use in browser
import fs from "fs";
import TOML from "@iarna/toml";

const categoriesToml = fs.readFileSync("categories.toml", "utf8");
const categories = TOML.parse(categoriesToml);

fs.writeFileSync("categories.json", JSON.stringify(categories, null, 2));
