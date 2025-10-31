#!/usr/bin/env node
/**
 * Harvest additional Rubros from the public Mercado Público autocomplete endpoint.
 *
 * Strategy (Light mode ~ <=150 requests):
 *  - Use a curated list of common Spanish syllables / domain fragments (≥3 chars each) likely to surface diverse Rubros.
 *  - For each seed, query: https://www.mercadopublico.cl/BuscarLicitacion/Home/BuscarRubros?q=<seed>&page=1
 *  - Aggregate unique { id, text } pairs.
 *  - Merge with existing local catalog (data/rubros.catalog.json).
 *  - Output a sorted (by text, then id) deduplicated JSON back to the same file.
 *
 * Notes:
 *  - Endpoint returns JSON array directly.
 *  - 3 chars minimum needed for richer results.
 *  - Light delay between requests to avoid aggressive hammering.
 */

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'data', 'rubros.catalog.json');
const OUTPUT_PATH = CATALOG_PATH;

const ENDPOINT = 'https://www.mercadopublico.cl/BuscarLicitacion/Home/BuscarRubros';
const PAGE = 1;
const DELAY_MS = 250; // polite pacing
const HARD_CAP_REQUESTS = 3000; // increased to allow base seeds + all 2-letter combos + curated 4-char Spanish stems
const DONE_PATH = path.join(__dirname, '..', 'data', 'rubros.harvest.done.json'); // tracks processed seeds

let seeds = [
	// Core domain / generic
	'med',
	'cli',
	'hos',
	'amb',
	'san',
	'sal',
	'pro',
	'sup',
	'ins',
	'seg',
	'ase',
	'tec',
	'inf',
	'log',
	'tra',
	'con',
	'constr',
	'ind',
	'agr',
	'agu',
	'ali',
	'alj',
	'alm',
	'env',
	'mat',
	'matr',
	'maq',
	'mec',
	'met',
	'min',
	'ele',
	'elec',
	'ene',
	'ener',
	'gas',
	'pet',
	'pla',
	'plas',
	'pap',
	'papel',
	'qui',
	'quim',
	'lab',
	'equip',
	'herr',
	'herram',
	'serv',
	'servi',
	'sist',
	'soft',
	'hard',
	'comp',
	'compu',
	'datos',
	'data',
	'red',
	'movi',
	'trans',
	'transp',
	'transf',
	'carg',
	'cargu',
	'auto',
	'aut',
	'veh',
	'repu',
	'moto',
	'limp',
	'hig',
	'aseo',
	'gest',
	'gesti',
	'admi',
	'admin',
	'obra',
	'obras',
	'urb',
	'civi',
	'civ',
	'edif',
	'educ',
	'univ',
	'esc',
	'escol',
	'did',
	'depo',
	'depor',
	'deport',
	'segur',
	'alarm',
	'ilum',
	'energ',
	'solar',
	'term',
	'hosp',
	'odont',
	'dental',
	'fabr',
	'muebl',
	'mueb',
	'hab',
	'vest',
	'text',
	'ropa',
	'vestu',
	'calz',
	'calc',
	'aliment',
	'carn',
	'pesc',
	'frut',
	'verd',
	'lact',
	'leche',
	'pan',
	'har',
	'gran',
	'agro',
	'forest',
	'mader',
	'muebler',
	'jardi',
	'jard',
	'pais',
	'limpia',
	'aseps',
	'ester',
	'ster',
	'farm',
	'medic',
	'medicame',
	'veter',
	'veteri',
	'anal',
	'anali',
	'biol',
	'bio',
	'geno',
	'labora',
	// Additional combos to widen coverage
	'acero',
	'acces',
	'accesor',
	'audio',
	'video',
	'optic',
	'optic',
	'bibl',
	'arch',
	'ofic',
	'ofi',
	'imp',
	'impre',
	'print',
	'cart',
	'cartu',
	'segm',
	'monitor',
	'control',
	'gesti',
	'gestor',
	'docu',
	'archivo',
	'sello',
	'embal',
	'empa',
	'etiqu',
	'etq',
	'fumig',
	'plag',
	'resid',
	'recicl',
	'limpi',
	'aseo',
	'higie',
	'ambient',
	'sane',
	'trat',
	'purif',
	'filtr',
	'mante',
	'mant',
	'repar',
	'repuesto',
	'refri',
	'clima',
	'calef',
	'calor',
	'frio',
	'frío',
	'frigor',
	'pint',
	'pintu',
	'pintur',
	'barn',
	'ades',
	'adh',
	'peg',
	'sold',
	'solda',
	'torn',
	'herra',
	'cable',
	'cabl',
	'fibra',
	'bols',
	'envase',
	'envas',
	'bote',
	'barc',
	'naval',
	'port',
	'puert',
	'mar',
	'pesca',
	'acuic',
	'acuicult',
	'hidra',
	'hidrau',
	'hidro',
	'hidrol',
	'tele',
	'teleco',
	'telecom',
	'radio',
	'radar',
	'sat',
	'satel',
	'geo',
	'geolo',
	'topo',
	'topogr',
	'carto',
	'mapa',
	'señal',
	'senal',
	// Some numeric-like patterns (if exists)
	'100',
	'200',
	'300',
	'400',
	'500',
	'600',
	'700',
	'800',
	'900',
];

// Expansion: add all 2-letter (aa..zz) combos as requested (total 26*26 = 676)
// NOTE: Endpoint historically yields richer results with >=3 chars; 2-char queries may return fewer.
// Still we include them to attempt broader coverage. They count toward HARD_CAP_REQUESTS.
const alpha = 'abcdefghijklmnopqrstuvwxyz';
const twoLetterCombos = [];
for (const a of alpha) {
	for (const b of alpha) {
		twoLetterCombos.push(a + b);
	}
}
// Merge while avoiding duplicates present in initial seed list.
const seedSet = new Set(seeds);
for (const combo of twoLetterCombos) {
	if (!seedSet.has(combo)) seedSet.add(combo);
}
seeds = Array.from(seedSet);

// Add curated 4-character Spanish stems (common starts) to broaden semantic coverage.
// Chosen to reflect frequent domain nouns/adjectives in procurement contexts.
// Avoid exhaustive brute force to stay performant; adjust list as needed.
const fourCharStems = [
	'acad',
	'acci',
	'acto',
	'admi',
	'agri',
	'agre',
	'agua',
	'alca',
	'alum',
	'ambi',
	'amar',
	'anal',
	'ante',
	'apli',
	'arma',
	'armat',
	'arti',
	'asfa',
	'ases',
	'asig',
	'asoc',
	'atra',
	'auto',
	'avac',
	'avian',
	'barr',
	'base',
	'bibli',
	'biol',
	'biom',
	'cabl',
	'cafe',
	'calc',
	'cali',
	'cama',
	'cami',
	'camp',
	'capa',
	'capi',
	'carg',
	'carn',
	'cart',
	'cata',
	'cauc',
	'caut',
	'cerv',
	'cert',
	'cian',
	'ciba',
	'cicl',
	'cien',
	'cine',
	'circ',
	'civi',
	'clim',
	'clor',
	'coal',
	'cobr',
	'coci',
	'cohe',
	'cola',
	'colc',
	'cole',
	'colu',
	'comb',
	'comi',
	'comp',
	'comu',
	'conc',
	'cond',
	'cone',
	'conf',
	'cons',
	'cont',
	'conv',
	'corr',
	'cort',
	'cosm',
	'cria',
	'crit',
	'crom',
	'cult',
	'cumi',
	'curs',
	'dato',
	'depo',
	'depr',
	'deri',
	'desi',
	'deta',
	'dibu',
	'digi',
	'dina',
	'docu',
	'doma',
	'dren',
	'edif',
	'educ',
	'elec',
	'elev',
	'elab',
	'emba',
	'embr',
	'empa',
	'empl',
	'enfe',
	'ener',
	'envi',
	'epid',
	'equp',
	'escn',
	'esco',
	'escr',
	'escu',
	'espe',
	'espi',
	'esta',
	'estd',
	'este',
	'estor',
	'estr',
	'eval',
	'evac',
	'evap',
	'expe',
	'expl',
	'extr',
	'fabr',
	'farm',
	'ferr',
	'fibr',
	'filt',
	'fisi',
	'fito',
	'flet',
	'flex',
	'flot',
	'fluo',
	'form',
	'foto',
	'fran',
	'frio',
	'func',
	'fund',
	'gali',
	'gama',
	'gana',
	'gasl',
	'gest',
	'gine',
	'grad',
	'gran',
	'grua',
	'guard',
	'herra',
	'hidn',
	'hido',
	'hidr',
	'higi',
	'hosp',
	'huel',
	'ilum',
	'impl',
	'impr',
	'incu',
	'indm',
	'indr',
	'indu',
	'info',
	'inoc',
	'inst',
	'insu',
	'insu',
	'inte',
	'iso9',
	'jard',
	'jurid',
	'labm',
	'labo',
	'lect',
	'lego',
	'lija',
	'limp',
	'lina',
	'ling',
	'liqf',
	'lito',
	'lona',
	'madr',
	'mags',
	'mang',
	'mane',
	'mani',
	'manten',
	'maqu',
	'marc',
	'mari',
	'mate',
	'medi',
	'medc',
	'medp',
	'merm',
	'meti',
	'micro',
	'minp',
	'minr',
	'mobi',
	'mold',
	'mone',
	'moni',
	'mont',
	'moto',
	'mueb',
	'muest',
	'multi',
	'neon',
	'neum',
	'nutr',
	'obras',
	'odont',
	'ofic',
	'ofta',
	'oper',
	'orga',
	'paga',
	'pale',
	'pali',
	'pano',
	'pant',
	'parr',
	'pedi',
	'pelo',
	'pesa',
	'pest',
	'petq',
	'pint',
	'pisc',
	'plan',
	'plas',
	'plom',
	'pneu',
	'poda',
	'pozo',
	'prac',
	'pres',
	'prev',
	'proc',
	'prod',
	'prof',
	'prog',
	'proj',
	'prop',
	'prot',
	'prov',
	'psic',
	'psiq',
	'puer',
	'pulm',
	'quim',
	'radi',
	'rady',
	'ramp',
	'reac',
	'reca',
	'recl',
	'reco',
	'recu',
	'refr',
	'regu',
	'rehab',
	'relo',
	'remol',
	'remo',
	'repa',
	'repo',
	'repr',
	'resc',
	'resf',
	'resp',
	'rest',
	'retf',
	'reti',
	'reus',
	'revi',
	'rieg',
	'roci',
	'rota',
	'sala',
	'sale',
	'sane',
	'seco',
	'segu',
	'sele',
	'sell',
	'semc',
	'semi',
	'sens',
	'sepa',
	'serv',
	'sesi',
	'sill',
	'sist',
	'sold',
	'solu',
	'sono',
	'sube',
	'subs',
	'sucu',
	'surg',
	'surt',
	'tala',
	'tall',
	'tapa',
	'tela',
	'tele',
	'term',
	'text',
	'ther',
	'toma',
	'torn',
	'tort',
	'trab',
	'trat',
	'tres',
	'tric',
	'trio',
	'tubo',
	'unic',
	'urba',
	'urba',
	'usos',
	'vacn',
	'vaci',
	'valv',
	'vent',
	'veri',
	'vest',
	'veter',
	'vibr',
	'vidr',
	'vigi',
	'vinc',
	'viny',
	'vivi',
	'volq',
	'vuel',
	'yoga',
	'zinc',
];
for (const stem of fourCharStems) {
	if (!seedSet.has(stem)) seedSet.add(stem);
}
seeds = Array.from(seedSet);

/**
 * Build unique seed list (includes 2-char combos per user request) then
 * load previously processed seeds so we can skip them on subsequent runs.
 */
// Deduplicate seeds & enforce length >=3
let uniqueSeeds = Array.from(new Set(seeds.map((s) => s.trim())));

// If seed length < 3, we still keep it (user explicitly requested 2-letter coverage). However, to respect
// endpoint minimum effectiveness, we will later attempt direct fetch; if it yields zero items quickly,
// the cost is minimal. (We no longer filter by length here.)
uniqueSeeds = uniqueSeeds.filter((s) => s.length >= 2);

// Load already processed seeds (if any) to skip
let doneSet = new Set();
try {
	if (fs.existsSync(DONE_PATH)) {
		const doneRaw = fs.readFileSync(DONE_PATH, 'utf-8');
		const arr = JSON.parse(doneRaw);
		if (Array.isArray(arr)) {
			doneSet = new Set(arr.map((s) => String(s)));
		}
	}
} catch {
	// ignore parse errors; start fresh
}

if (doneSet.size) {
	const before = uniqueSeeds.length;
	uniqueSeeds = uniqueSeeds.filter((s) => !doneSet.has(s));
	const skipped = before - uniqueSeeds.length;
	if (skipped > 0) {
		console.log(
			`[harvest] Skipping ${skipped} seeds already processed (remaining ${uniqueSeeds.length}).`,
		);
	}
}

// If seed length < 3, we still keep it (user explicitly requested 2-letter coverage). However, to respect
// endpoint minimum effectiveness, we will later attempt direct fetch; if it yields zero items quickly,
// the cost is minimal. (We no longer filter by length here.)
uniqueSeeds = uniqueSeeds.filter((s) => s.length >= 2);

if (uniqueSeeds.length > HARD_CAP_REQUESTS) {
	uniqueSeeds.length = HARD_CAP_REQUESTS;
}

async function delay(ms) {
	return new Promise((res) => setTimeout(res, ms));
}

async function fetchRubros(term) {
	const url = new URL(ENDPOINT);
	url.searchParams.set('q', term);
	url.searchParams.set('page', String(PAGE));
	const res = await fetch(url.toString(), {
		headers: {
			Accept: 'application/json, text/javascript, */*; q=0.01',
			'X-Requested-With': 'XMLHttpRequest',
			'User-Agent': 'rubros-harvester-script',
		},
	});
	if (!res.ok) {
		console.error(`WARN: ${term} -> HTTP ${res.status}`);
		return [];
	}
	try {
		const data = await res.json();
		if (Array.isArray(data)) return data;
		if (Array.isArray(data.results)) return data.results;
		return [];
	} catch (e) {
		console.error(`WARN: ${term} -> JSON parse fail`);
		return [];
	}
}

function loadExisting() {
	if (!fs.existsSync(CATALOG_PATH)) return [];
	try {
		const raw = fs.readFileSync(CATALOG_PATH, 'utf-8');
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed;
		return [];
	} catch {
		return [];
	}
}

function normalizeEntry(e) {
	return {
		id: String(e.id).trim(),
		text: String(e.text || e.descripcion || '').trim(),
	};
}

(async () => {
	console.log(`Seeds to process: ${uniqueSeeds.length}`);
	const existing = loadExisting();
	const map = new Map();
	for (const e of existing) {
		if (e && e.id && e.text) {
			map.set(e.id, { id: e.id, text: e.text });
		}
	}

	let processed = 0;
	for (const seed of uniqueSeeds) {
		processed++;
		if (doneSet.has(seed)) {
			// Should not happen (filtered earlier) but guard anyway
			continue;
		}
		process.stdout.write(`[${processed}/${uniqueSeeds.length}] ${seed} ... `);
		try {
			const results = await fetchRubros(seed);
			let addedThisSeed = 0;
			for (const r of results) {
				const norm = normalizeEntry(r);
				if (norm.id && norm.text && !map.has(norm.id)) {
					map.set(norm.id, norm);
					addedThisSeed++;
				}
			}
			console.log(`+${addedThisSeed} (total ${map.size})`);
		} catch (err) {
			console.log(`ERR`);
		}
		// Persist processed seed (append semantics via full rewrite to keep it simple)
		doneSet.add(seed);
		try {
			fs.writeFileSync(DONE_PATH, JSON.stringify([...doneSet], null, 2) + '\n');
		} catch {
			// ignore write errors
		}
		await delay(DELAY_MS);
	}

	// Sort by text then id (locale-insensitive)
	const final = Array.from(map.values()).sort((a, b) => {
		const tx = a.text.localeCompare(b.text, 'es', { sensitivity: 'base' });
		if (tx !== 0) return tx;
		return a.id.localeCompare(b.id);
	});

	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(final, null, 2) + '\n');
	console.log(`Done. Final unique entries: ${final.length}`);
	console.log(`Updated catalog written to: ${OUTPUT_PATH}`);
})().catch((e) => {
	console.error('Fatal error:', e);
	process.exit(1);
});
