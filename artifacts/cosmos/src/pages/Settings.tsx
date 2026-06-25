import { useState } from "react";
import { Settings2, Database, Trash2, CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runMigration, verifyMigration, clearCosmosLocalStorage } from "@/lib/storage/migration";
import type { MigrationResult } from "@/lib/storage/migration";

export default function Settings() {
  const [migrating, setMigrating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [clearCount, setClearCount] = useState<number | null>(null);

  const handleMigrate = async () => {
    setMigrating(true);
    setMigrationResult(null);
    try {
      const result = await runMigration();
      setMigrationResult(result);
    } finally {
      setMigrating(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await verifyMigration();
      setVerifyResult(result);
    } finally {
      setVerifying(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const count = await clearCosmosLocalStorage();
      setClearCount(count);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings2 className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">
          System configuration and data management
        </p>
      </div>

      {/* System Info */}
      <div className="bg-card/40 border border-white/5 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          System Information
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-background/40 rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Version</p>
            <p className="text-white font-mono">COSMOS-OS v1.0.0</p>
          </div>
          <div className="bg-background/40 rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Storage</p>
            <p className="text-white font-mono">IndexedDB + PostgreSQL</p>
          </div>
          <div className="bg-background/40 rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">AI Crew</p>
            <p className="text-white font-mono">10 Agents Active</p>
          </div>
          <div className="bg-background/40 rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Phase</p>
            <p className="text-white font-mono">3 — Full Integration</p>
          </div>
        </div>
      </div>

      {/* Migration Tool */}
      <div className="bg-card/40 border border-white/5 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            Migration Tool
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            Migrate data from legacy localStorage cosmos.* keys into IndexedDB.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleMigrate}
            disabled={migrating}
            className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary"
            size="sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${migrating ? "animate-spin" : ""}`} />
            {migrating ? "Migrating..." : "Run Migration"}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={verifying}
            variant="ghost"
            size="sm"
            className="border border-white/10 text-muted-foreground hover:text-white"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            {verifying ? "Verifying..." : "Verify Storage"}
          </Button>
          <Button
            onClick={handleClear}
            disabled={clearing}
            variant="ghost"
            size="sm"
            className="border border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {clearing ? "Clearing..." : "Clear localStorage"}
          </Button>
        </div>

        {/* Migration Result */}
        {migrationResult && (
          <div
            className={`rounded-xl p-4 border ${
              migrationResult.success
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {migrationResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-semibold ${migrationResult.success ? "text-green-400" : "text-red-400"}`}>
                {migrationResult.success ? "Migration Successful" : "Migration Had Errors"}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {migrationResult.migrated} migrated · {migrationResult.errors} errors
              </span>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {migrationResult.logs.map((log, i) => (
                <p key={i} className="text-xs font-mono text-muted-foreground">{log}</p>
              ))}
            </div>
          </div>
        )}

        {/* Verify Result */}
        {verifyResult && (
          <div className="bg-background/40 border border-white/10 rounded-xl p-3">
            <p className="text-xs font-mono text-muted-foreground">{verifyResult}</p>
          </div>
        )}

        {/* Clear Result */}
        {clearCount !== null && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-background/40 border border-white/10">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-muted-foreground font-mono">
              Cleared {clearCount} cosmos.* key{clearCount !== 1 ? "s" : ""} from localStorage
            </p>
          </div>
        )}
      </div>

      {/* Test Scripts Info */}
      <div className="bg-card/40 border border-white/5 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-white text-sm">Test Scripts</h2>
        <p className="text-muted-foreground text-xs">Run these from the terminal to test each engine:</p>
        <div className="space-y-1.5">
          {[
            { cmd: "pnpm --filter @workspace/cosmos test:universe", desc: "Universe Engine" },
            { cmd: "pnpm --filter @workspace/cosmos test:legacy", desc: "Legacy Engine" },
            { cmd: "pnpm --filter @workspace/cosmos test:simulation", desc: "Simulation Engine" },
            { cmd: "pnpm --filter @workspace/cosmos test:migration", desc: "Migration Tool" },
            { cmd: "pnpm --filter @workspace/cosmos test:all", desc: "All tests" },
          ].map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-center gap-3">
              <code className="text-xs bg-background/60 border border-white/10 rounded px-2 py-1 text-primary font-mono flex-1 overflow-x-auto">
                {cmd}
              </code>
              <span className="text-xs text-muted-foreground shrink-0">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
