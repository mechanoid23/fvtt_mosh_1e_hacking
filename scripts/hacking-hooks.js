// Maps loadout roll result (index 0–9) to items across module packs.
// Each entry in `items` is { pack: "<compendium-key>", id: "<16-char ID>" }.
const HACKER = "fvtt_mosh_1e_hacking.items_hacking_1e";
const WPN    = "fvtt_mosh_1e_psg.items_weapons_1e";
const EQP    = "fvtt_mosh_1e_psg.items_equipment_1e";
const MED    = "fvtt_mosh_1e_psg.items_medical_care_1e";
const ARM    = "fvtt_mosh_1e_psg.items_armor_1e";

const HACKER_LOADOUTS = [
  {
    label: "'Onika' workstation (Icebreaker, Ripper2)",
    items: [
      { pack: HACKER, id: "OnikaFedTrnWrk4n" },
      { pack: HACKER, id: "IceBrkrSftw500cX" },
      { pack: HACKER, id: "Rippre2Sftw1kcrP" },
    ],
  },
  {
    label: "SMG, Node Detector, Faraday Bag",
    items: [
      { pack: WPN,    id: "boqUPFJbGBET0Th5" },
      { pack: HACKER, id: "NodeDetct750crJk" },
      { pack: HACKER, id: "FaradayBag75crBX" },
    ],
  },
  {
    label: "'Burndeck' (CoyBoy), Vaccsuit, Stimpak",
    items: [
      { pack: HACKER, id: "BurnDeckKompn88X" },
      { pack: HACKER, id: "CoyBoySftw2kcrM8" },
      { pack: ARM,    id: "MW8GRF9grFvsAGcR" },
      { pack: MED,    id: "EkA39xa1vq6SghtP" },
    ],
  },
  {
    label: "Revolver, Crowbar, 'MX Tattler' (Xmap)",
    items: [
      { pack: WPN,    id: "TlUbDBpALeBvrVZb" },
      { pack: WPN,    id: "1fpZrZ5uN7Ad9XvX" },
      { pack: HACKER, id: "MXTattlrMgrmX5Qz" },
      { pack: HACKER, id: "XmapSftwar2kcrT9" },
    ],
  },
  {
    label: "Electronic Tool Set, Stun Baton, Brickboy",
    items: [
      { pack: EQP,    id: "4YWdcVso4Gp3luql" },
      { pack: WPN,    id: "rK9PSJLqUDDd5nO8" },
      { pack: HACKER, id: "BrickboyDngl300c" },
    ],
  },
  {
    label: "Assorted Tools, 'Burndeck' (Maze)",
    items: [
      { pack: EQP,    id: "H3tGGe3I8lzbP8bS" },
      { pack: HACKER, id: "BurnDeckKompn88X" },
      { pack: HACKER, id: "MazeSoftwar500cN" },
    ],
  },
  {
    label: "'Micro-80X' Wristcomm, Lockpick Set, Body Cam",
    items: [
      { pack: HACKER, id: "MicWrstDVK80Xp4t" },
      { pack: EQP,    id: "GPeQpFIBuQIrKzX0" },
      { pack: EQP,    id: "EuaVN5enhMTMonXh" },
    ],
  },
  {
    label: "Radio Jammer, Tranq Pistol, Snatcher",
    items: [
      { pack: EQP,    id: "qSyt35aUMjJMDHkz" },
      { pack: WPN,    id: "pioKk5wqRXEHxkMy" },
      { pack: HACKER, id: "SnatchrDvic150cr" },
    ],
  },
  {
    label: "Salvage Drone, Explosives & Detonator",
    items: [
      { pack: EQP, id: "81GOG2CoJ1E9HoeR" },
      { pack: EQP, id: "u2rWP6CUonlVFx8F" },
    ],
  },
  {
    label: "Cat (Synthetic), 'MX Tattler' (Keylogger)",
    items: [
      { pack: EQP,    id: "68X3lspUGatbSqQa" },
      { pack: HACKER, id: "MXTattlrMgrmX5Qz" },
      { pack: HACKER, id: "KeyLogrSftw1kcrL" },
    ],
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

  // Group by pack so we only call getDocument once per pack.
  const byPack = {};
  for (const { pack, id } of loadout.items) {
    (byPack[pack] ??= []).push(id);
  }

  const toCreate = [];
  const missing  = [];
  for (const [packKey, ids] of Object.entries(byPack)) {
    const pack = game.packs.get(packKey);
    if (!pack) { missing.push(...ids); continue; }
    const docs = await Promise.all(ids.map(id => pack.getDocument(id)));
    for (const doc of docs) {
      if (doc) toCreate.push(doc.toObject());
      else missing.push(ids[docs.indexOf(doc)]);
    }
  }

  if (toCreate.length) await actor.createEmbeddedDocuments("Item", toCreate);

  if (missing.length) {
    ui.notifications.warn(
      `Hacker Loadout: ${missing.length} item(s) could not be found in their compendium pack.`
    );
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
          callback: (_e, _b, dlg) => (dlg.element ?? dlg).querySelector("#deck-sel")?.value || null },
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
