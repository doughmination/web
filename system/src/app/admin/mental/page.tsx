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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "@/components/ProtectedRoute";
import { API_BASE, authHeaders, errorMessage, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";
import * as s from "@/styles/admin.css";
import * as m from "./mental.css";

interface MentalState {
  level: string;
  notes?: string;
  updated_at: string;
}

const MentalHealthManager: React.FC = () => {
  const [mentalState, setMentalState] = useState<MentalState | null>(null);
  const [selectedMentalState, setSelectedMentalState] = useState("");
  const [mentalStateNotes, setMentalStateNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  const mentalStateOptions = [
    { value: "safe", label: "Safe", icon: "✅", className: m.stateSafe },
    { value: "unstable", label: "Unstable", icon: "⚠️", className: m.stateUnstable },
    { value: "idealizing", label: "Idealizing", icon: "❗", className: m.stateIdealizing },
    { value: "self-harming", label: "Self-Harming", icon: "🚨", className: m.stateSelfHarming },
    { value: "highly at risk", label: "Highly At Risk", icon: "⛔", className: m.stateHighRisk },
  ];

  useEffect(() => {
    const fetchMentalState = async () => {
      try {
        const res = await fetch(`${API_BASE}/mental-state`);
        if (res.ok) {
          const data = unwrap(await res.json());
          setMentalState(data);
          setSelectedMentalState(data.level);
          setMentalStateNotes(data.notes || "");
        }
      } catch (err) {
        console.error("Error fetching mental state:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentalState();
  }, []);

  const handleUpdateMentalState = async () => {
    if (!selectedMentalState) {
      setMessage({ type: "error", content: "Please select a mental state level." });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", content: "Authentication required." });
      return;
    }

    setMessage(null);
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/mental-state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({
          level: selectedMentalState,
          notes: mentalStateNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to update mental state"));
      }

      const data = unwrap(await response.json());
      setMentalState(data);
      setMessage({ type: "success", content: "Mental state updated successfully." });
    } catch (error: unknown) {
      console.error("Mental state update error:", error);
      setMessage({
        type: "error",
        content: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStateConfig = () => {
    if (!mentalState) return null;
    return mentalStateOptions.find((opt) => opt.value === mentalState.level);
  };

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.wrapNarrow}>
        {/* Header */}
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Mental Health Manager</h1>
            <p className={s.pageSubtitle}>Update system mental state</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/dash">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        {/* Current Mental State Display */}
        {mentalState && getCurrentStateConfig() && (
          <Card className={cn(m.stateCardBase, getCurrentStateConfig()?.className)}>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={m.currentRow}>
                <span className={m.currentIcon}>{getCurrentStateConfig()?.icon}</span>
                <div>
                  <p className={m.currentLabel}>{getCurrentStateConfig()?.label}</p>
                  {mentalState.notes && <p className={m.currentNotes}>{mentalState.notes}</p>}
                </div>
              </div>
              <p className={s.smallMuted}>
                Last updated: {new Date(mentalState.updated_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Mental State</CardTitle>
            <CardDescription>Select a new mental state level</CardDescription>
          </CardHeader>
          <CardContent className={s.formStack}>
            {/* Mental State Selection */}
            <div className={s.fieldBlock}>
              <Label htmlFor="mental-state-select">Mental State Level</Label>
              <select
                id="mental-state-select"
                value={selectedMentalState}
                onChange={(e) => setSelectedMentalState(e.target.value)}
                className={m.select}
              >
                <option value="">-- Select mental state --</option>
                {mentalStateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className={s.fieldBlock}>
              <Label htmlFor="mental-state-notes">Notes (optional)</Label>
              <textarea
                id="mental-state-notes"
                value={mentalStateNotes}
                onChange={(e) => setMentalStateNotes(e.target.value)}
                placeholder="Add any additional notes about the current mental state..."
                rows={3}
                className={m.textarea}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleUpdateMentalState}
              disabled={saving || !selectedMentalState}
              className={s.fullWidth}
            >
              {saving ? "Updating..." : "Update Mental State"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function MentalHealthManagerPage() {
  return (
    <ProtectedRoute adminRequired>
      <MentalHealthManager />
    </ProtectedRoute>
  );
}
