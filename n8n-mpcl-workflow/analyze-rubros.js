const fs = require("fs");
const catalog = JSON.parse(
  fs.readFileSync("./n8n-mpcl/data/rubros.catalog.json", "utf8")
);

// Agrupar por primeros 2 dígitos
const groups = {};
catalog.forEach((r) => {
  const prefix = r.id.substring(0, 2);
  if (!groups[prefix]) {
    groups[prefix] = [];
  }
  groups[prefix].push(r);
});

// Ordenar
const sorted = Object.keys(groups).sort();

// Categorías ya cubiertas
const covered = [
  "81",
  "43",
  "82",
  "42",
  "51",
  "85",
  "93",
  "30",
  "72",
  "76",
  "78",
  "25",
  "24",
];

console.log("=== CATEGORÍAS PRINCIPALES DEL CATÁLOGO ===\n");
console.log("Ya cubiertas: " + covered.join(", ") + "\n");

sorted.forEach((prefix) => {
  const count = groups[prefix].length;
  const isCovered = covered.includes(prefix);
  const sample = groups[prefix]
    .slice(0, 3)
    .map((r) => r.text)
    .join(", ");
  const status = isCovered ? "✓" : " ";
  console.log(`${status} ${prefix}xx (${count} rubros): ${sample}...`);
});

console.log(`\n\nRESUMEN:`);
console.log(`- Total rubros: ${catalog.length}`);
console.log(`- Categorías totales: ${sorted.length}`);
console.log(`- Categorías cubiertas: ${covered.length}`);
console.log(`- Categorías sin cubrir: ${sorted.length - covered.length}`);
