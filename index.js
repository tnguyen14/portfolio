import { getPortfolio } from "./lib/portfolio.js";
import money from "https://cdn.skypack.dev/@tridnguyen/money@1.5.11";
import { html } from "https://cdn.skypack.dev/lighterhtml@^2.0.9";
import {
  getSession,
  deleteSession,
  createAuth
} from "https://cdn.skypack.dev/@tridnguyen/auth@5.4.2";

const auth = createAuth();

const analyzeButton = document.querySelector(".actions button");
const tbody = document.querySelector(".portfolio tbody");

function displayPortfolio(port) {
  Object.keys(port.byCategories).forEach(catId => {
    const cat = port.byCategories[catId];
    const actualPercentage = cat.total / port.marketValue;
    tbody.appendChild(html.node`
      <tr>
        <td data-tooltip="${cat.symbols.join(", ")}">
          <details>
            <summary>${cat.name}</summary>
            <ul>
              ${cat.positions.map(
                position => html.node`
              <li>${position.symbol}</li>
              `
              )}
            </ul>
        </td>
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

document.querySelector(".auth .login").addEventListener("click", e => {
  auth.silentAuth();
});

document.querySelector(".auth .logout").addEventListener("click", e => {
  deleteSession();
  // TODO refresh
});

auth.handleCallback(err => {
  if (err) {
    console.error(err);
    return;
  } else {
    main();
  }
});

async function main() {
  const session = getSession();
  const authEl = document.querySelector(".auth");

  if (!session) {
    authEl.classList.remove("logged-in");
  } else {
    authEl.classList.add("logged-in");
    window.AUTH_TOKEN = session.idToken;
  }

  analyzeButton.disabled = true;
  // reset table
  while (tbody.firstChild) {
    tbody.firstChild.remove();
  }
  tbody.appendChild(html.node`
    <tr><td colspan="4">Loading...</td></tr>
  `);

  try {
    const portfolio = await getPortfolio();
    displayPortfolio(portfolio);
    tbody.firstChild.remove();
  } catch (err) {
    console.error(err);
  }
  analyzeButton.disabled = false;
}

analyzeButton.addEventListener("click", e => {
  e.preventDefault();
  main();
});
