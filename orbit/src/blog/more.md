---
title: Building Purple
description: A peek behind the scenes into how Purple, a personal finance and budgeting app, came to life—from the first line of code to thoughtful engineering trade-offs.
blogImage: creating-purple.png
slug: building-purple
date: 10th May, 2025
featured: true
---

**From a budgeting frustration to a full-blown app—here’s how Purple was born.**

Device Mockup created from <a href="https://deviceframes.com/templates/google-pixel-6">Google Pixel 6 mockups</a>

The challenge was building a finance app I would _enjoy_ using. After making the switch to android, it was hard to find such apps which matched their iOS counterparts in terms of features & UI. The good ones were mostly paid, and being the brokie that I am, I decided, "Why not build my own?", how hard could it be?

# The Origin Story

Purple began as a weekend sort of prototype. The first iteration of the design was called "Spendwise", and I unfortunately found a budgeting app with that name. The first version had just one screen—a list of transactions stored in a JSON file. Fast-forward a few months, it now supports:

-   Recurring transactions
-   SMS parsing from banks and Momo wallets
-   Beautiful UI with FlashList performance optimizations
-   Real-time syncing using a Go backend and PostgreSQL

# Engineering Decisions

Purple has evolved significantly since the first commit. It was initially intended to be an offline-first app, then I pivoted to online only, then finally back to offline-first, eventually adding 7+ months of unnecessary development time. As the app grows it will eventually settle on a hybrid model.

Here are some of the decisions made:

-   **Frontend**: Built with React Native + Expo for quick iteration and easy deployment.
-   **Backend**: A RESTful API housing the backend monolith.
-   **Database**: PostgreSQL, because it’s stable, powerful, and well-supported on managed hosts.

# Features We’re Proud Of

-   **Offline-first architecture** with SQLite fallback syncing to the cloud
-   **Auto-import of bank and MoMo SMS**—no manual entry needed
-   **Smart recurring transactions**—monthly bills don’t need to be re-entered
-   **Private by default**—all data stays on device unless you choose to sync

The images need to be wrapped without quotes and can be placed directly in the markdown. Here's the corrected version:

<div style="display: flex; gap: 50px; margin: 20px 0;">
  <img
    src="/blog/building-purple/old-pixel-mockup.png"
    alt="Purple App Screenshot"
    style="height: 300px; width: auto; object-fit: cover; flex: 1;"
  />
  <img
    src="/blog/building-purple/new-pixel-mockup.png"
    alt="Purple App Screenshot"
    style="height: 300px; width: auto; object-fit: cover; flex: 1;"
  />
</div>

# What’s Next?

We're is just getting started. Checkout the roadmap for the direction we're heading to.
