import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/channels", () => {
  it("devolve os canais simulados", async () => {
    const json = await (await GET()).json();
    expect(json.simulacao).toBe(true);
    expect(json.canais[0].valor).toBe("{{CANAL_EQUATORIAL}}");
  });
});
