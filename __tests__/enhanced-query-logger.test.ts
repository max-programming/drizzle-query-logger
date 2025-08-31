import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { EnhancedQueryLogger } from "../src";

describe("EnhancedQueryLogger", () => {
  let logger: EnhancedQueryLogger;
  let mockLog: ReturnType<typeof jest.fn<(...args: string[]) => void>>;

  beforeEach(() => {
    mockLog = jest.fn();
    logger = new EnhancedQueryLogger({
      log: mockLog,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Query Type Detection", () => {
    it("should detect SELECT queries", () => {
      logger.logQuery("SELECT * FROM users", []);
      expect(mockLog).toHaveBeenCalled();
      const logCall = mockLog.mock.calls.find(call =>
        call[0].includes("SELECT")
      );
      expect(logCall).toBeDefined();
    });
  });

  it("should detect INSERT queries", () => {
    logger.logQuery("INSERT INTO users (name) VALUES (?)", ["John Doe"]);
    expect(mockLog).toHaveBeenCalled();
    const logCall = mockLog.mock.calls.find(
      call => call[0].includes("📝") && call[0].includes("INSERT")
    );
    expect(logCall).toBeDefined();
  });

  it("should detect UPDATE queries", () => {
    logger.logQuery("UPDATE users SET name = ? WHERE id = ?", ["Jane", 1]);
    const logCall = mockLog.mock.calls.find(
      call => call[0].includes("✏️") && call[0].includes("UPDATE")
    );
    expect(logCall).toBeDefined();
  });

  it("should detect DELETE queries", () => {
    logger.logQuery("DELETE FROM users WHERE id = ?", [1]);
    const logCall = mockLog.mock.calls.find(
      call => call[0].includes("🗑️") && call[0].includes("DELETE")
    );
    expect(logCall).toBeDefined();
  });

  it("should detect CREATE queries", () => {
    logger.logQuery("CREATE TABLE users (id INT)", []);
    const logCall = mockLog.mock.calls.find(
      call => call[0].includes("🏗️") && call[0].includes("CREATE")
    );
    expect(logCall).toBeDefined();
  });

  it("should detect DROP queries", () => {
    logger.logQuery("DROP TABLE users", []);
    const logCall = mockLog.mock.calls.find(
      call => call[0].includes("💥") && call[0].includes("DROP")
    );
    expect(logCall).toBeDefined();
  });

  it("should detect ALTER queries", () => {
    logger.logQuery("ALTER TABLE users ADD COLUMN email VARCHAR(255)", []);
    const logCall = mockLog.mock.calls.find(
      call => call[0].includes("🔧") && call[0].includes("ALTER")
    );
    expect(logCall).toBeDefined();
  });

  it("should classify unknown queries as OTHER", () => {
    logger.logQuery("EXPLAIN SELECT * FROM users", []);
    const logCall = mockLog.mock.calls.find(
      call => call[0].includes("⚡") && call[0].includes("OTHER")
    );
    expect(logCall).toBeDefined();
  });

  describe("Table Name Extraction", () => {
    it("should extract table name from SELECT queries", () => {
      logger.logQuery("SELECT * FROM users WHERE id = 1", []);
      const logCall = mockLog.mock.calls.find(call =>
        call[0].includes("users")
      );
      expect(logCall).toBeDefined();
    });

    it("should extract table name from INSERT queries", () => {
      logger.logQuery("INSERT INTO products (name) VALUES (?)", ["Test"]);
      const logCall = mockLog.mock.calls.find(call =>
        call[0].includes("products")
      );
      expect(logCall).toBeDefined();
    });

    it("should extract table name from UPDATE queries", () => {
      logger.logQuery("UPDATE orders SET status = ? WHERE id = ?", [
        "completed",
        1,
      ]);
      const logCall = mockLog.mock.calls.find(call =>
        call[0].includes("orders")
      );
      expect(logCall).toBeDefined();
    });

    it("should extract table name from CREATE TABLE queries", () => {
      logger.logQuery("CREATE TABLE new_table (id INT)", []);
      const logCall = mockLog.mock.calls.find(call =>
        call[0].includes("new_table")
      );
      expect(logCall).toBeDefined();
    });

    it("should handle queries with quoted table names", () => {
      logger.logQuery("SELECT * FROM `users` WHERE id = 1", []);
      const logCall = mockLog.mock.calls.find(call =>
        call[0].includes("users")
      );
      expect(logCall).toBeDefined();
    });

    it("should handle queries without identifiable table names", () => {
      logger.logQuery("SHOW TABLES", []);
      // Should not crash and should log the query
      expect(mockLog).toHaveBeenCalled();
    });
  });
  describe("Parameter Formatting", () => {
    it("should format string parameters", () => {
      logger.logQuery("SELECT * FROM users WHERE name = ?", ["John Doe"]);
      const logCall = mockLog.mock.calls.find(call =>
        call[0].includes("John Doe")
      );
      expect(logCall).toBeDefined();
    });

    it("should format number parameters", () => {
      logger.logQuery("SELECT * FROM users WHERE id = ?", [123]);
      const logCall = mockLog.mock.calls.find(call => call[0].includes("123"));
      expect(logCall).toBeDefined();
    });

    it("should format boolean parameters", () => {
      logger.logQuery("SELECT * FROM users WHERE active = ?", [true]);
      const logCall = mockLog.mock.calls.find(call => call[0].includes("true"));
      expect(logCall).toBeDefined();
    });

    it("should format null parameters", () => {
      logger.logQuery("SELECT * FROM users WHERE email = ?", [null]);
      const logCall = mockLog.mock.calls.find(call => call[0].includes("null"));
      expect(logCall).toBeDefined();
    });

    it("should format object parameters", () => {
      logger.logQuery("SELECT * FROM users WHERE metadata = ?", [
        { key: "value" },
      ]);
      const logCall = mockLog.mock.calls.find(
        call => call[0].includes("key") && call[0].includes("value")
      );
      expect(logCall).toBeDefined();
    });

    it("should handle empty parameter arrays", () => {
      logger.logQuery("SELECT * FROM users", []);
      expect(mockLog).toHaveBeenCalled();
      // Should not include parameter section
      const parameterCall = mockLog.mock.calls.find(call =>
        call[0].includes("Parameters:")
      );
      expect(parameterCall).toBeUndefined();
    });
  });

  describe("Query Formatting", () => {
    it("should highlight SQL keywords", () => {
      logger.logQuery("SELECT name FROM users WHERE id = 1", []);
      const logCall = mockLog.mock.calls.find(
        call =>
          call[0].includes("SELECT") ||
          call[0].includes("FROM") ||
          call[0].includes("WHERE")
      );
      expect(logCall).toBeDefined();
    });

    it("should highlight string literals", () => {
      logger.logQuery("SELECT * FROM users WHERE name = 'John'", []);
      const logCall = mockLog.mock.calls.find(call =>
        call[0].includes("'John'")
      );
      expect(logCall).toBeDefined();
    });

    it("should highlight numbers", () => {
      logger.logQuery("SELECT * FROM users WHERE id = 123", []);
      const logCall = mockLog.mock.calls.find(call => call[0].includes("123"));
      expect(logCall).toBeDefined();
    });
  });

  describe("Logging Format", () => {
    it("should include query count in header", () => {
      logger.logQuery("SELECT * FROM users", []);
      const headerCall = mockLog.mock.calls.find(call =>
        call[0].includes("#1")
      );
      expect(headerCall).toBeDefined();
    });

    it("should increment query count", () => {
      logger.logQuery("SELECT * FROM users", []);
      logger.logQuery("SELECT * FROM products", []);

      const firstQueryCall = mockLog.mock.calls.find(call =>
        call[0].includes("#1")
      );
      const secondQueryCall = mockLog.mock.calls.find(call =>
        call[0].includes("#2")
      );

      expect(firstQueryCall).toBeDefined();
      expect(secondQueryCall).toBeDefined();
    });

    it("should include timestamp", () => {
      logger.logQuery("SELECT * FROM users", []);
      const timeCall = mockLog.mock.calls.find(call =>
        call[0].includes("Time:")
      );
      expect(timeCall).toBeDefined();
    });

    it("should include SQL section", () => {
      logger.logQuery("SELECT * FROM users", []);
      const sqlCall = mockLog.mock.calls.find(call => call[0].includes("SQL:"));
      expect(sqlCall).toBeDefined();
    });

    it("should call log function multiple times for complete output", () => {
      logger.logQuery("SELECT * FROM users WHERE id = ?", [1]);
      // Should have header, time, query info, SQL line, parameters, and footer
      expect(mockLog).toHaveBeenCalledTimes(6);
    });
  });

  describe("Constructor Options", () => {
    it("should use console.log by default", () => {
      const defaultLogger = new EnhancedQueryLogger();
      // Should not throw when logging
      expect(() => {
        defaultLogger.logQuery("SELECT 1", []);
      }).not.toThrow();
    });

    it("should accept custom log function", () => {
      const customLog = jest.fn();
      const customLogger = new EnhancedQueryLogger({ log: customLog });

      customLogger.logQuery("SELECT 1", []);
      expect(customLog).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long queries", () => {
      const longQuery = "SELECT " + "column,".repeat(100) + " id FROM users";
      expect(() => {
        logger.logQuery(longQuery, []);
      }).not.toThrow();
    });

    it("should handle queries with special characters", () => {
      const specialQuery =
        "SELECT * FROM users WHERE name = 'O''Reilly' AND email LIKE '%@%.com'";
      expect(() => {
        logger.logQuery(specialQuery, []);
      }).not.toThrow();
    });

    it("should handle empty queries", () => {
      expect(() => {
        logger.logQuery("", []);
      }).not.toThrow();
    });

    it("should handle queries with only whitespace", () => {
      expect(() => {
        logger.logQuery("   \n\t  ", []);
      }).not.toThrow();
    });

    it("should handle malformed parameters that throw JSON.stringify errors", () => {
      const circularObj: any = { prop: "value" };
      circularObj.circular = circularObj;

      expect(() => {
        logger.logQuery("SELECT * FROM users WHERE data = ?", [circularObj]);
      }).not.toThrow();
    });
  });
});
