import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { parseSearchHtml } from './htmlParser'; // parser available for execute() implementation
import rubrosCatalog from '../../data/rubros.catalog.json';

// Node 18+ provides global fetch at runtime. Declare for TypeScript.
declare const fetch: any;

export class MercadoPublico implements INodeType {
methods = {
loadOptions: {
async getRubros(this: any, filter?: string): Promise<any[]> {
if (!filter || filter.trim().length < 3) {
return [];
}
let responseData: any;
try {
responseData = await this.helpers.httpRequest({
method: 'GET',
url: 'https://www.mercadopublico.cl/BuscarLicitacion/Home/BuscarRubros',
qs: { q: filter.trim(), page: 1 },
headers: {
Accept: 'application/json, text/javascript, */*; q=0.01',
'X-Requested-With': 'XMLHttpRequest',
Referer: 'https://www.mercadopublico.cl/Home/BusquedaLicitacion',
'User-Agent': 'n8n-node/mercado-publico',
},
json: true,
timeout: 10000,
ignoreHttpStatusErrors: true,
});
} catch (e) {
// Fallback to fetch if helper fails (some n8n versions have quirks with qs)
try {
const u = new URL('https://www.mercadopublico.cl/BuscarLicitacion/Home/BuscarRubros');
u.searchParams.set('q', filter.trim());
u.searchParams.set('page', '1');
const res = await fetch(u.toString(), {
headers: {
Accept: 'application/json, text/javascript, */*; q=0.01',
'X-Requested-With': 'XMLHttpRequest',
Referer: 'https://www.mercadopublico.cl/Home/BusquedaLicitacion',
'User-Agent': 'n8n-node/mercado-publico',
},
});
if (res.ok) {
responseData = await res.json();
} else {
return [];
}
} catch {
return [];
}
}
if (!responseData) {
return [];
}
// Some endpoints might wrap results; normalize
let list: any[] = [];
if (Array.isArray(responseData)) {
list = responseData;
} else if (Array.isArray(responseData.results)) {
list = responseData.results;
}
// Validate structure
list = list.filter(r => r && (r.text || r.descripcion) && (r.id || r.codigo));
if (!list.length) {
return [];
}
return list.map(r => ({
name: r.text || r.descripcion,
value: r.id || r.codigo,
}));
},
async getRubrosLocal(this: any, filter?: string): Promise<any[]> {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

  const seedParam =
    (this.getCurrentNodeParameter &&
      (this.getCurrentNodeParameter('rubrosSearchSeed') as string)) ||
    '';
  const rawTerm = (seedParam || filter || '').trim();
  const term = normalize(rawTerm);

  let list = rubrosCatalog as { id: string; text: string }[];
  const max = 300;

  // When user provided a term, filter and sort locally
  if (term.length >= 2) {
    list = list.filter((r) => {
      const txt = normalize(r.text);
      return txt.includes(term) || r.id.includes(term);
    });
    // Sort: prefix matches first, then term position, then alphabetical
    list.sort((a, b) => {
      const na = normalize(a.text);
      const nb = normalize(b.text);
      const aStarts = na.startsWith(term) ? 0 : 1;
      const bStarts = nb.startsWith(term) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      const aPos = na.indexOf(term);
      const bPos = nb.indexOf(term);
      if (aPos !== bPos) return aPos - bPos;
      return na.localeCompare(nb, 'es', { sensitivity: 'base' });
    });
    return list.slice(0, max).map((r) => ({ name: r.text, value: r.id }));
  }

  // No term: return stratified sample across alphabet to avoid bias to early letters
  const buckets: Record<string, { id: string; text: string }[]> = {};
  for (const r of list) {
    const first = normalize(r.text).charAt(0) || '#';
    if (!buckets[first]) buckets[first] = [];
    buckets[first].push(r);
  }
  for (const k of Object.keys(buckets)) {
    buckets[k].sort((a, b) =>
      normalize(a.text).localeCompare(normalize(b.text), 'es', {
        sensitivity: 'base',
      }),
    );
  }
  const keys = Object.keys(buckets).sort();
  const sampled: { id: string; text: string }[] = [];
  let index = 0;
  while (sampled.length < max) {
    let added = false;
    for (const k of keys) {
      const bucket = buckets[k];
      if (bucket[index]) {
        sampled.push(bucket[index]);
        added = true;
        if (sampled.length >= max) break;
      }
    }
    if (!added) break;
    index++;
  }
  return sampled.map((r) => ({ name: r.text, value: r.id }));
},
},
};
description: INodeTypeDescription = {
		displayName: 'Mercado Público',
		name: 'mercadoPublico',
		icon: 'file:mercadoPublico.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get tender data from Mercado Público API',
		defaults: {
			name: 'Mercado Público',
		},
		inputs: ['main'],
		outputs: ['main'],
		requestDefaults: {
			baseURL: 'https://api.mercadopublico.cl/servicios/v1/publico',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Tender Search',
						value: 'tenderSearch',
					},
				],
				default: 'tenderSearch',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['tenderSearch'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get tenders',
						description: 'Get tender data from Mercado Público JSON API',
						routing: {
							request: {
								method: 'GET',
								url: '/licitaciones.json',
							},
						},
						// Note: Do not use an absolute URL with ticket here, otherwise you'll end up with duplicate
						// 'ticket' query params due to credential injection. Keeping the static test URL commented:
						// routing: {
						// 	request: {
						// 		method: 'GET',
						// 		url: 'https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?ticket=YOUR_TICKET',
						// 	},
						// },
					},
					{
						name: 'Web Search',
						value: 'webSearch',
						action: 'Search tenders',
						description: 'Search tenders using web interface HTML API',
					},
				],
				default: 'get',
			},

			{
				displayName: 'Fecha Publicación',
				name: 'fechaPublicacion',
				type: 'dateTime',
				default: '',
				description: 'Publication date in DDMMYYYY format',
				routing: {
					request: {
						qs: {
							fecha: '={{$value ? new Date($value).toLocaleDateString("es-CL", {day: "2-digit", month: "2-digit", year: "numeric"}).replace(/\./g, "") : ""}}',
						},
					},
				},
			},
			{
				displayName: 'Código Producto',
				name: 'codigoProducto',
				type: 'string',
				default: '',
				description: 'Product/service code from CPSE classification',
				routing: {
					request: {
						qs: {
							codigoProducto: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Monto Estimado',
				name: 'montoEstimado',
				type: 'string',
				default: '',
				description: 'Estimated amount range for filtering',
				routing: {
					request: {
						qs: {
							monto: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				default: {},
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['tenderSearch'],
						operation: ['get'],
					},
				},
				options: [
					{
						displayName: 'Estado',
						name: 'estado',
						type: 'string',
						default: 'publicada',
						description: 'Tender status (default: publicada)',
						routing: {
							request: {
								qs: {
									estado: '={{$value}}',
								},
							},
						},
					},
				],
			},
			// textoBusqueda is now hidden and automatically uses {{ $json.tags }} from previous node
			// {
			// 	displayName: 'Search Text',
			// 	name: 'textoBusqueda',
			// 	type: 'string',
			// 	default: '',
			// 	description: 'Text to search for in tenders',
			// 	displayOptions: {
			// 		show: {
			// 			operation: ['webSearch'],
			// 		},
			// 	},
			// },
			{
				displayName: 'Licitaciones a Extraer',
				name: 'licitacionesAExtraer',
				type: 'number',
				default: 50,
				description: 'Total number of tenders to extract. The node will automatically paginate to retrieve the requested amount (max 500). API returns 10 results per request.',
				displayOptions: {
					show: {
						operation: ['webSearch'],
					},
				},
			},
			{
				displayName: 'Sort Order',
				name: 'idOrden',
				type: 'options',
				default: 1,
				description: 'Ordering criteria for the results',
				displayOptions: {
					show: {
						operation: ['webSearch'],
					},
				},
				options: [
					{
						name: 'Más relevantes primero',
						value: 1,
					},
					{
						name: 'Próximas a cerrarse',
						value: 2,
					},
					{
						name: 'Últimas publicadas',
						value: 3,
					},
					{
						name: 'Últimas cerradas',
						value: 4,
					},
					{
						name: 'Últimas adjudicadas',
						value: 5,
					},
					{
						name: 'Últimas revocadas',
						value: 6,
					},
					{
						name: 'Mayor monto primero',
						value: 7,
					},
					{
						name: 'Menor monto primero',
						value: 8,
					},
				],
			},
			{
				displayName: 'Status',
				name: 'idEstado',
				type: 'options',
				default: -1,
				description: 'Filter by tender status',
				displayOptions: {
					show: {
						operation: ['webSearch'],
					},
				},
				options: [
					{
						name: 'Todos los estados',
						value: -1,
					},
					{
						name: 'Publicada',
						value: 5,
					},
					{
						name: 'Cerrada',
						value: 6,
					},
					{
						name: 'Desierta',
						value: 7,
					},
					{
						name: 'Adjudicada',
						value: 8,
					},
					{
						name: 'Revocada',
						value: 15,
					},
					{
						name: 'Suspendida',
						value: 16,
					},
				],
			},
			{
				displayName: 'Region',
				name: 'codigoRegion',
				type: 'options',
				default: -1,
				description: 'Filter by region',
				displayOptions: {
					show: {
						operation: ['webSearch'],
					},
				},
				options: [
					{
						name: 'Todas las regiones',
						value: -1,
					},
					{
						name: 'Región de Arica y Parinacota',
						value: 15,
					},
					{
						name: 'Región de Tarapacá',
						value: 1,
					},
					{
						name: 'Región de Antofagasta',
						value: 2,
					},
					{
						name: 'Región de Atacama',
						value: 3,
					},
					{
						name: 'Región de Coquimbo',
						value: 4,
					},
					{
						name: 'Región de Valparaíso',
						value: 5,
					},
					{
						name: 'Región Metropolitana de Santiago',
						value: 13,
					},
					{
						name: 'Región del Libertador General Bernardo O´Higgins',
						value: 6,
					},
					{
						name: 'Región del Maule',
						value: 7,
					},
					{
						name: 'Región del Ñuble',
						value: 16,
					},
					{
						name: 'Región del Biobío',
						value: 8,
					},
					{
						name: 'Región de la Araucanía',
						value: 9,
					},
					{
						name: 'Región de Los Ríos',
						value: 14,
					},
					{
						name: 'Región de los Lagos',
						value: 10,
					},
					{
						name: 'Región Aysén del General Carlos Ibáñez del Campo',
						value: 11,
					},
					{
						name: 'Región de Magallanes y de la Antártica',
						value: 12,
					},
				],
			},
			{
				displayName: 'Tender Type',
				name: 'idTipoLicitacion',
				type: 'options',
				default: -1,
				description: 'Filter by tender type',
				displayOptions: {
					show: {
						operation: ['webSearch'],
					},
				},
				options: [
					{
						name: 'Todos los tipos',
						value: -1,
					},
					{
						name: '(L1) Licitación Pública Menor a 100 UTM',
						value: 1,
					},
					{
						name: '(LE) Licitación Pública Entre 100 y 1000 UTM',
						value: 2,
					},
					{
						name: '(LP) Licitación Pública igual o superior a 1.000 UTM e inferior a 2.000 UTM',
						value: 3,
					},
					{
						name: '(LQ) Licitación Pública igual o superior a 2.000 UTM e inferior a 5.000 UTM',
						value: 24,
					},
					{
						name: '(LR) Licitación Pública igual o superior a 5.000 UTM',
						value: 25,
					},
					{
						name: '(LS) Licitación Pública Servicios personales especializados',
						value: 23,
					},
					{
						name: '(O1) Licitación Pública de Obras',
						value: 30,
					},
					{
						name: '(E2) Licitación Privada Inferior a 100 UTM',
						value: 13,
					},
					{
						name: '(CO) Licitación Privada igual o superior a 100 UTM e inferior a 1000 UTM',
						value: 9,
					},
					{
						name: '(B2) Licitación Privada igual o superior a 1000 UTM e inferior a 2000 UTM',
						value: 10,
					},
					{
						name: '(H2) Licitación Privada igual o superior a 2000 UTM e inferior a 5000 UTM',
						value: 26,
					},
					{
						name: '(I2) Licitación Privada Mayor a 5000 UTM',
						value: 27,
					},
					{
						name: '(O2) Licitación Privada de Obras',
						value: 29,
					},
					{
						name: '(CI) Contrato para la Innovación con preselección',
						value: 31,
					},
					{
						name: '(DC) Diálogos Competitivos',
						value: 33,
					},
					{
						name: '(CI2) Contratos para la Innovación Fase 2',
						value: 34,
					},
					{
						name: '(DC2) Diálogos Competitivos Fase 2',
						value: 35,
					},
				],
			},
			{
				displayName: 'Budget Status',
				name: 'esPublicoMontoEstimado',
				type: 'options',
				default: 'all',
				description: 'Filter by budget publication status',
				displayOptions: {
					show: {
						operation: ['webSearch'],
					},
				},
				options: [
					{
						name: 'All',
						value: 'all',
					},
					{
						name: 'Published',
						value: 1,
					},
					{
						name: 'Not Published',
						value: 0,
					},
				],
			},
{
displayName: 'Business Categories (Rubros)',
name: 'rubros',
type: 'multiOptions',
default: [],
description: 'Select one or more Rubros from bundled catalog. Uses search term (Rubros Search Term) if provided.',
displayOptions: {
show: {
operation: ['webSearch'],
},
},
typeOptions: {
loadOptionsMethod: 'getRubrosLocal',
},
},
		],
	};

	async execute(this: any) {
		const items = this.getInputData();
		const returnData: any[] = [];
		const operation = this.getNodeParameter('operation', 0, 'get');

		try {
			if (operation === 'webSearch') {
				// Validate required parameters
				// textoBusqueda is now hardcoded to use tags from previous node
				const items = this.getInputData();
				const textoBusqueda = items[0]?.json?.tags as string || '';
				const licitacionesAExtraer = this.getNodeParameter('licitacionesAExtraer', 0, 20) as number;
				const idOrden = this.getNodeParameter('idOrden', 0, 1) as number;
				const idEstado = this.getNodeParameter('idEstado', 0, -1) as number;
				const codigoRegion = this.getNodeParameter('codigoRegion', 0, -1) as number;
				const idTipoLicitacion = this.getNodeParameter('idTipoLicitacion', 0, -1) as number;
				const esPublicoMontoEstimadoParam = this.getNodeParameter('esPublicoMontoEstimado', 0, 'all') as string | number;
				const rubros = this.getNodeParameter('rubros', 0, []) as string[];

				// Validate licitacionesAExtraer is reasonable
				if (licitacionesAExtraer < 1 || licitacionesAExtraer > 500) {
					throw new Error('Licitaciones a extraer must be between 1 and 500');
				}

				// Map esPublicoMontoEstimado parameter to API values
				let esPublicoMontoEstimado: number[] | null = null;
				if (esPublicoMontoEstimadoParam === 1) {
					esPublicoMontoEstimado = [1];
				} else if (esPublicoMontoEstimadoParam === 0) {
					esPublicoMontoEstimado = [0];
				} // else 'all' remains null

				// API has a max limit of ~10 results per page (tested - API ignores higher values)
				// If user requests more, we need to make multiple paginated requests
				const MAX_PER_PAGE = 10;
				const totalRequested = licitacionesAExtraer;
				const pagesNeeded = Math.ceil(totalRequested / MAX_PER_PAGE);

				this.logger.info(`Fetching ${totalRequested} results across ${pagesNeeded} pages (max ${MAX_PER_PAGE} per page)`);

				const allResults: any[] = [];
				let currentPage = 0; // Always start from page 0

				for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
					// Calculate how many results to fetch on this page
					const remainingResults = totalRequested - allResults.length;
					const resultsThisPage = Math.min(MAX_PER_PAGE, remainingResults);

					if (resultsThisPage <= 0) {
						break; // We've collected enough
					}

					this.logger.info(`Fetching page ${currentPage} (${resultsThisPage} results)`);

					const body = {
						textoBusqueda: textoBusqueda || '',
						idEstado: idEstado,
						codigoRegion: codigoRegion,
						idTipoLicitacion: idTipoLicitacion,
						fechaInicio: null,
						fechaFin: null,
						registrosPorPagina: MAX_PER_PAGE,
						idTipoFecha: 0,
						idOrden: idOrden,
						compradores: [],
						garantias: null,
						rubros: rubros,
						proveedores: [],
						montoEstimadoTipo: [0],
						esPublicoMontoEstimado: esPublicoMontoEstimado,
						pagina: currentPage,
					};

					const res = await fetch('https://www.mercadopublico.cl/BuscarLicitacion/Home/Buscar', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json; charset=utf-8',
							Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
							'X-Requested-With': 'XMLHttpRequest',
						},
						body: JSON.stringify(body),
					});

					if (!res.ok) {
						throw new Error(`Web search failed with status ${res.status}: ${res.statusText}`);
					}

					const html = await res.text();

					// Validate HTML response
					if (!html || html.trim().length === 0) {
						this.logger.warn(`Received empty HTML response for page ${currentPage}`);
						break; // No more results
					}

					const parsed = parseSearchHtml(html);

					// Validate parsing results
					if (!Array.isArray(parsed)) {
						throw new Error('HTML parser did not return an array');
					}

					if (parsed.length === 0) {
						this.logger.info(`No results found on page ${currentPage}, stopping pagination`);
						break; // No more results available
					}

					// Add results from this page
					allResults.push(...parsed);
					this.logger.info(`Collected ${parsed.length} results from page ${currentPage} (total: ${allResults.length})`);

					// If we got fewer results than requested, there are no more pages
					if (parsed.length < MAX_PER_PAGE) {
						this.logger.info('Received fewer results than requested, no more pages available');
						break;
					}

					currentPage++;

					// Add a small delay between requests to be respectful to the server
					if (pageIndex < pagesNeeded - 1) {
						await new Promise(resolve => setTimeout(resolve, 500));
					}
				}

				// Limit results to the exact amount requested
				const finalResults = allResults.slice(0, totalRequested);
				this.logger.info(`Returning ${finalResults.length} results (requested: ${totalRequested})`);

				if (finalResults.length === 0) {
					return this.prepareOutputData([]);
				}

				for (const p of finalResults) {
					// Validate each parsed item has required fields
					if (!p.id || !p.title) {
						this.logger.warn('Skipping parsed item missing required fields:', p);
						continue;
					}
					returnData.push({ json: p });
				}
			}
		} catch (error) {
			// Log the error and re-throw with more context
			this.logger.error('Error in Mercado Público web search:', error);
			throw new Error(`Mercado Público web search failed: ${error.message}`);
		}

		return this.prepareOutputData(returnData.length ? returnData : items);
	}
}
