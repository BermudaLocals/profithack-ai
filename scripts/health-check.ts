#!/usr/bin/env tsx
import http from "http";
import { execSync } from "child_process";

console.log("🏥 ROFITHACK AI Health Check");
console.log("============================\n");

interface HealthResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  latency?: number;
}

const results: HealthResult[] = [];

async function checkEndpoint(name: string, url: string): Promise<HealthResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const latency = Date.now() - startTime;
      
      if (res.statusCode === 200) {
        resolve({
          name,
          status: "pass",
          message: `HTTP ${res.statusCode}`,
          latency,
        });
      } else {
        resolve({
          name,
          status: "warn",
          message: `HTTP ${res.statusCode}`,
          latency,
        });
      }
    });
    
    req.on("error", (error) => {
      resolve({
        name,
        status: "fail",
        message: error.message,
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        name,
        status: "fail",
        message: "Timeout (5s)",
      });
    });
  });
}

function checkDatabase(): HealthResult {
  if (!process.env.DATABASE_URL) {
    return {
      name: "PostgreSQL",
      status: "warn",
      message: "DATABASE_URL not set",
    };
  }
  
  try {
    execSync("npm run db:push -- --dry-run 2>/dev/null", {
      timeout: 10000,
      stdio: "pipe",
    });
    return {
      name: "PostgreSQL",
      status: "pass",
      message: "Connected",
    };
  } catch {
    return {
      name: "PostgreSQL",
      status: "fail",
      message: "Connection failed",
    };
  }
}

function checkRedis(): HealthResult {
  if (!process.env.UPSTASH_REDIS_URL) {
    return {
      name: "Redis",
      status: "warn",
      message: "UPSTASH_REDIS_URL not set",
    };
  }
  
  return {
    name: "Redis",
    status: "pass",
    message: "Configured",
  };
}

function checkEnvVars(): HealthResult {
  const required = ["DATABASE_URL", "SESSION_SECRET"];
  const optional = [
    "UPSTASH_REDIS_URL",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY",
    "PAYPAL_CLIENT_ID",
  ];
  
  const missingRequired = required.filter((v) => !process.env[v]);
  const missingOptional = optional.filter((v) => !process.env[v]);
  
  if (missingRequired.length > 0) {
    return {
      name: "Environment",
      status: "fail",
      message: `Missing required: ${missingRequired.join(", ")}`,
    };
  }
  
  if (missingOptional.length > 0) {
    return {
      name: "Environment",
      status: "warn",
      message: `Missing optional: ${missingOptional.length} vars`,
    };
  }
  
  return {
    name: "Environment",
    status: "pass",
    message: "All variables configured",
  };
}

function checkFileSystem(): HealthResult {
  const requiredFiles = [
    "package.json",
    "server/index.ts",
    "server/shared/schema.ts",
    "client/src/App.tsx",
  ];
  
  const fs = require("fs");
  const path = require("path");
  const ROOT = process.cwd();
  
  const missing = requiredFiles.filter(
    (f) => !fs.existsSync(path.join(ROOT, f))
  );
  
  if (missing.length > 0) {
    return {
      name: "File System",
      status: "fail",
      message: `Missing: ${missing.join(", ")}`,
    };
  }
  
  return {
    name: "File System",
    status: "pass",
    message: "All required files present",
  };
}

async function runChecks(): Promise<void> {
  console.log("Running health checks...\n");
  
  results.push(checkFileSystem());
  results.push(checkEnvVars());
  results.push(checkDatabase());
  results.push(checkRedis());
  
  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}`;
  
  const endpoints = [
    { name: "Health Endpoint", url: `${baseUrl}/health` },
    { name: "Healthz Endpoint", url: `${baseUrl}/healthz` },
    { name: "Bootstrap Status", url: `${baseUrl}/api/bootstrap-status` },
  ];
  
  for (const endpoint of endpoints) {
    results.push(await checkEndpoint(endpoint.name, endpoint.url));
  }
  
  console.log("Results:");
  console.log("--------\n");
  
  for (const result of results) {
    const icon = result.status === "pass" ? "✅" : result.status === "warn" ? "⚠️" : "❌";
    const latencyStr = result.latency ? ` (${result.latency}ms)` : "";
    console.log(`${icon} ${result.name}: ${result.message}${latencyStr}`);
  }
  
  const passed = results.filter((r) => r.status === "pass").length;
  const warned = results.filter((r) => r.status === "warn").length;
  const failed = results.filter((r) => r.status === "fail").length;
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Health Check Summary                      ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ Passed:  ${String(passed).padEnd(48)}║
║  ⚠️  Warnings: ${String(warned).padEnd(47)}║
║  ❌ Failed:  ${String(failed).padEnd(48)}║
╚══════════════════════════════════════════════════════════════╝
`);
  
  if (failed > 0) {
    console.log("❌ Some checks failed. Review the issues above.");
    process.exit(1);
  } else if (warned > 0) {
    console.log("⚠️ Some checks have warnings. App will run but with limited features.");
  } else {
    console.log("✅ All checks passed! Your app is healthy.");
  }
}

runChecks().catch((error) => {
  console.error("❌ Health check failed:", error);
  process.exit(1);
});
