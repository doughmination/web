/* Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUserInfo, useDoughminationClient } from "@doughmination/react-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/ProtectedRoute";
import * as s from "./edit.css";

/** Loose client-side sanity check only — the API does the real validation. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pull a human message out of either API error convention. The PUT /users/:id
// writes below aren't wrapped by the package client, so they parse errors here.
function apiErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const b = body as { error?: { message?: string }; detail?: string; message?: string };
    return b.error?.message || b.detail || b.message || fallback;
  }
  return fallback;
}

function UserEdit() {
  const client = useDoughminationClient();
  const userQuery = useUserInfo();
  const userData = userQuery.data ?? null;
  const loading = userQuery.isLoading;

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [imageError, setImageError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  // Seed the form once the current profile arrives.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && userQuery.data) {
      seeded.current = true;
      setDisplayName(userQuery.data.display_name || "");
      setAvatarUrl(userQuery.data.avatar_url || "");
      setEmail(userQuery.data.email || "");
    }
  }, [userQuery.data]);

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
    setImageError(false);
  };

  // Only try to preview once the value looks like a complete URL — otherwise the
  // browser resolves partial input ("https") as a relative path and 404s on
  // every keystroke.
  const isPreviewableUrl = (url: string): boolean =>
    /^https?:\/\/[^\s/]+\.[^\s/]+/.test(url) || url.startsWith("/");

  const handleResetAvatar = () => {
    setAvatarUrl(userData?.avatar_url || "");
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Failed to load avatar preview:", avatarUrl);
    setImageError(true);
    (e.target as HTMLImageElement).src = "https://c.stupid.cat/assets/favicon/avatar.png";
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  /** Save display name, avatar and (optional) contact email in one PUT. */
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) return;

    const trimmedEmail = email.trim();
    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
      setMessage({ type: "error", content: "Please enter a valid email address" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", content: "Authentication required" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const updateResponse = await fetch(`${client.baseUrl}/plural/users/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // null explicitly clears the field on the API; a value sets it
          display_name: displayName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          email: trimmedEmail || null,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => null);
        throw new Error(apiErrorMessage(errorData, "Failed to update profile"));
      }

      setMessage({ type: "success", content: "Profile updated successfully" });
      await userQuery.refetch();
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.loadingText}>Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={s.page}>
        <div className={s.narrowWrap}>
          <Alert variant="destructive">
            <AlertDescription>Failed to load user data</AlertDescription>
          </Alert>
          <div className={s.actionsCenter}>
            <Button variant="outline" asChild>
              <Link href="/user/profile">Back to Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        {/* Header */}
        <div className={s.headerRow}>
          <div>
            <h1 className={s.pageTitle}>Edit Profile</h1>
            <p className={s.pageSubtitle}>Update your profile information</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/user/profile">Cancel</Link>
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        {/* Sign-in note */}
        <Alert>
          <AlertDescription>
            Sign-in is handled by PocketID. Your username and password are managed there — this page
            only controls your display profile.
          </AlertDescription>
        </Alert>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your display name, avatar and contact email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className={s.form}>
              {/* Avatar URL */}
              <div className={s.avatarBlock}>
                <Label htmlFor="avatarUrl">Avatar</Label>
                <div className={s.avatarRow}>
                  <div className={s.avatarRelative}>
                    {avatarUrl && isPreviewableUrl(avatarUrl.trim()) && !imageError ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={avatarUrl.trim()}
                        alt="Avatar preview"
                        className={s.avatar}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                    ) : (
                      <div className={s.avatarFallback}>
                        <span className={s.avatarFallbackEmoji}>👤</span>
                      </div>
                    )}
                    {avatarUrl.trim() !== (userData.avatar_url || "") && (
                      <div className={s.avatarCheck}>✓</div>
                    )}
                  </div>
                  <div className={s.avatarControls}>
                    <Input
                      id="avatarUrl"
                      type="url"
                      value={avatarUrl}
                      onChange={handleAvatarUrlChange}
                      placeholder="https://example.com/avatar.png"
                    />
                    {avatarUrl.trim() !== (userData.avatar_url || "") && (
                      <div className={s.buttonRow}>
                        <Button type="button" variant="outline" size="sm" onClick={handleResetAvatar}>
                          Reset
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <p className={s.helpText}>
                  Paste a direct link to an image (square recommended)
                </p>
              </div>

              <Separator />

              {/* Display Name */}
              <div className={s.fieldBlock}>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
                <p className={s.helpText}>Leave blank to use username: @{userData.username}</p>
              </div>

              <Separator />

              {/* Contact Email */}
              <div className={s.fieldBlock}>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <p className={s.helpText}>
                  Optional contact address. Sign-in email lives in PocketID, not here.
                </p>
              </div>

              {/* Save Button */}
              <div className={s.submitRow}>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserEditPage() {
  return (
    <ProtectedRoute>
      <UserEdit />
    </ProtectedRoute>
  );
}
