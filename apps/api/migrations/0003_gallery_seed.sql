-- ─────────────────────────────────────────────────────────────────────────────
-- 0003_gallery_seed.sql  –  Showcase forms for every experience world
-- ─────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at)
VALUES (
  'demo-user-formverse-01',
  'Demo Creator',
  'demo@formverse.io',
  '$2b$10$demoHashPlaceholderNotRealBcryptXXXXXXXXXXXXXXX',
  1735689600000
);

INSERT OR IGNORE INTO forms (id, creator_id, title, description, slug, visibility, published, schema, world_theme, created_at, updated_at)
VALUES
  (
    'form-temple-snow-01',
    'demo-user-formverse-01',
    'Snow Summit Check-In',
    'Try a public Realm Runner form styled for the Snow World expedition briefing.',
    'snow-summit-check-in',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'snow',
    1740988800000,
    1740988800000
  ),
  (
    'form-temple-desert-01',
    'demo-user-formverse-01',
    'Desert Relic Intake',
    'Experience the Desert World response flow with a public relic recovery intake.',
    'desert-relic-intake',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'desert',
    1741075200000,
    1741075200000
  ),
  (
    'form-temple-space-01',
    'demo-user-formverse-01',
    'Orbital Temple Mission',
    'Test a public mission brief from the Space World temple gates.',
    'orbital-temple-mission',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'space',
    1741161600000,
    1741161600000
  ),
  (
    'form-temple-underwater-01',
    'demo-user-formverse-01',
    'Sunken Vault Dive Log',
    'Open a public dive registration form designed for the Underwater World.',
    'sunken-vault-dive-log',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'underwater',
    1741248000000,
    1741248000000
  ),
  (
    'form-temple-volcano-01',
    'demo-user-formverse-01',
    'Volcano Forge Trial',
    'Submit a public enrollment for the Volcano World forge challenge.',
    'volcano-forge-trial',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'volcano',
    1741334400000,
    1741334400000
  ),
  (
    'form-temple-heaven-01',
    'demo-user-formverse-01',
    'Celestial Gate Pass',
    'Preview the Heaven World experience with a public celestial access request.',
    'celestial-gate-pass',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'heaven',
    1741420800000,
    1741420800000
  ),
  (
    'form-temple-hell-01',
    'demo-user-formverse-01',
    'Inferno Escape Roster',
    'Feel the Hell World pressure through a public roster intake form.',
    'inferno-escape-roster',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'hell',
    1741507200000,
    1741507200000
  ),
  (
    'form-temple-flower-01',
    'demo-user-formverse-01',
    'Bloom Maze Registration',
    'Try a public Flower World registration for the shifting garden maze.',
    'bloom-maze-registration',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'flower',
    1741593600000,
    1741593600000
  );

INSERT OR IGNORE INTO forms (id, creator_id, title, description, slug, visibility, published, schema, world_theme, created_at, updated_at)
VALUES
  (
    'form-globe-india-01',
    'demo-user-formverse-01',
    'India Traveller Arrival Card',
    'Preview the India respondent experience with a public arrival card.',
    'india-traveller-arrival-card',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'india',
    1741680000000,
    1741680000000
  ),
  (
    'form-globe-usa-01',
    'demo-user-formverse-01',
    'USA Visitor Registration',
    'Experience a public United States visitor intake form.',
    'usa-visitor-registration',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'usa',
    1741766400000,
    1741766400000
  ),
  (
    'form-globe-uk-01',
    'demo-user-formverse-01',
    'UK Entry Planner',
    'Try the public United Kingdom travel planner and submission flow.',
    'uk-entry-planner',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'uk',
    1741852800000,
    1741852800000
  ),
  (
    'form-globe-germany-01',
    'demo-user-formverse-01',
    'Germany Travel Dossier',
    'Open a public Germany trip dossier in the Globe Explorer experience.',
    'germany-travel-dossier',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'germany',
    1741939200000,
    1741939200000
  ),
  (
    'form-globe-brazil-01',
    'demo-user-formverse-01',
    'Brazil Event Arrival Form',
    'Submit a public Brazil arrival form built for Globe Explorer demos.',
    'brazil-event-arrival-form',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'brazil',
    1742025600000,
    1742025600000
  ),
  (
    'form-globe-uae-01',
    'demo-user-formverse-01',
    'UAE Guest Access Request',
    'Try a public guest access request tailored to the UAE experience.',
    'uae-guest-access-request',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'uae',
    1742112000000,
    1742112000000
  ),
  (
    'form-globe-australia-01',
    'demo-user-formverse-01',
    'Australia Tour Registration',
    'Preview the Australia world with a public trip registration form.',
    'australia-tour-registration',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'australia',
    1742198400000,
    1742198400000
  ),
  (
    'form-globe-china-01',
    'demo-user-formverse-01',
    'China Delegation Intake',
    'Experience a public China delegation intake workflow.',
    'china-delegation-intake',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'china',
    1742284800000,
    1742284800000
  ),
  (
    'form-globe-france-01',
    'demo-user-formverse-01',
    'France Residency Planner',
    'Test a public France residency planning form from the gallery.',
    'france-residency-planner',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'france',
    1742371200000,
    1742371200000
  ),
  (
    'form-globe-canada-01',
    'demo-user-formverse-01',
    'Canada Arrival Declaration',
    'Open a public Canada arrival declaration and submit it live.',
    'canada-arrival-declaration',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'canada',
    1742457600000,
    1742457600000
  ),
  (
    'form-globe-south-africa-01',
    'demo-user-formverse-01',
    'South Africa Visitor Log',
    'Preview the South Africa travel flow with a public visitor log.',
    'south-africa-visitor-log',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
    ]',
    'south-africa',
    1742544000000,
    1742544000000
  );

INSERT OR IGNORE INTO forms (id, creator_id, title, description, slug, visibility, published, schema, world_theme, created_at, updated_at)
VALUES
  (
    'form-library-history-01',
    'demo-user-formverse-01',
    'Historical Figure Archive',
    'Try a public library archive form for the History shelves.',
    'historical-figure-archive',
    'public',
    1,
    '[
      {"id":"l1","type":"text","label":"Hero Name","placeholder":"Name of the champion","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l2","type":"select","label":"Archetype","placeholder":"Choose an archetype","required":true,"fieldWidth":"half","hidden":false,"options":["Oracle","Guardian","Scholar","Seeker"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l3","type":"textarea","label":"Legend Summary","placeholder":"What story should the archive remember?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":280,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l4","type":"email","label":"Archive Contact","placeholder":"hero@archive.io","required":true,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""}
    ]',
    'history',
    1742630400000,
    1742630400000
  ),
  (
    'form-library-scifi-01',
    'demo-user-formverse-01',
    'Galactic Crew Registry',
    'Experience a public sci-fi registry directly from the Library gallery.',
    'galactic-crew-registry',
    'public',
    1,
    '[
      {"id":"l1","type":"text","label":"Hero Name","placeholder":"Name of the champion","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l2","type":"select","label":"Archetype","placeholder":"Choose an archetype","required":true,"fieldWidth":"half","hidden":false,"options":["Oracle","Guardian","Scholar","Seeker"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l3","type":"textarea","label":"Legend Summary","placeholder":"What story should the archive remember?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":280,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l4","type":"email","label":"Archive Contact","placeholder":"hero@archive.io","required":true,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""}
    ]',
    'scifi',
    1742716800000,
    1742716800000
  ),
  (
    'form-library-fictional-01',
    'demo-user-formverse-01',
    'Fiction Realm Passport',
    'Submit a public passport request for the Fictional shelves.',
    'fiction-realm-passport',
    'public',
    1,
    '[
      {"id":"l1","type":"text","label":"Hero Name","placeholder":"Name of the champion","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l2","type":"select","label":"Archetype","placeholder":"Choose an archetype","required":true,"fieldWidth":"half","hidden":false,"options":["Oracle","Guardian","Scholar","Seeker"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l3","type":"textarea","label":"Legend Summary","placeholder":"What story should the archive remember?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":280,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
      {"id":"l4","type":"email","label":"Archive Contact","placeholder":"hero@archive.io","required":true,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""}
    ]',
    'fictional',
    1742803200000,
    1742803200000
  );