/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "@/components/ProtectedRoute";
import { unwrap } from "@/lib/api";
import * as s from "./profile.css";

interface UserData {
  id: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  is_owner?: boolean;
  is_pet?: boolean;
}

function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fixAvatarUrl = (url: string | undefined): string | undefined => {
      if (!url) return undefined;

      // If it's a relative URL, return as-is
      if (url.startsWith("/")) return url;

      return url;
    };

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        console.log("Fetching user data...");
        const response = await fetch("https://doughmination.uk/v2/plural/user_info", {
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
          setImageError(false);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch user data:", response.status, errorText);
          setError("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Failed to load avatar:", userData?.avatar_url);
    setImageError(true);
    (e.target as HTMLImageElement).src = "https://c.stupid.cat/assets/favicon/avatar.png";
  };

  const handleImageLoad = () => {
    console.log("Avatar loaded successfully:", userData?.avatar_url);
    setImageError(false);
  };

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.loadingText}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.page}>
        <div className={s.narrowWrap}>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className={s.actionsCenter}>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={s.page}>
        <div className={s.narrowCenter}>
          <p className={s.noDataText}>User data not available</p>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.narrowWrap}>
        <Card>
          <CardHeader className={s.headerCenter}>
            <CardTitle className={s.cardTitle}>User Profile</CardTitle>
          </CardHeader>
          <CardContent className={s.content}>
            <div className={s.centerBlock}>
              {/* Avatar Display */}
              {userData.avatar_url && !imageError ? (
                <div className={s.avatarWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userData.avatar_url}
                    alt="User Avatar"
                    className={s.avatar}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
              ) : (
                <div className={s.avatarFallback}>
                  <span className={s.avatarFallbackEmoji}>👤</span>
                </div>
              )}

              {/* Display Name and Username */}
              <h2 className={s.displayName}>
                {userData.display_name || userData.username}
                {userData.is_owner && (
                  <Badge variant="default" className={s.adminBadge}>
                    Owner
                  </Badge>
                )}
                {userData.is_admin && (
                  <Badge variant="secondary" className={s.adminBadge}>
                    Admin
                  </Badge>
                )}
                {userData.is_pet && (
                  <Badge variant="outline" className={s.adminBadge}>
                    Pet
                  </Badge>
                )}
              </h2>

              <p className={s.username}>@{userData.username}</p>
            </div>

            {/* Action Buttons */}
            <div className={s.actionRow}>
              <Button asChild>
                <Link href="/user/profile/edit">Edit Profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  );
}
