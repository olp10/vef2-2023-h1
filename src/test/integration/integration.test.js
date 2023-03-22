import { describe, expect, test } from "@jest/globals";

describe('integration test', () => {
  describe('/routes/recipes', () => {
    test('GET /recipes -> Skilar lista af mögulegum aðgerðum', async () => {
      const { status } = await fetchAndParse('/recipes');
      expect(status).toBe(200);
    });
  })
});