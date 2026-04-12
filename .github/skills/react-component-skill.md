---
name: react-component-skill
description: 'Use when building React components, reusable UI primitives, props design, state management, performance, and clean component structure.'
---

# React Component Skill

## Purpose
Build clean, scalable, reusable React components instead of monolithic UI files.

## Use When
- Creating buttons, cards, modals, inputs, or other reusable components
- Refactoring messy component logic
- Designing component APIs and prop shapes
- Optimizing heavy React UI for fewer re-renders

## Rules
- Prefer functional components
- Keep UI, logic, and API calls separated
- Use local state for local UI and avoid unnecessary global state
- Use `useEffect` only for real side effects
- Use `useReducer` only for complex state
- Keep props small and explicit
- Avoid passing large data objects when simple props are enough
- Use `React.memo` only for heavy components that benefit from it
- Lazy load large components when it helps performance
- Provide loading states, skeletons, hover states, and transitions

## Workflow
1. Identify the smallest reusable component boundary.
2. Define a narrow prop interface.
3. Separate side effects from rendering.
4. Keep implementation readable and well named.
5. Check for unnecessary re-renders and simplify state.

## Examples
- `<Button variant="primary" />`
- `<Card title="Hello" description="World" />`
- `<Input label="Email" />`