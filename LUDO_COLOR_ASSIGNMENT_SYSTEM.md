# Ludo Color Assignment System (LCAS) Specification
**Status**: Authoritative Reference | **Role**: Senior Multiplayer Game Architect

This document defines the strict color consistency, asset matching, and network synchronization rules for the Luxury Ludo game. All code, renderer classes, UI components, and multiplayer sync routines must conform to this specification.

---

## 1. Player Color Logic & Seating
* **Single Assignment**: Upon matchmaking completion, the server assigns exactly one unique `PlayerColor` (`RED`, `BLUE`, `GREEN`, `YELLOW`) to each player.
* **Match Permanence**: The assigned color is immutable and remains fixed until the match concludes. No component or server event may alter a player's color mid-game.
* **Opponent Seating (Duel)**: In 2-Player (1v1) matches, opposite seating colors (e.g., `RED` vs `YELLOW`, or `BLUE` vs `GREEN`) are preferred to ensure balanced board access.

---

## 2. Dynamic Player & Board Ownership
Each player's assigned color (`PlayerColor`) dictates absolute ownership over the following assets and board positions:

| Player Color | Home Yard | Start Coordinate | Home Path Corridor | Finish Target |
| :--- | :--- | :--- | :--- | :--- |
| **RED** | Top-Left Yard | `col: 1, row: 6` | `col: 1..5, row: 7` | Left Home Center |
| **BLUE** | Bottom-Left Yard | `col: 6, row: 13` | `col: 7, row: 13..9` | Bottom Home Center |
| **GREEN** | Top-Right Yard | `col: 8, row: 1` | `col: 7, row: 1..5` | Top Home Center |
| **YELLOW** | Bottom-Right Yard | `col: 13, row: 8` | `col: 13..9, row: 7` | Right Home Center |

---

## 3. Strict Token Controls
* **Exclusive Ownership**: Each player owns exactly four tokens (`T1`, `T2`, `T3`, `T4`) matching their player color.
* **Zero Cross-Movement**: A player's controller can only select and move their own color tokens. All input actions attempting to move opponent tokens must be rejected client-side and validated server-side.
* **Visual Representation**: The tokens must display the active player color as a high-fidelity 3D asset or glossy gradient fallback pawn.

---

## 4. UI Color Synchronization Rules
Every visual element representing or reacting to a player's status must match their assigned color:
* **Avatar & Banners**: Corner profile borders, nameplates, and banner assets must be colored according to the player's active color.
* **Dice Frames & Glows**: Active turn dice containers must use the corresponding royal frames (`red_royal_frame.png` for RED, `cyan_royal_frame.png` for BLUE, `green_royal_frame.png` for GREEN, `gold_royal_frame.png` for YELLOW). Bouncing dice shadows and landing glows must use matching radial colors.
* **Turn & Move Indicators**: The turn indicator arrow, path selection coordinates, and hover selection rings must utilize the exact hex code of the active player's color.

---

## 5. Authoritative Multiplayer Synchronization
* **Server Authority**: The server is the single source of truth for color configuration.
* **Client Identicality**: The server transmits the exact same seating mapping to all connected sockets. Local client rendering logic must use the server's mapping index so that all clients see the identical game state.

---

## 6. Winner & Victory Ceremony UI
The celebration UI must dynamically style all elements using only the winner's color:
* **Trophy & Sparkles**: The victory trophy must shine with a radial glow of the winning color.
* **Confetti & Particle Bursts**: Confetti and victory explosion rays must be colored with the winning color (e.g., Crimson for RED, Amber for YELLOW, Emerald for GREEN, Royal Blue for BLUE).
* **Victory Crown**: The winner's avatar must be highlighted with a crown light pulse of the winning color.
