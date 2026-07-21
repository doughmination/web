/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as s from "./forgot.css";

const ForgotPassword: React.FC = () => {
  const contactMethods = [
    {
      icon: "💬",
      name: "Discord",
      value: "@doughmination",
      label: "Preferred Method",
      className: s.contactDiscord,
    },
    {
      icon: "📧",
      name: "Email",
      value: "forgot-password@doughmination.win",
      label: "Email Address",
      className: s.contactEmail,
    },
    {
      icon: "🐦",
      name: "Twitter",
      value: "@DoughminCEO",
      label: "Twitter Handle",
      className: s.contactTwitter,
    },
  ];

  return (
    <div className={s.card}>
      {/* Header */}
      <div className={s.header}>
        <h2 className={s.title}>Account Recovery</h2>
        <p className={s.subtitle}>Need help with your username or password?</p>
      </div>

      {/* Info Card */}
      <div className={s.infoBox}>
        <div className={s.noticeRow}>
          <span className={s.noticeEmoji}>ℹ️</span>
          <div>
            <h3 className={s.infoTitle}>Manual Recovery Process</h3>
            <p className={s.infoText}>
              Password resets and username changes are currently handled manually. Please contact
              us through one of the methods below with your account details.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className={s.contactsBlock}>
        <h3 className={s.sectionTitle}>Contact Methods</h3>

        {contactMethods.map((method, index) => (
          <div key={index} className={cn(s.contactCard, method.className)}>
            <div className={s.contactRow}>
              <span className={s.contactEmoji}>{method.icon}</span>
              <div className={s.contactBody}>
                <div className={s.contactNameRow}>
                  <h4 className={s.contactName}>{method.name}</h4>
                  {method.name === "Discord" && (
                    <span className={s.preferredBadge}>Preferred</span>
                  )}
                </div>
                <p className={s.contactValue}>{method.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What to Include */}
      <div className={s.includeBox}>
        <h3 className={s.includeTitle}>Please Include:</h3>
        <ul className={s.includeList}>
          <li className={s.includeItem}>
            <span className={s.includeCheck}>✓</span>
            <span>Your current username (if you remember it)</span>
          </li>
          <li className={s.includeItem}>
            <span className={s.includeCheck}>✓</span>
            <span>Whether you need a password reset or username change</span>
          </li>
          <li className={s.includeItem}>
            <span className={s.includeCheck}>✓</span>
            <span>Any additional details that can help verify your identity</span>
          </li>
          <li className={s.includeItem}>
            <span className={s.includeCheck}>✓</span>
            <span>Your preferred contact method for the response</span>
          </li>
        </ul>
      </div>

      {/* Future Notice */}
      <div className={s.futureBox}>
        <div className={s.noticeRow}>
          <span className={s.noticeEmoji}>🚀</span>
          <div>
            <h3 className={s.futureTitle}>Coming Soon</h3>
            <p className={s.futureText}>
              An automated email-based password reset system is planned for the future. This page
              will be updated to username changes only when that feature is implemented.
            </p>
          </div>
        </div>
      </div>

      {/* Back to Login */}
      <div className={s.backWrap}>
        <Link href="/user/login" className={s.backButton}>
          ← Back to Login
        </Link>
      </div>

      {/* Additional Help */}
      <div className={s.helpBlock}>
        <p className={s.helpText}>Response time is typically within 24-48 hours</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
