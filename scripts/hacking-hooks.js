// Maps loadout roll result (index 0–9) to hacking-pack item IDs and manually-granted items.
// hackingIds: auto-granted from fvtt_mosh_1e_hacking.items_hacking_1e
// other: listed in a chat message for the GM to grant manually
const HACKER_LOADOUTS = [
  {
    label: "'Onika' workstation (Icebreaker, Ripper2)",
    hackingIds: ["OnikaFedTrnWrk4n", "IceBrkrSftw500cX", "Rippre2Sftw1kcrP"],
    other: [],
  },
  {
    label: "SMG, Node Detector, Faraday Bag",
    hackingIds: ["NodeDetct750crJk", "FaradayBag75crBX"],
    other: ["SMG"],
  },
  {
    label: "'Burndeck' (CoyBoy), Vaccsuit, Stimpak",
    hackingIds: ["BurnDeckKompn88X", "CoyBoySftw2kcrM8"],
    other: ["Vaccsuit", "Stimpak"],
  },
  {
    label: "Revolver, Crowbar, 'MX Tattler' (Xmap)",
    hackingIds: ["MXTattlrMgrmX5Qz", "XmapSftwar2kcrT9"],
    other: ["Revolver", "Crowbar"],
  },
  {
    label: "Electronic Tool Set, Stun Baton, Brickboy",
    hackingIds: ["BrickboyDngl300c"],
    other: ["Electronic Tool Set", "Stun Baton"],
  },
  {
    label: "Assorted Tools, 'Burndeck' (Maze)",
    hackingIds: ["BurnDeckKompn88X", "MazeSoftwar500cN"],
    other: ["Assorted Tools"],
  },
  {
    label: "'Micro-80X' Wristcomm, Lockpick Set, Body Cam",
    hackingIds: ["MicWrstDVK80Xp4t"],
    other: ["Lockpick Set", "Body Cam"],
  },
  {
    label: "Radio Jammer, Tranq Pistol, Snatcher",
    hackingIds: ["SnatchrDvic150cr"],
    other: ["Radio Jammer", "Tranq Pistol"],
  },
  {
    label: "Salvage Drone, Explosives & Detonator",
    hackingIds: [],
    other: ["Salvage Drone", "Explosives & Detonator"],
  },
  {
    label: "Cat (Synthetic), 'MX Tattler' (Keylogger)",
    hackingIds: ["MXTattlrMgrmX5Qz", "KeyLogrSftw1kcrL"],
    other: ["Cat (Synthetic)"],
  },
];

async function rollHackerLoadout(actor) {
  const tablePack = game.packs.get("fvtt_mosh_1e_hacking.rolltables_hacking_1e");
  if (!tablePack) {
    ui.notifications.warn("fvtt_mosh_1e_hacking: Hacking Tables compendium not found.");
    return;
  }
  const table = await tablePack.getDocument("HackerLoadoutD10");
  if (!table) return;

  const draw = await table.draw({ displayChat: true });
  const resultIndex = draw.results[0]?.range?.[0] ?? 0;
  const loadout = HACKER_LOADOUTS[resultIndex];
  if (!loadout) return;

  if (loadout.hackingIds.length > 0) {
    const itemPack = game.packs.get("fvtt_mosh_1e_hacking.items_hacking_1e");
    if (itemPack) {
      const docs = await Promise.all(loadout.hackingIds.map(id => itemPack.getDocument(id)));
      const toCreate = docs.filter(Boolean).map(d => d.toObject());
      if (toCreate.length) await actor.createEmbeddedDocuments("Item", toCreate);
    }
  }

  if (loadout.other.length > 0) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div>
        <strong>Hacker Loadout — ${actor.name}</strong><br>
        <em>Rolled:</em> ${loadout.label}<br>
        <em>Grant manually:</em> ${loadout.other.join(", ")}
      </div>`,
    });
  }
}

// Roll Hacker Loadout whenever Expert Hacking is granted to a character.
Hooks.on("createItem", async (item, _options, userId) => {
  if (userId !== game.user.id) return;
  const actor = item.parent;
  if (!actor || actor.type !== "character") return;

  // Hacking loadout trigger — Expert rank only (Master level comes from the Sinclair 2 deck).
  if (item.type === "skill" && item.name === "Hacking" && item.system.rank === "Expert") {
    await rollHackerLoadout(actor);
    return;
  }

  // Sinclair 2 — treat Hacking as Master level while the deck is in inventory.
  if (item.name === "Sinclair 2") {
    const hackingSkill = actor.items.find(i => i.type === "skill" && i.name === "Hacking");
    if (!hackingSkill) return;
    await hackingSkill.update({
      "system.bonus": 20,
      "flags.fvtt_mosh_1e_hacking.pre_sinclair2_bonus": hackingSkill.system.bonus,
    });
    ui.notifications.info(`${actor.name}: Sinclair 2 upgrades Hacking to Master level.`);
  }
});

// Sinclair 2 removed — restore the Hacking skill bonus to its prior Expert value.
Hooks.on("deleteItem", async (item, _options, userId) => {
  if (userId !== game.user.id) return;
  if (item.name !== "Sinclair 2") return;
  const actor = item.parent;
  if (!actor || actor.type !== "character") return;

  const hackingSkill = actor.items.find(i => i.type === "skill" && i.name === "Hacking");
  if (!hackingSkill) return;

  const prior = hackingSkill.flags?.fvtt_mosh_1e_hacking?.pre_sinclair2_bonus ?? 15;
  await hackingSkill.update({
    "system.bonus": prior,
    "flags.fvtt_mosh_1e_hacking.-=pre_sinclair2_bonus": null,
  });
  ui.notifications.info(`${actor.name}: Sinclair 2 removed. Hacking restored to Expert level.`);
});
