---
name: performance-optimization-skill
description: 'Use when improving frontend performance, reducing re-renders, adding lazy loading, skeletons, image optimization, and perceived speed.'
---

# Performance Optimization Skill

## Purpose
Keep the app fast, responsive, and stable under real usage.

## Use When
- Optimizing slow pages or heavy components
- Adding lazy loading or code splitting
- Improving image delivery and rendering behavior
- Removing unnecessary re-renders

## Core Techniques
- Lazy load components and heavy routes
- Use skeleton loaders instead of blank screens
- Keep API work out of rendering paths
- Prefer efficient state boundaries
- Avoid overusing effects and derived state
- Optimize images and asset sizes

## Rules
- Measure before and after when possible
- Improve perceived speed, not just raw speed
- Keep loading states visible
- Avoid premature optimization that harms readability

## Workflow
1. Identify the bottleneck.
2. Separate expensive work from the render path.
3. Add lazy loading or caching where useful.
4. Validate the UX under slow network conditions.
5. Confirm the change actually reduced cost.