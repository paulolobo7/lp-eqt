import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/quiz", () => {
  it("devolve 3 perguntas sem gabarito", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.perguntas).toHaveLength(3);
    expect(JSON.stringify(json)).not.toMatch(/correta|explicacao/);
  });
});
