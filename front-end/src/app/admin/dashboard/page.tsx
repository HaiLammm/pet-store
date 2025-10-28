"use client";

import { Card } from "@/components/ui/card";
import { PawPrint } from "lucide-react";
import { useEffect, useState } from "react";
import { adminAPI, handleAPIError } from "@/lib/axios";

type Stats = { total: number; males: number; females: number; kittens: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminAPI
      .getStats()
      .then((res) => {
        if (!mounted) return;
        setStats(res.data as Stats);
      })
      .catch((err) => setError(handleAPIError(err)));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats?.total ?? "--"}</p>
            </div>
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Males</p>
              <p className="text-2xl font-bold">{stats?.males ?? "--"}</p>
            </div>
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Females</p>
              <p className="text-2xl font-bold">{stats?.females ?? "--"}</p>
            </div>
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kittens</p>
              <p className="text-2xl font-bold">{stats?.kittens ?? "--"}</p>
            </div>
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <ul className="space-y-3 text-sm">
          <li>• New pet added: “Snowy” (Kitten)</li>
          <li>• User “minh” updated profile</li>
          <li>• Order #1024 marked as shipped</li>
        </ul>
      </Card>
    </div>
  );
}
