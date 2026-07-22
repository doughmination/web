/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUserInfo } from "@doughmination/react-api";
import * as s from "./profile.css";

function UserProfile() {
  const userQuery = useUserInfo();
  const userData = userQuery.data ?? null;
  const loading = userQuery.isLoading;
  const error = userQuery.isError ? "Failed to fetch user data" : "";

  const [imageError, setImageError] = useState(false);

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
