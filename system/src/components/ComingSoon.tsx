/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as s from "./ComingSoon.css";

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: string;
  showBackButton?: boolean;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  icon = "🚧",
  showBackButton = true,
}) => {
  const pathname = usePathname();

  // Default title based on route
  const getDefaultTitle = () => {
    if (title) return title;

    const path = pathname ?? "";
    if (path.includes("/pet")) return "Pet Dashboard";
    if (path.includes("/owner")) return "Owner Features";
    if (path.includes("/admin")) return "Admin Feature";
    if (path.includes("/user")) return "User Feature";

    return "New Feature";
  };

  // Default description
  const getDefaultDescription = () => {
    if (description) return description;
    return "We're working hard to bring you this feature. Check back soon!";
  };

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        <Card className={s.cardBorder}>
          <CardHeader className={cn(s.headerCenter)}>
            {/* Animated Icon */}
            <div className={s.iconWrap}>
              <div className={s.icon}>{icon}</div>
            </div>

            {/* Title */}
            <div className={s.titleBlock}>
              <CardTitle className={s.title}>{getDefaultTitle()}</CardTitle>
              <CardDescription className={s.subtitle}>Coming Soon</CardDescription>
            </div>
          </CardHeader>

          <CardContent className={s.content}>
            {/* Description */}
            <p className={s.description}>{getDefaultDescription()}</p>

            {/* Progress Indicator */}
            <div className={s.progressBlock}>
              <div className={s.progressLabels}>
                <span className={s.progressMuted}>Development Progress</span>
                <span className={s.progressActive}>In Progress...</span>
              </div>
              <div className={s.progressTrack}>
                <div className={s.progressBar} style={{ width: "35%" }} />
              </div>
            </div>

            {/* Feature Highlights */}
            <div className={s.featuresBox}>
              <h3 className={s.featuresTitle}>What to Expect</h3>
              <div className={s.featuresGrid}>
                <div className={s.featureItem}>
                  <span className={s.featureIcon}>✨</span>
                  <span className={s.featureText}>New features and functionality</span>
                </div>
                <div className={s.featureItem}>
                  <span className={s.featureIcon}>🎨</span>
                  <span className={s.featureText}>Beautiful, intuitive design</span>
                </div>
                <div className={s.featureItem}>
                  <span className={s.featureIcon}>⚡</span>
                  <span className={s.featureText}>Fast and responsive</span>
                </div>
                <div className={s.featureItem}>
                  <span className={s.featureIcon}>🔒</span>
                  <span className={s.featureText}>Secure and reliable</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={s.actions}>
              {showBackButton && (
                <Button variant="outline" size="lg" asChild>
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
              )}

              <Button size="lg" asChild>
                <a
                  href="https://codeberg.org/clove/web/src/branch/main/system"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className={s.btnIcon} fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-2.043-3.369-2.043-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-2.038-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Request Feature
                </a>
              </Button>
            </div>

            {/* Additional Info */}
            <div className={s.footerBlock}>
              <p className={s.footerText}>
                Want to stay updated?{" "}
                <a
                  href="https://doughmination.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.footerLink}
                >
                  Visit the Homepage
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComingSoon;
