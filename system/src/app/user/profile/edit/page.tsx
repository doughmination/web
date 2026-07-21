/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/ProtectedRoute";
import { API_BASE, unwrap, errorMessage } from "@/lib/api";
import * as s from "./edit.css";

interface UserData {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  email?: string | null;
  email_verified?: boolean;
  pending_email?: string | null;
  is_admin: boolean;
}

/** Loose client-side sanity check only — the API does the real validation. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UserEdit() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; content: string } | null>(
    null,
  );

  const fetchUserData = useCallback(async () => {
    const fixAvatarUrl = (url: string | undefined): string | undefined => {
      if (!url) return undefined;

      // If it's a relative URL, return as-is
      if (url.startsWith("/")) return url;

      return url;
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", content: "No authentication token found" });
        setLoading(false);
        return;
      }

      console.log("Fetching user data...");
      const response = await fetch(`${API_BASE}/user_info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = unwrap(await response.json());
        console.log("User data received:", data);

        // Fix the avatar URL if needed
        data.avatar_url = fixAvatarUrl(data.avatar_url);

        setUserData(data);
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
        setPendingEmail(data.pending_email || null);
        setImageError(false);
      } else {
        setMessage({ type: "error", content: "Failed to fetch user data" });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setMessage({ type: "error", content: "Network error occurred" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
    console.log("Avatar preview loaded successfully:", avatarUrl);
    setImageError(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", content: "Authentication required" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      console.log("Updating profile...");

      // Update display name + avatar URL (avatars are external image URLs now)
      const updateResponse = await fetch(
        `${API_BASE}/users/${userData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // null explicitly clears the field on the API; a value sets it
            display_name: displayName.trim() || null,
            avatar_url: avatarUrl.trim() || null,
          }),
        },
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => null);
        throw new Error(errorMessage(errorData, "Failed to update profile"));
      }

      console.log("Profile updated successfully");
      setMessage({ type: "success", content: "Profile updated successfully" });

      // Refresh user data
      await fetchUserData();
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) return;

    // Validate passwords
    if (!currentPassword) {
      setMessage({ type: "error", content: "Current password is required" });
      return;
    }

    if (!newPassword) {
      setMessage({ type: "error", content: "New password is required" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", content: "Password must be at least 8 characters long" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", content: "Passwords do not match" });
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
      console.log("Changing password...");
      const response = await fetch(`${API_BASE}/users/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorMessage(errorData, "Failed to change password"));
      }

      console.log("Password changed successfully");
      setMessage({ type: "success", content: "Password changed successfully" });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error("Password change error:", err);
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to change password",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    if (!EMAIL_PATTERN.test(newEmail.trim())) {
      setMessage({ type: "error", content: "Please enter a valid email address" });
      return;
    }
    if (newEmail.trim().toLowerCase() === (userData.email || "").toLowerCase()) {
      setMessage({ type: "error", content: "That's already your email address" });
      return;
    }
    if (!emailPassword) {
      setMessage({ type: "error", content: "Enter your current password to change your email" });
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
      const response = await fetch(`${API_BASE}/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: newEmail.trim(),
          current_password: emailPassword,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(errorMessage(data, "Failed to change email address"));
      }

      // The address does NOT switch until the new one is confirmed.
      setPendingEmail(data?.pending_email ?? newEmail.trim());
      setMessage({
        type: "success",
        content:
          data?.message ||
          "Check the new address for a confirmation link. Your current email stays active until then.",
      });
      setNewEmail("");
      setEmailPassword("");
    } catch (err: unknown) {
      setMessage({
        type: "error",
        content: err instanceof Error ? err.message : "Failed to change email address",
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

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your display name and avatar</CardDescription>
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

              {/* TODO: Add in a "if you wish to change your username, please click here", which redirects to the forgot password page */}

              {/* Save Button */}
              <div className={s.submitRow}>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card>
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>Used for password resets and account recovery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={s.fieldBlock} style={{ marginBottom: "1rem" }}>
              <Label>Current</Label>
              <p className={s.helpText}>
                {userData.email || "No email address on file"}
                {userData.email && userData.email_verified === false && " (unconfirmed)"}
              </p>
            </div>

            {pendingEmail && (
              <Alert style={{ marginBottom: "1rem" }}>
                <AlertDescription>
                  Waiting on confirmation for <strong>{pendingEmail}</strong>. Your current address
                  stays active until that link is used.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <form onSubmit={handleEmailChange} className={s.formTight} style={{ marginTop: "1rem" }}>
              <div className={s.fieldBlock}>
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <p className={s.helpText}>
                  We&apos;ll send a confirmation link there. Nothing changes until you click it.
                </p>
              </div>

              <div className={s.fieldBlock}>
                <Label htmlFor="emailPassword">Current Password</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Confirm it's you"
                  autoComplete="current-password"
                />
                <p className={s.helpText}>
                  Required — email is how you recover this account, so we check it&apos;s really you.
                </p>
              </div>

              <div className={s.submitRow}>
                <Button type="submit" disabled={saving}>
                  {saving ? "Sending..." : "Change Email"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className={s.formTight}>
              <div className={s.fieldBlock}>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>

              <div className={s.fieldBlock}>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <p className={s.helpText}>Must be at least 8 characters long</p>
              </div>

              <div className={s.fieldBlock}>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>

              <div className={s.submitRow}>
                <Button type="submit" disabled={saving}>
                  {saving ? "Changing..." : "Change Password"}
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
