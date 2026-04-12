---
name: ai-system-thinking-skill
description: 'Use when deciding architecture, flow, edge cases, system boundaries, failures, and production thinking across frontend, backend, and data.'
---

# AI System Thinking Skill

## Purpose
Think like a senior engineer and build systems, not isolated features.

## Use When
- Breaking a feature into layers and dependencies
- Planning end-to-end user flows
- Checking failure modes and edge cases
- Designing for production rather than demos

## Always Consider
- UI
- Logic
- Data
- Flow
- Failure handling
- User recovery

## Rules
- Ask what happens on refresh, timeout, or partial failure
- Design for empty, loading, and error states
- Keep boundaries explicit
- Avoid hardcoded behavior where data should drive the app
- Build modular systems that can evolve

## Workflow
1. Map the complete system.
2. Identify dependencies and failure points.
3. Define safe defaults and recovery paths.
4. Wire the layers together cleanly.
5. Review the design for scalability.