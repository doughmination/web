/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import * as s from "@/styles/admin.css";

const OwnerDash: React.FC = () => {
  const ownerPages = [
    { path: "/owner/users", label: "User Management", icon: "👤", desc: "Manage all users" },
  ];

  return (
    <div className={s.page}>
      <div className={s.wrapNarrow}>
        {/* Header */}
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Owner Dashboard</h1>
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

        {/* Owner Navigation Grid */}
        <div className={s.dashGrid}>
          {ownerPages.map((page) => (
            <Link key={page.path} href={page.path}>
              <div className={s.dashCard}>
                <span className={s.dashIcon}>{page.icon}</span>
                <h3 className={s.dashLabel}>{page.label}</h3>
                <p className={s.dashDesc}>{page.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function OwnerDashPage() {
  return (
    <ProtectedRoute ownerRequired>
      <OwnerDash />
    </ProtectedRoute>
  );
}
