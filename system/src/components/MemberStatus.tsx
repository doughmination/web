/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import React from "react";
import * as s from "./components.css";

interface MemberStatus {
  text: string;
  emoji?: string;
  updated_at: string;
}

interface MemberStatusProps {
  status: MemberStatus | null | undefined;
  compact?: boolean;
}

export default function MemberStatus({ status, compact = false }: MemberStatusProps) {
  if (!status) {
    return null;
  }

  if (compact) {
    // Compact version for member cards
    return (
      <div className={s.statusCompact}>
        {status.emoji && <span className={s.statusCompactEmoji}>{status.emoji}</span>}
        <span className={s.statusCompactText}>{status.text}</span>
      </div>
    );
  }

  // Full version for member details page
  return (
    <div className={s.statusFull}>
      {status.emoji && <span className={s.statusFullEmoji}>{status.emoji}</span>}
      <div className={s.statusFullBody}>
        <p className={s.statusFullText}>{status.text}</p>
        <p className={s.statusFullUpdated}>
          Updated {new Date(status.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Export the status interface for use in other components
export type { MemberStatus };
