# CLAUDE.md — fvtt_mosh_1e_hacking

Module ID: `fvtt_mosh_1e_hacking`

## Format

NeDB compendium packs — one JSON document per line in `.db` files under `packs/`. Edit directly as text.

## Pack contents

| Pack file | Content |
|---|---|
| `items_hacking_1e.db` | Hacking equipment items (`type: "item"`) — Decks, Wristcomms, Gear, Single-Use Software |
| `rolltables_hacking_1e.db` | "Loadout: Hacker" (d10, text results) and "Response Table" (d10, text results) |

## Item IDs

| Item | ID |
|---|---|
| KOMPAN-88 'Burndeck' | `BurnDeckKompn88X` |
| Fedorova-Turner 'Onika' Workstation | `OnikaFedTrnWrk4n` |
| Bao-Neumann 'Superdeck' | `SupDekBaoNmnZXo9` |
| Sato Bliss | `SatoBliss12kXcr3` |
| Sinclair 2 | `Sinclr250kXcr9Qw` |
| DVK 'Micro-80X' Wristcomm | `MicWrstDVK80Xp4t` |
| Macrogram 'MX Tattler' | `MXTattlrMgrmX5Qz` |
| König-Seidel 'Series 6' | `Series6KoenigS8b` |
| Brickboy | `BrickboyDngl300c` |
| Faraday Bag | `FaradayBag75crBX` |
| Node Detector | `NodeDetct750crJk` |
| Snatcher | `SnatchrDvic150cr` |
| Swiper System | `SwiprSys200crPrX` |
| CoyBoy | `CoyBoySftw2kcrM8` |
| Icebreaker | `IceBrkrSftw500cX` |
| Keylogger | `KeyLogrSftw1kcrL` |
| Maze | `MazeSoftwar500cN` |
| Ripper2 | `Rippre2Sftw1kcrP` |
| Xmap | `XmapSftwar2kcrT9` |

Full UUID format: `Compendium.fvtt_mosh_1e_hacking.items_hacking_1e.Item.<id>`

## Rolltable IDs

| Table | ID |
|---|---|
| Loadout: Hacker | `HackerLoadoutD10` |
| Response Table | `ResponseTblHkD10` |

## Rules summary

Expert Hacking = normal Intellect (Hacking) Check. Non-expert = Intellect (Hacking) [-] (disadvantage).

**Networks**: interconnected systems of Nodes. Each has a Response modifier (Null to +5).

**Nodes**: defined by Function, Security (Unsecured / Secured / Hardened / Encrypted), and Response.

**Response Table**: rolled on failed Hacking Check. Add network Response to 1d10-1. Range 0–9+.

**User Accounts**: Guest, Employee, Admin, Super User — grant access without a Hacking Check.
