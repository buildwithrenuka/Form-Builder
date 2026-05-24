-- ─────────────────────────────────────────────────────────────────────────────
-- 0002_seed.sql  –  Foundational public demo data
-- Demo login: demo@formverse.io / Demo1234!
-- ─────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at)
VALUES (
  'demo-user-formverse-01',
  'Demo Creator',
  'demo@formverse.io',
  'pbkdf2$sha-256$100000$Zm9ybXZlcnNlLWRlbW8tc2FsdC0wMQ$3anK7dy48XA9V5xjDPuZrAfwJ-iht2yocCQ3ZEOPLNk',
  1735689600000
);

INSERT OR IGNORE INTO forms (id, creator_id, title, description, slug, visibility, published, schema, world_theme, created_at, updated_at)
VALUES
  (
    'form-temple-quest-01',
    'demo-user-formverse-01',
    'Jungle Expedition Registration',
    'Register an adventurer for the Jungle World starter expedition and test the Realm Runner response flow.',
    'jungle-expedition-registration',
    'public',
    1,
    '[
      {"id":"t1","type":"text","label":"Explorer Name","placeholder":"A legendary runner","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t2","type":"email","label":"Quest Email","placeholder":"runner@quest.io","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t3","type":"radio","label":"Preferred Challenge","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Speed Run","Treasure Hunt","Guardian Trial"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""},
      {"id":"t4","type":"textarea","label":"Adventure Notes","placeholder":"What kind of run are you preparing for?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":240,"min":0,"max":5,"sectionColor":"#ffd700","sectionDescription":""}
    ]',
    'jungle',
    1736935200000,
    1736935200000
  ),
  (
    'form-globe-japan-01',
    'demo-user-formverse-01',
    'Japan Journey Intake',
    'Collect traveler details for a Japan trip and experience the Globe Explorer submission flow.',
    'japan-journey-intake',
    'public',
    1,
    '[
      {"id":"g1","type":"text","label":"Traveler Name","placeholder":"Full passport name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#bc002d","sectionDescription":""},
      {"id":"g2","type":"email","label":"Contact Email","placeholder":"traveler@example.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#bc002d","sectionDescription":""},
      {"id":"g3","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#bc002d","sectionDescription":""},
      {"id":"g4","type":"select","label":"Visit Purpose","placeholder":"Select a purpose","required":true,"fieldWidth":"half","hidden":false,"options":["Tourism","Business","Study","Family Visit"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#bc002d","sectionDescription":""}
    ]',
    'japan',
    1738400400000,
    1738400400000
  ),
  (
    'form-library-hero-01',
    'demo-user-formverse-01',
    'Mythic Hero Archive',
    'Capture a legendary hero profile and experience The Library public form flow.',
    'mythic-hero-archive',
    'public',
    1,
    '[
      {"id":"l1","type":"text","label":"Hero Name","placeholder":"Name of the champion","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#f59e0b","sectionDescription":""},
      {"id":"l2","type":"select","label":"Archetype","placeholder":"Choose an archetype","required":true,"fieldWidth":"half","hidden":false,"options":["Oracle","Guardian","Scholar","Seeker"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#f59e0b","sectionDescription":""},
      {"id":"l3","type":"textarea","label":"Legend Summary","placeholder":"What story should the archive remember?","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":280,"min":0,"max":5,"sectionColor":"#f59e0b","sectionDescription":""},
      {"id":"l4","type":"email","label":"Archive Contact","placeholder":"hero@archive.io","required":true,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#f59e0b","sectionDescription":""}
    ]',
    'mythology',
    1739617200000,
    1739617200000
  );

INSERT OR IGNORE INTO responses (id, form_id, data, ip_hash, submitted_at)
VALUES
  ('resp-t-001', 'form-temple-quest-01', '{"t1":"Aria Shadowblade","t2":"aria@shadow.io","t3":"Speed Run","t4":"Training for a dawn realm sprint through the jungle."}', 'hash001', 1737021600000),
  ('resp-t-002', 'form-temple-quest-01', '{"t1":"Thorin Ironforge","t2":"thorin@forge.com","t3":"Guardian Trial","t4":"Preparing a shield-heavy run for the front gate corridor."}', 'hash002', 1737108000000),
  ('resp-g-001', 'form-globe-japan-01', '{"g1":"SHARMA Priya","g2":"priya.sharma@gmail.com","g3":"2025-04-10","g4":"Tourism"}', 'hash101', 1738749600000),
  ('resp-g-002', 'form-globe-japan-01', '{"g1":"JOHNSON Michael","g2":"m.johnson@yahoo.com","g3":"2025-05-01","g4":"Business"}', 'hash102', 1738837800000),
  ('resp-l-001', 'form-library-hero-01', '{"l1":"Eldara Moonwhisper","l2":"Oracle","l3":"A seer sworn to protect the oldest prophecies in the archive.","l4":"eldara@crystal.net"}', 'hash201', 1740564000000),
  ('resp-l-002', 'form-library-hero-01', '{"l1":"Vorn Steelhand","l2":"Guardian","l3":"Keeper of the bronze stacks and defender of forbidden shelves.","l4":"vorn@steel.io"}', 'hash202', 1740652200000);
