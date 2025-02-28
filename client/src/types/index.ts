import type { ReactNode } from "react";
export * from './drag-types';

// Navigation item interface for sidebar
export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  requiresAuth?: boolean;
  permission?: string;
} 