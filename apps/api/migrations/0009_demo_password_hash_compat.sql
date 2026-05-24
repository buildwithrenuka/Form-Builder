-- Rehash the seeded demo account onto the Worker-supported PBKDF2 iteration count.

UPDATE users
SET password_hash = 'pbkdf2$sha-256$100000$Zm9ybXZlcnNlLWRlbW8tc2FsdC0wMQ$3anK7dy48XA9V5xjDPuZrAfwJ-iht2yocCQ3ZEOPLNk'
WHERE email = 'demo@formverse.io';
