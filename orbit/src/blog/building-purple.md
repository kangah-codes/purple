---
title: Building Purple
description: A peek behind the scenes into how Purple, a personal finance and budgeting app, came to life.
blogImage: building-purple/creating-purple.png
slug: building-purple
date: 10th May, 2025
featured: true
tags:
    - mobile apps
    - budgeting
    - personal finance
    - react native
    - go
---

# The Origin Story

Picture this, you're frustrated with a tool that just doesn't hit the mark, UI or features or otherwise. None of the stuff you've used ticked all the boxes, and you find yourself thinking. For me that frustration was mostly centered around budgeting apps. On the quest to building better financial habits, I blazed through a bunch of apps. After switching to Android, I found myself constantly searching for an app that could truly tick all the boxes for me. The good ones were often behing a paywall, littered with ads, or just extremely outdated UI/UX which evoked early 2010s app design vibes (in my opinion!). since I did not want to pay for something I thought I could build for myself, I said "why not?" and set out to build my own. After all, how hard could it be?

Purple began as a weekend prototype, a personal project I initially called "Spendwise." My sole aim was to create an app I would genuinely enjoy using. This meant that early UX decisions were heavily influenced by my own preferences and what I expected from a budgeting app. The idea of releasing it to others wasn't even on my radar. It was only after a few months of development a few coworkers of mine recommended that Purple could be a useful tool for others as well. I decided to pivot into building Purple as an actual product, and not just a throwaway personal project.

<br/>

# Engineering Purple

Prior to Purple, my experiece with mobile app development was minimal. I'd dabbled with React Native and Flutter here and there a few years prior, but never brought a project to completion. Given my existing experience with React, React Native felt like the most natural choice for the frontend, given that I was (and still am!) a huge Flutter hater. Sidebar, Flutter syntax is probably some of the ugliest I've ever seen, and I just can't get over it. React Native felt more like a natural extension of HTML ergonomics. The goal was simple, build fast, iterate quickly, and keep friction to a minimum.

Purple was initially planned to follow an offline only model, with no interaction whatsoever with a backend. However, after a few design iterations, I decided to pivot to an only only model (which, in hindsight was a misinformed decision). I decided to build a simple RESTful API using Go for the backend (another language I've been learning, which was a good learning opportunity), with a PostgreSQL database as the storage engine. With some Redis here and there as a caching layer of some sorts. I spent the better parts of 10 months building and iterating on the backend, only to dump it last-minute in favour of an offline first model. Going offline first meant I could focus more on building the app experience, without worrying about the complexities of a backend. I was already getting way ahead of myself and thinking of how to scale for thousands of users, with only 1 active user (me!).

![Gru Meme](/blog/building-purple/meme-1.jpg)

After admittedly wasting too much time on the backend (and seeing how much it would cost to host a backend), I once again had to pivot back to an offline-first model. This meant I had to pull out all the guts I had built for the backend, and replacing that with an offline adapter, without having to refactor the entire app. Thankfully, I had built some of the data fetching logic in such a way that I could easily swap in services for a local data store. SQLite was the obvious choice for local storage, given its simplicity and battle tested reliability.

<br/>

# The Design Evolution

My design process begain by kinda just visualising what I expected the finished app to look like in my mind, and then browsing communities like Dribbble and Behance for further inspiration. One of my main goals was to create something that was not only functional, but visually appealing to some extent. Despite having no formal background in UI design, I enjoy the challenge of crafting designs in my mind, and working towards them.

The basic design had to fulfill some core functionalities;

-   User should be able to create and view transactions (obviously!)
-   User should be able to create accounts
-   User should be able to create budgets

And with these 3 main requirements, I set out building and iterating on the design. I went through quite a few designs, before settling on something I was happy with. of course, since Purple is still in a beta phase, the design will still evolve significantly over time. There are a few designs I plan on implementing once I have a stable release. Inspired by Google's Material You design language, I wanted to go for a playful and vibrant design, featuring rounded corners, and fun and quirky interfaces. I'm not very good at coding animations, so the current version of the app feels a bit static, but I plan on eventually overhauling the animations in the app to make it feel more lively and responsive.

<div style="display: flex; gap: 10px; margin: 20px 0;">
  <img
    src="/blog/building-purple/old-iphone-mockup.png"
    alt="Purple App Screenshot"
    style="height: 300px; width: auto; object-fit: cover; flex: 1;"
  />
  <img
    src="/blog/building-purple/old-pixel-mockup.png"
    alt="Purple App Screenshot gfdgdfsjklg;sdf gdfs gdf"
    style="height: 300px; width: auto; object-fit: cover; flex: 1;"
  />
  <img
    src="/blog/building-purple/new-pixel-mockup.png"
    alt="Purple App Screenshot"
    style="height: 300px; width: auto; object-fit: cover; flex: 1;"
  />
</div>

<br/>

# The Beta-verse 🧪

Purple is going to be released in a closed beta for now (not really closed, if you're interested you can grab the APK from github, or build it yourself). Feature wise, Purple is still a work in progress, but it has all the main core features which make it usable as a complete app (I've been using it for the past couple of weeks). There are also some unresolved bugs in there I want to release into the wild. After collecting valuable feedback from beta users, I can plan accordingly and move forward to prepare for a public beta and a stable release later this year if all goes accordingly.

<br/>

# What’s Next?

We're is just getting started, in the coming months we'll be bringing Purple to the Play Store. Checkout the [roadmap](/roadmap) for the direction we're heading to.
