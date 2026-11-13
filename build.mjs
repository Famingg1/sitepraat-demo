// Bouwt de site uit content/*.json en src/template.html naar dist/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";

const site = JSON.parse(readFileSync("content/site.json", "utf8"));
const prijzen = JSON.parse(readFileSync("content/prijzen.json", "utf8"));
const voorwaarden = JSON.parse(readFileSync("content/voorwaarden.json", "utf8"));
const template = readFileSync("src/template.html", "utf8");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const page = (titel, inhoud) =>
  template.replace(/{{titel}}/g, esc(titel)).replace(/{{naam}}/g, esc(site.naam)).replace(/{{adres}}/g, esc(site.adres))
    .replace(/{{telefoon}}/g, esc(site.telefoon)).replace("{{inhoud}}", inhoud);

const tijden = site.openingstijden.map((o) => `<tr><td>${esc(o.dag)}</td><td>${esc(o.tijd)}</td></tr>`).join("");
const pages = {
  "index.html": page("Home", `<h1>${esc(site.naam)}</h1><p class="slogan">${esc(site.slogan)}</p><h2>Openingstijden</h2><table>${tijden}</table>`),
  "prijzen.html": page(prijzen.titel, `<h1>${esc(prijzen.titel)}</h1><table>${prijzen.items.map((i) => `<tr><td>${esc(i.naam)}</td><td>${esc(i.prijs)}</td></tr>`).join("")}</table>`),
  "voorwaarden.html": page(voorwaarden.titel, `<h1>${esc(voorwaarden.titel)}</h1>${voorwaarden.artikelen.map((a) => `<h2>${esc(a.titel)}</h2><p>${esc(a.tekst)}</p>`).join("")}`),
  "404.html": page("Niet gevonden", `<h1>Deze pagina bestaat niet</h1><p><a href="/">Naar de homepage</a></p>`),
};

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
for (const [file, html] of Object.entries(pages)) writeFileSync(`dist/${file}`, html);
copyFileSync("src/style.css", "dist/style.css");
console.log(`Gebouwd: ${Object.keys(pages).length} pagina's`);
