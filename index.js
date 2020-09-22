import { getPortfolio } from "./lib/portfolio.js";
import money from "https://cdn.skypack.dev/@tridnguyen/money@1.5.8";
import { html } from "https://cdn.skypack.dev/lighterhtml@^2.0.9";

window.BASE_URL =
  "https://us-central1-build-tridnguyen-com.cloudfunctions.net/robinhoodProxy";

const authTokenField = document.querySelector("[name=auth-token]");
const accountField = document.querySelector("[name=account]");
const submitButton = document.querySelector("[type=submit]");
const tbody = document.querySelector(".portfolio tbody");

let authToken = localStorage.getItem("auth_token");
if (authToken) {
  authTokenField.value = authToken;
  window.AUTH_TOKEN = authToken;
}
let account = localStorage.getItem("account");
if (account) {
  accountField.value = account;
}

function displayPortfolio(port) {
  Object.keys(port.byCategories).forEach(catId => {
    const cat = port.byCategories[catId];
    const actualPercentage = cat.total / port.marketValue;
    tbody.appendChild(html.node`
      <tr>
        <td data-tooltip="${cat.symbols.join(", ")}">${cat.name}</td>
        <td
          data-threshold="${
            actualPercentage < cat.percentage ? "not-satisfied" : "satisfied"
          }"
        >
          ${(actualPercentage * 100).toFixed(2)}
        </td>
        <td>${cat.percentage * 100}</td>
        <td>${money.usd(cat.total * 100)}</td>
      </tr>
    `);
  });
}

function main() {
  if (!account) {
    throw new Error("account is not defined");
  }
  if (!window.AUTH_TOKEN) {
    throw new Error("auth token is not defined");
  }

  submitButton.disabled = true;
  // reset table
  while (tbody.firstChild) {
    tbody.firstChild.remove();
  }

  getPortfolio(account)
    .then(displayPortfolio, err => {
      if (err.message == "Incorrect authentication credentials.") {
        // if incorrect auth, delete stored auth token
        localStorage.removeItem("auth_token");
        authTokenField.value = "";
      } else {
        console.error(err);
      }
    })
    .then(() => {
      submitButton.disabled = false;
    });
}

submitButton.addEventListener("click", e => {
  e.preventDefault();
  if (accountField.value && accountField.value != account) {
    account = accountField.value;
    localStorage.setItem("account", account);
  }
  if (authTokenField.value && authTokenField.value != window.AUTH_TOKEN) {
    window.AUTH_TOKEN = authTokenField.value;
    localStorage.setItem("auth_token", window.AUTH_TOKEN);
  }
  main();
});

main();
