import { afterEach, describe, expect, it, vi } from "vitest";
import { getServices } from "./index";

afterEach(() => vi.unstubAllEnvs());

describe("getServices", () => {
  it("usa os mocks com USE_MOCKS=true", () => {
    vi.stubEnv("USE_MOCKS", "true");
    expect(getServices().proximity.constructor.name).toBe("MockProximityService");
  });

  it("usa os mocks quando USE_MOCKS não está definido", () => {
    vi.stubEnv("USE_MOCKS", "");
    expect(getServices().quiz.constructor.name).toBe("MockQuizService");
  });

  it("usa as implementações reais com USE_MOCKS=false", () => {
    vi.stubEnv("USE_MOCKS", "false");
    expect(getServices().proximity.constructor.name).toBe("EquatorialProximityService");
  });
});
