**Install in Foundry VTT:** `https://raw.githubusercontent.com/mechanoid23/fvtt_mosh_1e_hacking/main/module.json`

> Hacking rules and equipment for Mothership 1e. Expert Hacking skill required for standard rolls; all other characters attempt at disadvantage.

## Contents

- **19 hacking equipment items**: Decks (Burndeck, Onika, Superdeck, Sato Bliss, Sinclair 2), Wristcomms (Micro-80X, MX Tattler, Series 6), Gear (Brickboy, Faraday Bag, Node Detector, Snatcher, Swiper System), and Single-Use Software (CoyBoy, Icebreaker, Keylogger, Maze, Ripper2, Xmap)
- **Loadout: Hacker** — d10 starting loadout table
- **Response Table** — d10 network response table (add the network's Response modifier)

## Hacking Rules Overview

### Simple Hacking

An Intellect (Hacking) Check. If expert: normal roll. If not: roll at [-] (disadvantage).

### Networks

A NETWORK is an interconnected system of NODES. Networks have a Response modifier (Null to +5) that adds to the Response Table roll whenever a hacker fails a Hacking Check.

### Nodes

Each node has:
- **Function**: what the node does (Access Point, Data Storage, Router, Firewall, Infrastructure Control, Uplink, Terminal)
- **Security**: Unsecured (no check) / Secured (Hacking Check) / Hardened (Hacking [-]) / Encrypted (requires PEK)
- **Response**: how much the node adds to the network's Response modifier on a failed check

### Response Table (1d10-1 + Response modifier)

| Roll | Result |
|---|---|
| 0 | Warning message. Network's RESPONSE +1 |
| 1 | Device is remotely powered off |
| 2 | USER ACCOUNT locked out for 1d10 hours |
| 3 | Security member dispatched. Arrives in 1d10 rounds |
| 4 | Network creates dummy directories; security team sent |
| 5 | Network and all linked networks locked down 1d10 hours |
| 6 | Network and linked networks increase security level by 1 |
| 7 | All linked networks increase RESPONSE +1 |
| 8 | Facility blackout. Non-essential electronics powered down |
| 9+ | TACTICAL RESPONSE TEAM deployed. Arrives in 1d5 rounds |

### User Accounts

Obtaining a user's credentials (password, badge, PEK) grants access without a Hacking Check, limited by account permissions: Guest → Employee → Admin → Super User.

## Licensing

This module is an unofficial community project for Mothership RPG (Tuesday Knight Games). Released under the MIT License.
