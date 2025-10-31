const fs = require('fs');
const path = require('path');
const { parseSearchHtml } = require('../../dist/nodes/MercadoPublico/htmlParser');

const examplePath = path.join(
	__dirname,
	'..',
	'..',
	'..',
	'MP-API',
	'MP API web public response example.md',
);
if (!fs.existsSync(examplePath)) {
	console.error('Example HTML file not found at', examplePath);
	process.exit(1);
}

const content = fs.readFileSync(examplePath, 'utf8');

// The example file may include markdown fences; try to extract the HTML snippet by looking for '<div' as anchor
const htmlStart = content.indexOf('<div');
const html = htmlStart >= 0 ? content.slice(htmlStart) : content;

const parsed = parseSearchHtml(html);
console.log('Parsed', parsed.length, 'items');
console.log(parsed.slice(0, 3));

process.exit(0);
