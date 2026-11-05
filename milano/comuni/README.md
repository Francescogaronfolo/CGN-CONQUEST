# Milan province board

The application at `/` uses `provinceBoard: true`.
The 133 municipalities are represented by 136 playable territories: Milano is partitioned into Nord, Sud, Est and Ovest. All share one coordinate system and one continuous canvas.
Municipal boundaries originate from ISTAT. For gameplay, San Colombano has been relocated adjacent to San Zenone, with a shared border and public road. This is a deliberate cartographic adaptation. Streets and zoning are predesigned **game geometry**, not a surveyed street map or an inventory of actual businesses.

## Interaction

- Existing public streets and fixed development sites are visible before acquisition.
- Click a site to buy and build, then click its building to upgrade. No free placement or road drawing.
- Click a frontier access (+) to expand into a neighboring vacant municipality. A paid concession project integrates the existing public road automatically.
- An occupied neighbor requires an accepted acquisition offer.
- Ownership removes internal municipal borders but retains municipality names. The camera does not change on acquisition or when selecting another municipality.
- Existing links can be improved with road, motorway, rail or airport services. These are paid economic improvements, not prerequisites to seeing a road.

## Plans and assets

`provincePlan` creates deterministic multi-block plans. `province-roads.js` contains 338 precomputed public routes, covering every municipal adjacency. Three routes use connected intermediate municipal streets; public infrastructure is available independently of ownership. Regenerate with `node tools/generate-province-board.mjs`.

The active renderer in `buildings.js` draws original orthographic 2D roof plans for six sectors, with three development tiers. The former isometric atlas is retained as an unused design experiment and is no longer loaded. At province scale only territory fills, borders and town names are drawn. Roads, sites, buildings and frontier access points appear at construction zoom (22 screen pixels per world unit). No other game's sprites or audio are used.

Visual reference: [Final Outpost official build screenshot](https://exabytegames.com/static/0a6b4e2563a3567dec5178a8e9183784/7313b/1Build.jpg). We use the readability of its top-down silhouettes and organized footprints, without copying its art.

## Save migration

Old saves retain company budgets, goods, building IDs, paid investments and levels. Buildings and pending projects are reassigned to the new planned sites. Old unfinished local road projects are refunded because local public streets now already exist. Intermunicipal service investments retain their paid value and level while following the public network.

## Validation

`node --test tests/milano-*.test.js` validates economy, migration, zoning, road connectivity, acquisition, service upgrades and camera continuity. The province-board suite checks all 136 plans and all 338 public routes for containment and reserved-site collisions.

## Economy and scope

The continuous game has no end timer. The economic ranking weighs income 50%, development 35% and spendable cash 15%. Industry produces up to 24 goods per level per minute; production depends on energy. Commerce consumes goods. Logistics raises storage above the base 500 units. The economy pauses when the page is hidden; no offline earnings are promised. Buildings currently cap at level 8. Airport opportunities exist at Bresso and Segrate as gameplay concessions. Doctrine modifiers and resource deals remain available. No audio or multiplayer was added.

Boundary attribution: ISTAT / [geojson-italy](https://github.com/guglielmo/geojson-italy), CC BY 4.0. Population, development profiles and economy are simulated.

## Development / Claude Code

Public game: https://trenoscommesse.vercel.app/milano-comuni.html
Repository: https://github.com/Francescogaronfolo/Trenoscommesse
Entry: `milano-comuni.html`; controller: `milano/comuni/app.js`; rendering: `view.js`, `buildings.js`; simulation: `engine.js`; fixed sites: `plans.js`; geography migration: `cartography.js`; smooth world-space vehicle movement: `motion.js`.

Serve repository root with `python -m http.server 4389`, then open `/milano-comuni.html`. Run `node --test tests/milano-*.test.js`. Publish to `main` for the connected Vercel deployment. Keep module cache versions consistent when publishing.

Map-site selection exposes price and purchase directly above the selected parcel. The compact side panel shows yield, resources and construction duration. The Provincia button always restores the complete board. Road cells, projections and field geometry are cached; vehicle motion uses simulation substeps and arc-length interpolation with continuous reversals. Public roads are shown only at construction zoom. No audio was introduced.

## Urban atlas / Milano sectors

The local map uses an original schematic urban basemap inspired by clear street cartography: white secondary streets, warm arterial roads, building footprints, courtyards and green spaces. `urban-map.js` generates and batches passive background geometry with Path2D; productive parcels are reserved and remain distinct. These footprints are context, not separately productive structures. No external map tiles or map API keys are required. Streets and background footprints are gameplay cartography, not a 1:1 survey.

`milano-sectors.js` contains the clipped original Milano polygon: four disjoint cardinal sectors covering its former area. Neighbor boundary vertices are noded consistently. The original territory ID (71) is now Milano Nord; IDs 133–135 are Sud, Est and Ovest. Existing IDs of other municipalities remain stable. `tools/split-milano.py` documents the offline Shapely transformation. `board.js:migrateMilanoDistricts` expands v9 saves, preserves ownership across the original Milano footprint, redistributes existing buildings and projects without minting investments, and reroutes existing links. A checked-in synthetic v9 fixture verifies continuation after migration.

## Company management and batch upgrades

`management.js` implements the compact Società drawer, with six sector divisions, an owned-building inventory, available lots grouped by municipality and a municipality filter. Purchases and individual upgrades execute directly in the drawer and retain the current map camera. The displayed numerator counts completed structures; construction sites and remaining lots are listed separately. These divisions organize the same player's properties and treasury; they do not create separate AI companies or duplicate capital.

Batch controls choose 25%, 50% or 100% of currently eligible buildings in the selected sector and municipality filter (rounded up), one level each, prioritizing lower levels. `quoteBatchUpgrade` reports the exact summed price and goods before confirmation. `batchUpgrade` debits the complete plan once and queues projects; at most two local construction sites run per municipality. The simulation starts waiting jobs automatically when capacity is released. Queues persist in saves, block duplicate upgrades and do not provide income until completion. Invalid or unaffordable plans are atomic.

Frontier purchases now use the same on-map price button as building purchases. The Provincia and Società controls live together below the municipality heading. A logarithmic zoom bar covers the complete province-to-construction zoom range; mouse wheel and pinch remain available.
