import { describe, expect, it } from "bun:test";
import { EnhancedQueryLogger } from "../src";

describe("Package Exports", () => {
  it("should export EnhancedQueryLogger class", () => {
    expect(EnhancedQueryLogger).toBeDefined();
    expect(typeof EnhancedQueryLogger).toBe("function");
  });

  it("shouldbe able to instantiate EnhancedQueryLogger", () => {
    const logger = new EnhancedQueryLogger();
    expect(logger).toBeInstanceOf(EnhancedQueryLogger);
  });

  it("should implement Logger interface methods", () => {
    const logger = new EnhancedQueryLogger();
    expect(typeof logger.logQuery).toBe("function");
  });
});
