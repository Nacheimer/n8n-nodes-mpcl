/**
 * Unit tests for pagination logic
 */

describe('Pagination Logic', () => {
  test('calculates pages needed correctly', () => {
    const MAX_PER_PAGE = 20;

    // Test different scenarios
    const testCases = [
      { requested: 20, expectedPages: 1 },
      { requested: 40, expectedPages: 2 },
      { requested: 60, expectedPages: 3 },
      { requested: 100, expectedPages: 5 },
      { requested: 15, expectedPages: 1 },
      { requested: 21, expectedPages: 2 },
      { requested: 99, expectedPages: 5 },
    ];

    testCases.forEach(({ requested, expectedPages }) => {
      const pagesNeeded = Math.ceil(requested / MAX_PER_PAGE);
      expect(pagesNeeded).toBe(expectedPages);
    });
  });

  test('slices results correctly', () => {
    const allResults = Array.from({ length: 65 }, (_, i) => ({ id: i + 1 }));
    const requested = 60;

    const finalResults = allResults.slice(0, requested);

    expect(finalResults.length).toBe(60);
    expect(finalResults[0].id).toBe(1);
    expect(finalResults[59].id).toBe(60);
  });

  test('handles results less than requested', () => {
    const allResults = Array.from({ length: 45 }, (_, i) => ({ id: i + 1 }));
    const requested = 60;

    const finalResults = allResults.slice(0, requested);

    // Should return all available results, not fail
    expect(finalResults.length).toBe(45);
  });
});
