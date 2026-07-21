/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE, authHeaders, unwrap } from "@/lib/api";
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
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isPet, setIsPet] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Fast-path for mock dev token
      if (token.startsWith("mock-")) {
        setIsAuthenticated(true);
        setIsAdmin(token === "mock-admin");
        setIsOwner(token === "mock-owner");
        setIsPet(token === "mock-pet");
        setLoading(false);
        return;
      }

      try {
        // Check user permissions from the API (separate endpoints per role)
        const [adminRes, ownerRes, petRes] = await Promise.all([
          fetch(`${API_BASE}/auth/is_admin`, { headers: authHeaders(token) }),
          fetch(`${API_BASE}/auth/is_owner`, { headers: authHeaders(token) }),
          fetch(`${API_BASE}/auth/is_pet`, { headers: authHeaders(token) }),
        ]);

        if (adminRes.ok) {
          const admin = unwrap(await adminRes.json());
          const owner = ownerRes.ok ? unwrap(await ownerRes.json()) : {};
          const pet = petRes.ok ? unwrap(await petRes.json()) : {};
          setIsAuthenticated(true);
          setIsAdmin(!!admin.isAdmin);
          setIsOwner(!!owner.isOwner);
          setIsPet(!!pet.isPet);
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsOwner(false);
          setIsPet(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsOwner(false);
        setIsPet(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

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
