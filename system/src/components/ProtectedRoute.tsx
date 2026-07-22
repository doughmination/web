/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserInfo } from "@doughmination/react-api";
import * as s from "./components.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
  ownerRequired?: boolean;
  petRequired?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminRequired = false,
  ownerRequired = false,
  petRequired = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Read the token once on mount; the provider also feeds it to the client.
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setTokenLoaded(true);
  }, []);

  const isMock = token?.startsWith("mock-") ?? false;

  // user_info returns is_admin / is_owner / is_pet in one call, replacing the
  // three separate /auth/* requests.
  const userInfo = useUserInfo({ enabled: Boolean(token) && !isMock });

  let isAuthenticated = false;
  let isAdmin = false;
  let isOwner = false;
  let isPet = false;

  if (token && isMock) {
    isAuthenticated = true;
    isAdmin = token === "mock-admin";
    isOwner = token === "mock-owner";
    isPet = token === "mock-pet";
  } else if (token && userInfo.data) {
    const u = userInfo.data;
    isAuthenticated = true;
    isAdmin = !!u.is_admin;
    isOwner = !!u.is_owner;
    isPet = !!u.is_pet;
  }

  const loading =
    !tokenLoaded || (Boolean(token) && !isMock && userInfo.isLoading);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/user/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return <div className={s.guardLoading}>Verifying access...</div>;
  }

  if (!isAuthenticated) {
    return null; // redirecting to /user/login
  }

  const denied = (emoji: string, title: string, text: string) => (
    <div className={s.guardPage}>
      <div className={s.guardCard}>
        <div className={s.guardEmoji}>{emoji}</div>
        <h1 className={s.guardTitle}>{title}</h1>
        <p className={s.guardText}>{text}</p>
        <button onClick={() => window.history.back()} className={s.guardBack}>
          ← Go Back
        </button>
      </div>
    </div>
  );

  // Check owner permission (owner has all permissions)
  if (ownerRequired && !isOwner) {
    return denied("🔒", "Owner Access Required", "This area is restricted to system owners only.");
  }

  // Check admin permission (admin and owner have admin access)
  if (adminRequired && !isAdmin && !isOwner) {
    return denied("🔒", "Admin Access Required", "This area is restricted to administrators only.");
  }

  // Check pet permission
  if (petRequired && !isPet && !isOwner) {
    return denied("🐾", "Pet Access Required", "This area is restricted to pets only.");
  }

  return <>{children}</>;
};

export default ProtectedRoute;
