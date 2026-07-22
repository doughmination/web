/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDoughminationClient, isDoughminationError } from "@doughmination/react-api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "@/components/ProtectedRoute";
import * as s from "@/styles/admin.css";

const AdminDash: React.FC = () => {
  const client = useDoughminationClient();
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  const adminPages = [
    { path: "/admin/switch", label: "Switch Manager", icon: "🔄", desc: "Manage fronting members" },
    { path: "/admin/mental", label: "Mental Health", icon: "🧠", desc: "Update mental state" },
    { path: "/admin/status", label: "Status Manager", icon: "💬", desc: "Set member statuses" },
    { path: "/admin/tags", label: "Tag Manager", icon: "🏷️", desc: "Manage member tags" },
    {
      path: "https://doughmination.uk/docs",
      label: "API Endpoints",
      icon: "🔌",
      desc: "View API reference",
      external: true,
    },
  ];

  const handleForceRefresh = async () => {
    if (!window.confirm("This will reload the website for ALL connected users. Are you sure?")) {
      return;
    }

    setRefreshing(true);
    setMessage(null);

    try {
      await client.forceRefresh();

      setMessage({
        type: "success",
        content:
          "Refresh command sent to all connected clients! The page will reload in 3 seconds...",
      });

      // Reload this page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: isDoughminationError(err) ? err.message : "Failed to send refresh command",
      });
      setRefreshing(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.wrapNarrow}>
        {/* Header */}
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Admin Dashboard</h1>
            <p className={s.pageSubtitle}>System management hub</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">
              <svg className={s.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        {/* Force Refresh Button */}
        <div className={s.dangerBanner}>
          <div className={s.dangerBannerRow}>
            <div className={s.flexGrow}>
              <h3 className={s.dangerBannerTitle}>🔄 Force Refresh All Clients</h3>
              <p className={s.dangerBannerText}>
                Send a refresh command to all users currently viewing the website. This will
                immediately reload their browsers.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleForceRefresh}
              disabled={refreshing}
              className={s.noWrap}
            >
              {refreshing ? "Sending..." : "🔄 Refresh All"}
            </Button>
          </div>
        </div>

        {/* Admin Navigation Grid */}
        <div className={s.dashGrid}>
          {adminPages.map((page) =>
            page.external ? (
              <a key={page.path} href={page.path} target="_blank" rel="noopener noreferrer">
                <div className={s.dashCard}>
                  <span className={s.dashIcon}>{page.icon}</span>
                  <h3 className={s.dashLabel}>{page.label}</h3>
                  <p className={s.dashDesc}>{page.desc}</p>
                </div>
              </a>
            ) : (
              <Link key={page.path} href={page.path}>
                <div className={s.dashCard}>
                  <span className={s.dashIcon}>{page.icon}</span>
                  <h3 className={s.dashLabel}>{page.label}</h3>
                  <p className={s.dashDesc}>{page.desc}</p>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminDashPage() {
  return (
    <ProtectedRoute adminRequired>
      <AdminDash />
    </ProtectedRoute>
  );
}
