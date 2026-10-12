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
      { pack: EQP,    id: "EkA39xa1vq6SghtP" },
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

});

const CATEGORY_LABELS = {
  deck: "Deck",
  wristcomm: "Wristcomm",
  gear: "Gear",
  "software": "Single-Use Software",
};

// Render equipment type and deck-assignment controls on hacking item sheets.
Hooks.on("renderItemSheet", (app, html, _data) => {
  const item = app.item;
  const category = item?.flags?.fvtt_mosh_1e_hacking?.category;
  if (!category) return;

  const label = CATEGORY_LABELS[category] ?? category;
  const badge = `<p class="hacking-item-type" style="text-align:center;font-size:0.72em;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#888;margin:2px 0 4px 0">${label}</p>`;
  const $html = html.jquery ? html : $(html);
  // Insert between the name header and the qty/weight/value block.
  const $anchor = $html.find(".circle-statwrapper-horizontal").first();
  if ($anchor.length) $anchor.before(badge);
  else $html.find(".sheet-header").first().after(badge);

  // Loaded-software list for decks and wristcomms embedded on a character.
  if (["deck", "wristcomm"].includes(category) && item.isEmbedded && item.parent?.type === "character") {
    const loaded = item.parent.items.filter(i =>
      i.flags?.fvtt_mosh_1e_hacking?.category === "software" &&
      i.flags?.fvtt_mosh_1e_hacking?.loadedOn === item.id
    );
    const slotHtml = loaded.length
      ? loaded.map(s => `<strong>${s.name}</strong>`).join(", ")
      : `<span style="color:#666;font-size:0.8em;font-style:italic">No software loaded</span>`;
    const $slots = $(`<div style="text-align:center;margin:0 8px 6px">Loaded: ${slotHtml}</div>`);
    $html.find(".hacking-item-type").after($slots);
  }

  // Deck-assignment button for single-use software embedded on a character.
  if (category !== "single-use-software" || !item.isEmbedded || item.parent?.type !== "character") return;

  const actor = item.parent;
  const loadedOnId = item.flags?.fvtt_mosh_1e_hacking?.loadedOn;
  const currentDeck = loadedOnId ? actor.items.get(loadedOnId) : null;
  const btnLabel = currentDeck ? `Deck: ${currentDeck.name}` : "Assign to Deck";

  const $btn = $(`<button type="button" class="hacking-assign-btn" style="display:block;width:calc(100% - 16px);margin:0 8px 6px;font-size:0.8em">${btnLabel}</button>`);
  $btn.on("click", async (evt) => {
    evt.preventDefault();
    const carriers = actor.items.filter(i =>
      ["deck", "wristcomm"].includes(i.flags?.fvtt_mosh_1e_hacking?.category)
    );
    if (!carriers.length) {
      ui.notifications.warn("No hacking decks or wristcomms in inventory.");
      return;
    }
    const opts = carriers.map(d =>
      `<option value="${d.id}"${d.id === loadedOnId ? " selected" : ""}>${d.name}</option>`
    ).join("");
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: "Assign Software to Deck" },
      content: `<div style="padding:4px">
        <label>Load <strong>${item.name}</strong> onto:</label><br>
        <select id="deck-sel" style="width:100%;margin-top:6px">
          <option value="">— Unassigned —</option>
          ${opts}
        </select>
      </div>`,
      buttons: [
        { action: "ok", label: "Assign", default: true,
          callback: (e) => e.target.closest("form, .dialog-content, .window-content")?.querySelector("#deck-sel")?.value ?? "" },
        { action: "cancel", label: "Cancel", callback: () => undefined },
      ],
    });
    if (result === undefined) return;
    if (result) await item.setFlag("fvtt_mosh_1e_hacking", "loadedOn", result);
    else await item.unsetFlag("fvtt_mosh_1e_hacking", "loadedOn");
    app.render(true);
  });

  $html.find(".hacking-item-type").after($btn);
});

// Inventory removal hooks — restore state when hacking decks are removed.
Hooks.on("deleteItem", async (item, _options, userId) => {
  if (userId !== game.user.id) return;
  const actor = item.parent;
  if (!actor || actor.type !== "character") return;

  // Single-use software burned — notify which deck is now free.
  if (item.flags?.fvtt_mosh_1e_hacking?.category === "software") {
    const loadedOnId = item.flags?.fvtt_mosh_1e_hacking?.loadedOn;
    if (loadedOnId) {
      const deck = actor.items.get(loadedOnId);
      const deckName = deck?.name ?? "its deck";
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<em>${item.name} burned — unloaded from ${deckName}.</em>`,
      });
    }
    return;
  }

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

// Show consumption dialog when a software item is clicked in the actor sheet.
Hooks.on("renderActorSheet", (app, html, _data) => {
  const actor = app.actor;
  if (!actor || actor.type !== "character") return;

  html.find(".item").each((_, li) => {
    const itemId = li.dataset?.itemId;
    if (!itemId) return;
    const item = actor.items.get(itemId);
    if (item?.flags?.fvtt_mosh_1e_hacking?.category !== "software") return;

    $(li).find(".description-roll").on("click.hacking-consume", async () => {
      const consume = await foundry.applications.api.DialogV2.confirm({
        window: { title: "Consume Software?" },
        content: `<p>Was <strong>${item.name}</strong> used? Remove it from inventory?</p>`,
      });
      if (consume) await item.delete();
    });
  });
});
