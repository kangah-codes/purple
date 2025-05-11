---
title: Building Purple
description: A peek behind the scenes into how Purple, a personal finance and budgeting app, came to life—from the first line of code to thoughtful engineering trade-offs.
blogImage: accra.jpg
slug: building-purple
date: 10th May, 2025
tags:
  - engineering
  - budgeting
  - personal finance
  - react native
  - go
---

**From a budgeting frustration to a full-blown app—here’s how Purple was born.**

> “The only way to do great work is to love what you do.”
>
> — Steve Jobs

# The Origin Story

I started building Purple because I needed a finance app that worked for me—specifically, one that understood local banking, worked offline, and gave me clarity without overwhelming graphs.

Purple began as a weekend prototype. It wasn’t even called "Purple" at the time. The first version had just one screen—a list of transactions stored in a JSON file. Fast-forward a few months, it now supports:

- Recurring transactions
- SMS parsing from banks and Momo wallets
- Beautiful UI with FlashList performance optimizations
- Real-time syncing using a Go backend and PostgreSQL

# Engineering Decisions

From day one, the goal was to make Purple **fast**, **lightweight**, and **offline-first**.

Here are some of the decisions made:

- **Frontend**: Built with React Native + Expo for quick iteration and easy deployment across Android and iOS.
- **Backend**: Written in Go to keep things fast, with RESTful APIs and proper caching via Redis.
- **Database**: PostgreSQL, because it’s stable, powerful, and well-supported on managed hosts.
- **State Management**: Zustand instead of Redux—minimal boilerplate, fast, and React-friendly.
- **UI**: Tailwind-like utility-first styles with custom components for lists, cards, and inputs.

# Features We’re Proud Of

- **Offline-first architecture** with SQLite fallback syncing to the cloud
- **Auto-import of bank and MoMo SMS**—no manual entry needed
- **Smart recurring transactions**—monthly bills don’t need to be re-entered
- **Private by default**—all data stays on device unless you choose to sync

![Purple App Screenshot](/blog/account_screen.png)

# What’s Next?

Purple is just getting started.

- We’re working on bank integrations via open banking APIs.
- A daily expense summary notification is in the works.
- And of course—Dark Mode is coming. 👀
