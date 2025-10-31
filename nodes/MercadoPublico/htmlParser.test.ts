import { parseSearchHtml } from './htmlParser';

describe('HTML Parser', () => {
	test('should parse HTML with multiple tenders', () => {
		const html = `
			<div class="lic-bloq-wrap">
				<div class="id-licitacion"><span>123-456-LQ25</span></div>
				<h2>Test Tender</h2>
				<div class="lic-block-body">
					<p class="text-weight-light">Test Description</p>
					<div class="col-md-4">
						<span class="highlight-text">01/01/2025</span>
					</div>
					<div class="col-md-4">
						<span class="highlight-text">02/01/2025</span>
					</div>
				</div>
				<div class="campo-numerico-punto-coma">1.000.000</div>
				<div class="lic-bloq-footer">
					<div class="col-md-4"><strong>Test Organization</strong></div>
				</div>
				<div class="estado-texto">Published</div>
				<a onclick="verFicha('http://example.com/tender')">Link</a>
			</div>
		`;

		const result = parseSearchHtml(html);
		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBeGreaterThan(0);
		expect(result[0]).toHaveProperty('id', '123-456-LQ25');
		expect(result[0]).toHaveProperty('title', 'Test Tender');
		expect(result[0]).toHaveProperty('description', 'Test Description');
		expect(result[0]).toHaveProperty('monto', '1.000.000');
	});

	test('should handle empty HTML', () => {
		const html = '<div></div>';
		const result = parseSearchHtml(html);
		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(0);
	});

	test('should handle malformed HTML gracefully', () => {
		const html = '<div><span>Malformed</div>';
		const result = parseSearchHtml(html);
		expect(Array.isArray(result)).toBe(true);
	});

	test('should extract all required fields', () => {
		const html = `
			<div class="lic-bloq-wrap">
				<div class="id-licitacion"><span>789-012-LE25</span></div>
				<h2>Complete Tender</h2>
				<div class="lic-block-body">
					<p class="text-weight-light">Complete Description</p>
					<div class="col-md-4">
						<span class="highlight-text">15/01/2025</span>
					</div>
					<div class="col-md-4">
						<span class="highlight-text">20/01/2025</span>
					</div>
				</div>
				<div class="campo-numerico-punto-coma">5.000.000</div>
				<div class="lic-bloq-footer">
					<div class="col-md-4"><strong>Test Org</strong></div>
				</div>
				<div class="estado-texto">Active</div>
				<a onclick="verFicha('http://example.com/tender')">Link</a>
			</div>
		`;

		const result = parseSearchHtml(html);
		expect(result[0]).toEqual(expect.objectContaining({
			id: '789-012-LE25',
			title: 'Complete Tender',
			description: 'Complete Description',
			monto: '5.000.000',
			fechaPublicacion: '15/01/2025',
			fechaCierre: '20/01/2025',
			organismo: 'Test Org',
			estado: 'Active',
			link: 'http://example.com/tender'
		}));
	});
});
