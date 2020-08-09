BEGIN TRANSACTION;

INSERT into users (name, email, entries, joined) values ('Duke', 'duke@gmail.com', 69, '1980-01-01');
INSERT into login (hash, email) values ('$2a$10$EiyO4ixLR//vUdYbSDRhbuv0QXz9g0.LH3Xpa.vPqQir9sHn/18W.', 'duke@gmail.com');

COMMIT;