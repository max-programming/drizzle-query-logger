import type { Logger } from "drizzle-orm/logger";
import { colors } from "./colors";

interface QueryStats {
  startTime: number;
  queryType: string;
  tableName: string | null;
}

export class EnhancedQueryLogger implements Logger {
  private queryCount = 0;
  private activeQueries = new Map<string, QueryStats>();

  constructor(private readonly options = { log: console.log }) {}

  private getQueryType(query: string): string {
    const upperQuery = query.trim().toUpperCase();
    if (upperQuery.startsWith("SELECT")) return "SELECT";
    if (upperQuery.startsWith("INSERT")) return "INSERT";
    if (upperQuery.startsWith("UPDATE")) return "UPDATE";
    if (upperQuery.startsWith("DELETE")) return "DELETE";
    if (upperQuery.startsWith("CREATE")) return "CREATE";
    if (upperQuery.startsWith("DROP")) return "DROP";
    if (upperQuery.startsWith("ALTER")) return "ALTER";
    return "OTHER";
  }

  private getTableName(query: string): string | null {
    const patterns = [
      /(?:FROM|INTO|UPDATE|JOIN)\s+["`]?(\w+)["`]?/i,
      /(?:CREATE|DROP)\s+TABLE\s+["`]?(\w+)["`]?/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private getQueryTypeColor(queryType: string): string {
    switch (queryType) {
      case "SELECT":
        return colors.green;
      case "INSERT":
        return colors.blue;
      case "UPDATE":
        return colors.yellow;
      case "DELETE":
        return colors.red;
      case "CREATE":
        return colors.magenta;
      case "DROP":
        return colors.red;
      case "ALTER":
        return colors.cyan;
      default:
        return colors.white;
    }
  }

  private getQueryTypeIcon(queryType: string): string {
    switch (queryType) {
      case "SELECT":
        return "🔍";
      case "INSERT":
        return "📝";
      case "UPDATE":
        return "✏️";
      case "DELETE":
        return "🗑️";
      case "CREATE":
        return "🏗️";
      case "DROP":
        return "💥";
      case "ALTER":
        return "🔧";
      default:
        return "⚡";
    }
  }

  private formatParams(params: unknown[]): string {
    if (!params.length) return "";

    const formattedParams = params.map((param, index) => {
      let value: string;
      try {
        if (param === null) {
          value = `${colors.dim}null${colors.reset}`;
        } else if (typeof param === "string") {
          value = `${colors.green}"${param}"${colors.reset}`;
        } else if (typeof param === "number") {
          value = `${colors.cyan}${param}${colors.reset}`;
        } else if (typeof param === "boolean") {
          value = `${colors.yellow}${param}${colors.reset}`;
        } else {
          value = `${colors.magenta}${JSON.stringify(param)}${colors.reset}`;
        }
      } catch {
        value = `${colors.red}${String(param)}${colors.reset}`;
      }

      return `${colors.dim}$${index + 1}:${colors.reset} ${value}`;
    });

    return `\n${colors.gray}   ├─ Parameters: ${
      colors.reset
    }${formattedParams.join(", ")}`;
  }

  private formatQuery(query: string): string {
    return query
      .replace(
        /\b(SELECT|FROM|WHERE|JOIN|INSERT|INTO|UPDATE|SET|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|DEFAULT|UNIQUE|AUTO_INCREMENT|IF|EXISTS|ON|DUPLICATE|KEY|UPDATE|VALUES|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INNER|LEFT|RIGHT|OUTER|UNION|CASE|WHEN|THEN|ELSE|END|AS|DISTINCT|COUNT|SUM|AVG|MAX|MIN|AND|OR|IN|LIKE|BETWEEN|IS)\b/gi,
        match => `${colors.blue}${match.toUpperCase()}${colors.reset}`
      )
      .replace(/('[^']*'|"[^"]*")/g, `${colors.green}$1${colors.reset}`)
      .replace(/\b(\d+)\b/g, `${colors.cyan}$1${colors.reset}`);
  }

  logQuery(query: string, params: unknown[]): void {
    this.queryCount++;
    const queryId = `q${this.queryCount}`;
    const startTime = Date.now();
    const queryType = this.getQueryType(query);
    const tableName = this.getTableName(query);
    const timestamp = new Date().toLocaleTimeString();

    this.activeQueries.set(queryId, {
      startTime,
      queryType,
      tableName,
    });

    const typeColor = this.getQueryTypeColor(queryType);
    const icon = this.getQueryTypeIcon(queryType);
    const paramsStr = this.formatParams(params);
    const formattedQuery = this.formatQuery(query);

    const header = `${colors.bright}${colors.cyan}╭─ Database Query ${colors.dim}#${this.queryCount}${colors.reset}`;
    const timeInfo = `${colors.gray}│  ${colors.dim}Time: ${timestamp}${colors.reset}`;
    const queryInfo = `${colors.gray}│  ${icon} ${typeColor}${
      colors.bright
    }${queryType}${colors.reset}${
      tableName
        ? ` ${colors.dim}on${colors.reset} ${colors.yellow}${tableName}${colors.reset}`
        : ""
    }`;
    const queryLine = `${colors.gray}│  ${colors.dim}SQL:${colors.reset} ${formattedQuery}`;
    const footer = `${colors.gray}╰─${colors.dim}${"─".repeat(50)}${
      colors.reset
    }`;

    this.options.log("\n" + header);
    this.options.log(timeInfo);
    this.options.log(queryInfo);
    this.options.log(queryLine);
    if (paramsStr) {
      this.options.log(`${colors.gray}   ${paramsStr}`);
    }
    this.options.log(footer);

    setTimeout(() => {
      this.activeQueries.delete(queryId);
    }, 5000);
  }
}
