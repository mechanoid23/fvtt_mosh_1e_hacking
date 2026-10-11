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

  // Burndeck — flag: all nodes at +1 Response (displayed as reminder in Hacking Check macro).
  if (item.name === "KOMPAN-88 'Burndeck'") {
    await actor.setFlag("fvtt_mosh_1e_hacking", "hasBurndeck", true);
    ui.notifications.info(`${actor.name}: Burndeck equipped — all nodes at +1 Response.`);
    return;
  }

  // Sato Bliss — flag: Hardened nodes treated as Secured.
  if (item.name === "Sato Bliss") {
    await actor.setFlag("fvtt_mosh_1e_hacking", "hasSatoBliss", true);
    ui.notifications.info(`${actor.name}: Sato Bliss equipped — Hardened nodes treated as Secured.`);
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
    return;
  }

  // Single-Use Software — prompt to assign to a deck or wristcomm in the character's inventory.
  if (item.flags?.fvtt_mosh_1e_hacking?.category === "single-use-software") {
    const carriers = actor.items.filter(i =>
      ["deck", "wristcomm"].includes(i.flags?.fvtt_mosh_1e_hacking?.category) && i.id !== item.id
    );
    if (carriers.length === 0) return;
    const opts = carriers.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
    const deckId = await foundry.applications.api.DialogV2.wait({
      window: { title: "Assign Software to Deck" },
      content: `<div style="padding:4px">
        <label>Load <strong>${item.name}</strong> onto which deck?</label><br>
        <select id="deck-sel" style="width:100%;margin-top:6px">
          <option value="">— Unassigned —</option>
          ${opts}
        </select>
      </div>`,
      buttons: [
        { action: "ok", label: "Assign", default: true,
          callback: (_e, _b, dlg) => dlg.querySelector("#deck-sel").value || null },
        { action: "skip", label: "Skip", callback: () => null },
      ],
    });
    if (deckId) await item.setFlag("fvtt_mosh_1e_hacking", "loadedOn", deckId);
  }
});

const CATEGORY_LABELS = {
  deck: "Deck",
  wristcomm: "Wristcomm",
  gear: "Gear",
  "single-use-software": "Single-Use Software",
};

// Render equipment type (and loaded-deck name for software) on hacking item sheets.
Hooks.on("renderItemSheet", (app, html, _data) => {
  const item = app.item;
  const category = item?.flags?.fvtt_mosh_1e_hacking?.category;
  if (!category) return;

  const label = CATEGORY_LABELS[category] ?? category;
  let sub = "";
  if (category === "single-use-software") {
    const loadedOnId = item.flags?.fvtt_mosh_1e_hacking?.loadedOn;
    if (loadedOnId && item.parent) {
      const deck = item.parent.items.get(loadedOnId);
      if (deck) sub = ` &mdash; ${deck.name}`;
    }
  }

  const badge = `<p class="hacking-item-type" style="text-align:center;font-size:0.72em;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0 0 6px 0">${label}${sub}</p>`;
  const $html = html.jquery ? html : $(html);
  const $anchor = $html.find("h1, .item-name, .document-name").first();
  if ($anchor.length) $anchor.after(badge);
  else $html.find(".window-content").prepend(badge);
});

// Inventory removal hooks — restore state when hacking decks are removed.
Hooks.on("deleteItem", async (item, _options, userId) => {
  if (userId !== game.user.id) return;
  const actor = item.parent;
  if (!actor || actor.type !== "character") return;

  if (item.name === "KOMPAN-88 'Burndeck'") {
    await actor.unsetFlag("fvtt_mosh_1e_hacking", "hasBurndeck");
    ui.notifications.info(`${actor.name}: Burndeck removed.`);
    return;
  }

  if (item.name === "Sato Bliss") {
    await actor.unsetFlag("fvtt_mosh_1e_hacking", "hasSatoBliss");
    ui.notifications.info(`${actor.name}: Sato Bliss removed.`);
    return;
  }

  if (item.name === "Sinclair 2") {
    const hackingSkill = actor.items.find(i => i.type === "skill" && i.name === "Hacking");
    if (!hackingSkill) return;
    const prior = hackingSkill.flags?.fvtt_mosh_1e_hacking?.pre_sinclair2_bonus ?? 15;
    await hackingSkill.update({
      "system.bonus": prior,
      "flags.fvtt_mosh_1e_hacking.-=pre_sinclair2_bonus": null,
    });
    ui.notifications.info(`${actor.name}: Sinclair 2 removed. Hacking restored to Expert level.`);
  }
});
