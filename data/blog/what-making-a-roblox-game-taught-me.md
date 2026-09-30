---
title: What Making My Own Roblox Game Taught Me
seoTitle: What Making a Roblox Game Taught Me (+1 Nose to Escape)
short: What it taught me
description: "Looking back at making my Roblox game +1 Nose to Escape: the idea, what took longer than expected, what testing changed, and the thumbnail and trailer."
summary: A look back at the first four +1 Nose to Escape devlogs, with what Roblox's own docs say about each step.
published: 2026-10-21
updated: 2026-10-21
series: Devlog
order: 8
draft: true
---
I've been making Roblox videos since 2018. On September 24 I got the first version of my own game, +1 Nose to Escape, running in Roblox Studio, and I've written a devlog for each big step since. This post looks back across the first four, with what Roblox's official Creator Docs say about each part.

**Which version this covers:** the Studio and publishing details are from Roblox's Creator Docs as of late September 2026. The game details are from the testing build in the devlogs. Studio changes often, so a menu might have moved by the time you read this.

> **[ALLAN]** Status and audience (2-3 sentences): is +1 Nose to Escape out on October 21? If yes, give the launch date and whether it's Public or Limited; if not, say where it's at. Also say which maturity label it got, whether it's on your account or a group, and whether you're aiming for Roblox Kids and Select.

## The idea

I play a lot of +1 games, where you grow one stat a little at a time, and I wanted one with a move that felt different. So, Pinocchio. You hold to tell lies, your nose grows toward wherever you're looking, and when you let go it snaps back and pulls you along with it.

The first nose was a smooth, round tube on a flat test map. It didn't look like Pinocchio at all, so I rebuilt it as a blocky wooden branch. [How +1 Nose to Escape started](/blog/how-plus-1-nose-to-escape-started/) has the full story.

> **[ALLAN]** Screenshot: Studio on the first night (September 24) next to the same view in Studio now.

Roblox Studio is a free app for Windows and Mac. A new game starts from a template (Baseplate, Platformer or Racing) with one "start place", which is where players load in when they join.

The code is Luau, a language that comes from Lua 5.1. Studio's code editor fills in words as you type and checks for mistakes and type problems while you write.

## What took longer than expected

The first devlog covers five days, from a plain test map to a wooden nose, cartoon lava and a proper lobby. After that, each big step got its own devlog.

> **[ALLAN]** Your take (2-3 sentences): which part took much longer than you expected, and why? If you can, add a rough time for the big steps (first playable version, map and lobby art, rebuilding the levelling numbers, thumbnail, trailer).

One hold-up from the first devlog: Roblox wouldn't let me upload the lava texture. The docs say anything you import, like an image, has to pass moderation before players can see it in a published game. That usually takes a few hours, and you get a notification explaining why if something's rejected.

My way around it was to have the game draw the lava pattern itself when it loads. No image needs uploading, and it looks the same on every device.

### Publishing takes more than one button

You publish with **File > Publish to Roblox**. Fill in the game's name and info, pick the Creator (the docs recommend a group) and the Devices, then click **Create**.

New games start out private. In **Creator Dashboard > Configure > Settings > Audience** you choose Private, Limited or Public. Limited is for people like playtesters, friends or group members, so it won't show up for the general public.

To publish to a Public or Limited audience, you need an account in good standing that's at least 2 days old, an age check (facial age estimation or a government ID), and a finished Maturity & Compliance Questionnaire. The same rules apply to updates and audience changes, not just the first publish.

The questionnaire sets the game's maturity label, based on the most mature content a player can run into.

| Label | Who it can reach |
|---|---|
| Minimal or Mild | Roblox Kids and Roblox Select accounts |
| Moderate | Roblox Select and standard Roblox (16+) |
| Restricted | Age-verified users 18+ only |

Roblox Kids (ages 5-8) and Roblox Select (ages 9-15) accounts went worldwide on June 16, 2026. Getting a game in front of them takes more than a label: 2-Step Verification, either 2 months in a row of Roblox Plus or Premium or a one-time refundable fee, and an evaluation.

The evaluation starts with the game open only to age-checked players 16 and up. After a safety review, it becomes eligible once it gets 250 unique plays from highly engaged, age-checked users within 60 days.

## What testing changed

[What playtesting changed](/blog/what-playtesting-changed/) has the full list: levelling that was far too easy, a landing hop that threw people into the lava, a zip that was too fast to control, a slower Auto Play, no jumping, and a few cut features.

Studio has three playtest modes. **Test** (F5) puts your avatar at a SpawnLocation, **Test Here** puts it in front of the camera, and **Run** (F8) starts the game with no avatar at all. **Stop** (Shift+F5) resets everything to how it was before the test.

Two of the changes were about phones. The spot where the jump button used to be is now a big **NOSE** button. Phones also use the same layout as a computer now, scaled to fit, because the old buttons covered too much of the screen.

Roblox recommends supporting mouse and keyboard, touch and gamepads. Its Input Action System lets you set up an action once and bind it to each kind of input.

No pile of phones? Studio's Device Simulator (in beta, turned on under **File > Beta Features > New Device Simulator**, then restart Studio) shows how a game looks on phones, tablets, consoles and VR headsets.

> **[ALLAN]** Screenshot: the game on a phone (or in Device Simulator) with the NOSE button showing.

## Making the thumbnail and trailer

The thumbnail took eight versions: a plain screenshot, the riding-the-nose idea, a Blender render that stopped looking like Roblox, two layouts set up back in Studio, and three rounds of final art. [How I made the thumbnail](/blog/how-i-made-the-thumbnail/) shows every one.

A game page can show up to 10 thumbnails, images or videos. Images should be 16:9, ideally 1920x1080 and under 3 MB. Anything that isn't 16:9 gets stretched to fit.

Two of the docs' tips line up with what I wrote in that devlog: keep it clear, and show what players will actually get when they join. They add one the devlog didn't cover. Keep important text off the bottom, because info like the player count can sit on top of it.

With at least 2 active thumbnails (Roblox suggests 2 to 5), Roblox tests them against each other on the Home page and gives more views to the one that works best for each group of players. Roblox says games using this averaged +8.5% qualified play-through rate.

For versions 4 and 5 I set up the shot in Studio. Free camera mode (Left Shift + P during a playtest) detaches the camera from your character and hides the on-screen UI, and Roblox points to it for screenshots and video.

The trailer took nine versions. I built a replay run into the game, so one key press plays through training, a stretch across Stage 3, the win pad, the Nose Shop and the wheel. I recorded that with OBS. [Making the trailer](/blog/making-the-trailer/) covers each change.

On Roblox, a trailer goes on the game page as a video thumbnail. You get 3 uploads a month, and rejected videos still count. Every video is reviewed, and it has to show real gameplay.

| Fine | Not allowed |
|---|---|
| Different camera angles | Gameplay that isn't in your game |
| A game logo | Graphics made to look better than the real game |
| Picked highlights of real gameplay | Voice-overs |
| Music from Roblox's audio catalog | Music with lyrics |

I kept mine under 30 seconds. That was my own choice, not a rule: the docs don't list a maximum length. Video thumbnails also don't play on Xbox, PlayStation or VR headsets right now.

> **[ALLAN]** Your take (2-3 sentences): the one thumbnail lesson and the one trailer lesson you'd pass on, looking back. Also say if the trailer is live on the game page yet.

## My biggest lessons

The devlogs cover what happened. This part is what I'd take into the next game.

> **[ALLAN]** Your 5 biggest lessons (one line each, short reason optional). Include the change from testing that made the biggest difference and how you spotted it, plus what you'd tell someone opening Studio for the first time. End with one line on what you're adding or fixing next in +1 Nose to Escape.

If a Studio menu has moved since this was written, or something here is wrong, tell me through the [contact](/contact/) page and I'll fix it.
