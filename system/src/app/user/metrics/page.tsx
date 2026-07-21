/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import { unwrap } from "@/lib/api";
import * as s from "./metrics.css";

interface MemberMetric {
  id: string;
  name: string;
  display_name: string;
  avatar_url?: string;
  total_seconds: number;
  total_percent: number;
  "24h": number;
  "48h": number;
  "5d": number;
  "7d": number;
  "30d": number;
}

interface FrontingMetrics {
  total_time: number;
  members: Record<string, MemberMetric>;
  timeframes: Record<string, Record<string, number>>;
}

interface SwitchMetrics {
  total_switches: number;
  avg_switches_per_day: number;
  timeframes: {
    "24h": number;
    "48h": number;
    "5d": number;
    "7d": number;
    "30d": number;
  };
}

const COLORS = [
  "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#a855f7", "#06b6d4", "#eab308", "#22c55e", "#f43f5e",
];

const FALLBACK_AVATAR = "https://c.stupid.cat/assets/favicon/avatar.png";

type TimeframeKey = "24h" | "48h" | "5d" | "7d" | "30d";

const Metrics: React.FC = () => {
  const [frontingMetrics, setFrontingMetrics] = useState<FrontingMetrics | null>(null);
  const [switchMetrics, setSwitchMetrics] = useState<SwitchMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("7d");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  const timeframeOptions = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "48h", label: "Last 48 Hours" },
    { value: "5d", label: "Last 5 Days" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
  ];

  useEffect(() => {
    const fetchMetrics = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", content: "Authentication required" });
        setLoading(false);
        return;
      }

      try {
        const [frontingRes, switchRes] = await Promise.all([
          fetch("https://doughmination.uk/v2/plural/metrics/fronting-time?days=30", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("https://doughmination.uk/v2/plural/metrics/switch-frequency?days=30", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (frontingRes.ok && switchRes.ok) {
          const frontingData = unwrap(await frontingRes.json());
          const switchData = unwrap(await switchRes.json());
          setFrontingMetrics(frontingData);
          setSwitchMetrics(switchData);
        } else {
          setMessage({ type: "error", content: "Failed to fetch metrics" });
        }
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setMessage({ type: "error", content: "Network error occurred" });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  const getPieChartData = () => {
    if (!frontingMetrics) return [];

    const timeframeKey = selectedTimeframe as TimeframeKey;
    const members = Object.values(frontingMetrics.members);

    // Filter members with fronting time in the selected timeframe
    const filteredMembers = members
      .filter((m) => m[timeframeKey] > 0)
      .sort((a, b) => b[timeframeKey] - a[timeframeKey])
      .slice(0, 10); // Top 10 members

    return filteredMembers.map((member) => ({
      name: member.display_name || member.name,
      value: member[timeframeKey],
      seconds: member[timeframeKey],
    }));
  };

  const getBarChartData = () => {
    if (!switchMetrics) return [];

    return [
      { timeframe: "24h", switches: switchMetrics.timeframes["24h"] },
      { timeframe: "48h", switches: switchMetrics.timeframes["48h"] },
      { timeframe: "5d", switches: switchMetrics.timeframes["5d"] },
      { timeframe: "7d", switches: switchMetrics.timeframes["7d"] },
      { timeframe: "30d", switches: switchMetrics.timeframes["30d"] },
    ];
  };

  const getTopFronters = () => {
    if (!frontingMetrics) return [];

    const timeframeKey = selectedTimeframe as TimeframeKey;
    const members = Object.values(frontingMetrics.members);

    return members
      .filter((m) => m[timeframeKey] > 0)
      .sort((a, b) => b[timeframeKey] - a[timeframeKey])
      .slice(0, 10);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={s.tooltipBox}>
          <p className={s.tooltipName}>{payload[0].name}</p>
          <p className={s.tooltipValue}>{formatDuration(payload[0].payload.seconds)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.loadingText}>Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        {/* Header */}
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Metrics</h1>
            <p className={s.pageSubtitle}>System fronting and switching statistics</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        {/* Timeframe Selector */}
        <Card>
          <CardContent className={s.selectorContent}>
            <div className={s.selectorRow}>
              <label className={s.selectorLabel}>Timeframe:</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className={s.selectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        {switchMetrics && (
          <div className={s.overviewGrid}>
            <Card>
              <CardHeader className={s.overviewHeader}>
                <CardTitle className={s.overviewTitle}>Total Switches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={s.overviewValue}>{switchMetrics.total_switches}</p>
                <p className={s.overviewNote}>Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={s.overviewHeader}>
                <CardTitle className={s.overviewTitle}>Avg per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={s.overviewValue}>{switchMetrics.avg_switches_per_day.toFixed(1)}</p>
                <p className={s.overviewNote}>Switches per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={s.overviewHeader}>
                <CardTitle className={s.overviewTitle}>Selected Period</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={s.overviewValue}>
                  {switchMetrics.timeframes[selectedTimeframe as TimeframeKey]}
                </p>
                <p className={s.overviewNote}>
                  {timeframeOptions.find((o) => o.value === selectedTimeframe)?.label}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pie Chart - Fronting Time Distribution */}
        {frontingMetrics && getPieChartData().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fronting Time Distribution</CardTitle>
              <CardDescription>
                Top fronters for{" "}
                {timeframeOptions.find((o) => o.value === selectedTimeframe)?.label.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Bar Chart - Switch Frequency */}
        {switchMetrics && (
          <Card>
            <CardHeader>
              <CardTitle>Switch Frequency Over Time</CardTitle>
              <CardDescription>Number of switches across different timeframes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeframe" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="switches" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Fronters Table */}
        {frontingMetrics && getTopFronters().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Fronters</CardTitle>
              <CardDescription>
                Most active members for{" "}
                {timeframeOptions.find((o) => o.value === selectedTimeframe)?.label.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={s.frontersList}>
                {getTopFronters().map((member, index) => {
                  const timeframeKey = selectedTimeframe as TimeframeKey;
                  const duration = member[timeframeKey];

                  return (
                    <div key={member.id} className={s.fronterRow}>
                      {/* Rank */}
                      <div className={s.fronterRank}>{index + 1}</div>

                      {/* Avatar */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.avatar_url || FALLBACK_AVATAR}
                        alt={member.display_name || member.name}
                        className={s.fronterAvatar}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                        }}
                      />

                      {/* Member Info */}
                      <div className={s.fronterInfo}>
                        <p className={s.fronterName}>{member.display_name || member.name}</p>
                        <p className={s.fronterDuration}>{formatDuration(duration)}</p>
                      </div>

                      {/* Progress Bar */}
                      <div className={s.progressWrap}>
                        <div className={s.progressTrack}>
                          <div
                            className={s.progressBar}
                            style={{
                              width: `${(duration / getTopFronters()[0][timeframeKey]) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {frontingMetrics && getPieChartData().length === 0 && (
          <Card>
            <CardContent className={s.noDataContent}>
              <p className={s.noDataText}>No fronting data available for the selected timeframe</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default function MetricsPage() {
  return (
    <ProtectedRoute>
      <Metrics />
    </ProtectedRoute>
  );
}
