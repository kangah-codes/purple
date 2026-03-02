---
title: Building Purple
description: Why I Built Purple - Turning Frustration into an app
blogImage: building-purple/creating-purple.png
slug: building-purple
date: 10th May, 2025
featured: false
tags:
    - mobile apps
    - budgeting
    - personal finance
    - react native
    - go
---

# The Origin Story

For quite sometime I've been searching for the perfect budgeting app. I've installed and used over 10 regularly. Some seemed promising, but always fell short in subtle yet important ways. The ones with the best features were often behind paywalls, while others were bogged down with ads or had extremely outdated UI. It didn’t take long for the frustration to set in. I wasn’t just looking for a tool that worked, I needed something I’d actually enjoy using regularly, especially if I was serious about building better financial habits.

After switching to Android, the search only got more frustrating. I couldn’t find a single app that felt modern, intuitive, and actually aligned with how I wanted to manage my money. At some point, I thought: “If none of these work for me, maybe I can just build my own.”

That’s how Purple started. What began as a weekend prototype (originally called Spendwise) was purely a personal project. I wasn’t trying to launch a complete app or product. I just wanted something that was tailored to my specific use case, and I’d enjoy using every day. I focused on simple UX decisions guided entirely by my own habits, needs, and expectations.

As the codebase grew, it became more than just a side project. A few coworkers got a look at it and gave very positive feedback. Their reactions made me realise something, maybe I wasn’t the only one feeling let down by existing budgeting apps. That’s when I decided to take it seriously and pushed to evolve Purple from a personal experiment into a "real" product.

Purple is built on a simple idea: budgeting tools should be modern, practical, and help people take control of their finances. It’s still a work in progress, but my goal is to lay a solid foundation I can keep improving upon. I’m not trying to build an all in one app for everyone (just something thoughtful and focused, built for myself).

<br/>

# Engineering Purple

Before working on Purple, my experience with mobile development was pretty limited. I’d played around with React Native and Flutter in the past, but never actually shipped anything. Since I already had a solid React background, React Native was the obvious choice. It felt familiar and comfortable, and a natural evolution of React ergonomics. That made it easy to move fast and iterate quickly.

The original plan was to build Purple as a fully offline app without a backend, with no online syncing, just local storage. But after a few iterations, I made the (in hindsight, premature) decision to switch to an online only model. I figured it would help me learn more about backend development, so I spun up a RESTful API using Go (which I was learning at the time), with PostgreSQL as the main database and some Redis sprinkled in for caching here and there.

I ended up spending nearly ten months building and refining that backend, only to scrap it in the end. Why? Because I realized I was over engineering a solution for a product that hadn't even been released into peoples hands, and it had 1 active user (me!). I was too focused on scale and infrastructure when I should’ve been focused on the app experience. And honestly, when the server bills started adding up, it was a wake up call.

![Gru Meme](/blog/building-purple/meme-1.jpg)

So, I pivoted back to the original offline first approach. This time, for good. Thankfully, I had designed the data layer in a way that made it easy to swap out the backend API calls for a local storage implementation without a massive refactor. I went with SQLite, it’s lightweight, reliable, and more than capable of handling what Purple needs. This shift let me zero in on what really mattered to get this app out there as fast as I could (Spoiler alert, I missed my 6 month release target).

<br/>

# The Design Evolution

My design process started pretty informally. I mostly approach UI design by just imagining how I want the finished app to look and feel, then search online to gather inspiration and refine the mental sketches I come up with. One of my main goals was to build something that wasn’t just functional, but also visually appealing to some extent.

I don’t have a formal background in UI or visual design, but I’ve always enjoyed the challenge of translating ideas in my head into something real. It’s a bit like problem solving through visuals, and that’s something I’ve grown to love.

At its core, the initial design needed to support three main features (anything else would be a bonus):

-   Create and view transactions (obviously!)
-   Create accounts
-   Create budgets

With those basics in place, I started prototyping and iterating. I went through quite a few versions before landing on a layout and style that felt right to me. That said, Purple is still in beta, and I fully expect the design to keep evolving. There are several UI improvements I’m holding off on until the app approaches a more stable release.

As a Google Pixel fanboy, I also plan to draw a lot of inspiration from Google’s Material Expressive design language. I want Purple to feel vibrant and playful, with rounded corners, soft edges, and a touch of personality. Right now, the app feels a bit static, mostly because I haven’t spent much time implementing animations and some more visual sugar (I’m admittedly not great at coding animations). But bringing more motion and responsiveness into the interface is definitely on the roadmap. The goal is to eventually make Purple feel as dynamic and friendly as it looks.

![Device Mockups](/blog/building-purple/mockups.png)

<br/>

# Into the Betaverse 🧪

Purple is currently available as a beta. If you're curious to try it out, you can grab the APK from GitHub or even build it yourself from source.

Feature wise, Purple is still very much a work in progress. That said, it already includes the core functionality needed to use it as a complete budgeting app (I've been using it myself for the past few weeks). There are still some rough edges and a few bugs I want to release into the wild and learn from.

The goal with this beta is to gather meaningful feedback from early users, understand what’s working (and what’s not), and use that insight to shape the next phase of development.

<br/>

# What’s Next?

I'm just getting started, in the coming months I'll be working to bring Purple to the Play Store. If everything goes to plan, I’ll move toward a stable release later this year. Checkout the [roadmap](https://purpleapp.featurebase.app/roadmap) for the direction we're heading to.
