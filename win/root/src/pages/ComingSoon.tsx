/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: string;
  showBackButton?: boolean;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  icon = '🚧',
  showBackButton = true
}) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground theme-transition flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Card className="border-2">
          <CardHeader className="text-center space-y-6 pb-4">
            {/* Animated Icon */}
            <div className="flex justify-center">
              <div className="text-8xl animate-bounce">
                {icon}
              </div>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <CardTitle className="text-4xl font-bold font-comic text-primary">
                New Page
              </CardTitle>
              <CardDescription className="text-xl font-comic">
                Coming Soon
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Progress Indicator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-comic">
                <span className="text-muted-foreground">Development Progress</span>
                <span className="text-primary font-semibold">In Progress...</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"
                  style={{ width: '35%' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showBackButton && (
                <Button variant="outline" size="lg" asChild className="font-comic">
                  <Link to="/">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComingSoon;