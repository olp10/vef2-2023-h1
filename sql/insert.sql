-- Þetta lykilorð ætti að decryptast í 123
INSERT INTO users (username, password, isAdmin) VALUES ('admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', true);

-- Hafa einn notanda líka með vitað lykilorð (123) sem er ekki admin
INSERT INTO users (username, password, isAdmin) VALUES ('notAdmin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', false);

-- Rest bætt inn með faker