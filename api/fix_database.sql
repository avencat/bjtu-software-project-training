\c socialnetwork;


ALTER TABLE users ADD COLUMN follower_nb BIGINT NOT NULL DEFAULT 0;
ALTER TABLE users ALTER COLUMN gender TYPE BIGINT;
ALTER TABLE users ADD FOREIGN KEY (gender) REFERENCES gender(id);
ALTER TABLE users ALTER COLUMN following_nb SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN following_nb SET NOT NULL;


ALTER TABLE posts ALTER COLUMN comments_nb SET DEFAULT 0;
ALTER TABLE posts ALTER COLUMN comments_nb SET NOT NULL;
ALTER TABLE posts ALTER COLUMN likes_nb SET DEFAULT 0;
ALTER TABLE posts ALTER COLUMN likes_nb SET NOT NULL;


ALTER TABLE comments ALTER COLUMN likes_nb SET DEFAULT 0;
ALTER TABLE comments ALTER COLUMN likes_nb SET NOT NULL;


INSERT INTO       gender(title, description) VALUES('Male', 'Gender for boys and men');
INSERT INTO       gender(title, description) VALUES('Female', 'Gender for girls and women');
INSERT INTO       gender(title, description) VALUES('Other', 'Gender for everyone else');



DROP TRIGGER trigger_manage_following_nb ON friendships;
DROP FUNCTION manage_following_nb();

CREATE FUNCTION manage_following_nb()
  RETURNS TRIGGER AS $trigger_manage_following_nb$

BEGIN

  -- Check that follower_id is given
  IF (TG_OP = 'INSERT') THEN
    IF NEW.follower_id IS NULL THEN
      RAISE EXCEPTION 'follower_id cannot be null';
    ELSEIF NEW.following_id IS NULL THEN
      RAISE EXCEPTION 'following_id cannot be null';
    END IF;
  END IF;

  -- Substract or add one to following_nb
  IF (TG_OP = 'DELETE') THEN

    UPDATE users SET following_nb = following_nb - 1 WHERE id = OLD.follower_id;
    UPDATE users SET follower_nb = follower_nb - 1 WHERE id = OLD.following_id;

  ELSE

    UPDATE users SET following_nb = following_nb + 1 WHERE id = NEW.follower_id;
    UPDATE users SET follower_nb = follower_nb + 1 WHERE id = NEW.following_id;

  END IF;

  -- Fill the time fields
  IF (TG_OP = 'INSERT') THEN

    NEW.created := current_timestamp;
    NEW.updated := current_timestamp;

    RETURN NEW;

  ELSE

    RETURN OLD;

  END IF;

END;
$trigger_manage_following_nb$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_manage_following_nb
AFTER INSERT OR DELETE ON friendships
FOR EACH ROW
EXECUTE PROCEDURE manage_following_nb();