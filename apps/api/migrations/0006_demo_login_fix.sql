-- Ensure the seeded demo account uses a valid PBKDF2 hash for Demo1234!

UPDATE users
SET password_hash = 'pbkdf2$sha-256$310000$Zm9ybXZlcnNlLWRlbW8tc2FsdC0wMQ$wIG8Kv-TpsyaqFq9smweYX7eEcSx1AzA1pSLFgRVB9g'
WHERE email = 'demo@formverse.io';