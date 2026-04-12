---
name: ecommerce-system-skill
description: 'Use when building e-commerce features such as product catalogs, cart, checkout, orders, reviews, pricing, and conversion-focused commerce flows.'
---

# E-Commerce System Skill

## Purpose
Build complete, conversion-focused e-commerce systems.

## Use When
- Creating product catalogs and category pages
- Building cart, checkout, and order flows
- Implementing payments and order status handling
- Designing reviews, upsells, and shipping incentives

## Core Features
- Product listing and filtering
- Categories and variants
- Cart persistence
- Guest and authenticated checkout
- Address and order summary flows
- Payment success, failure, and refund handling
- Order storage and tracking
- Review and rating support

## Rules
- Keep cart logic reliable across refreshes
- Save orders before showing success states
- Show shipping, totals, and taxes clearly
- Use empty, loading, and error states everywhere they matter
- Optimize for conversion and clarity
- Avoid hardcoded pricing or checkout assumptions

## Workflow
1. Define product and cart data models.
2. Map checkout and payment states.
3. Connect orders to admin and customer views.
4. Add review and conversion helpers.
5. Verify edge cases and recovery paths.