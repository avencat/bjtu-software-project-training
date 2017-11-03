\c socialnetwork;

ALTER TABLE friendship DROP CONSTRAINT friendship_follower_id_fkey;
ALTER TABLE friendship DROP CONSTRAINT friendship_following_id_fkey;
ALTER TABLE friendship ADD FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE friendship ADD FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE posts DROP CONSTRAINT posts_author_id_fkey;
ALTER TABLE posts ADD FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE comments DROP CONSTRAINT comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT comments_post_id_fkey;
ALTER TABLE comments ADD FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

DROP TABLE comment_likes;

CREATE TABLE      comment_likes (
  id              SERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL,
  comment_id      BIGINT NOT NULL,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  UNIQUE          (user_id, comment_id),
  FOREIGN KEY     (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY     (comment_id)  REFERENCES comments(id) ON DELETE CASCADE
);

DROP TABLE post_likes;

CREATE TABLE      post_likes (
  id              SERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL,
  post_id         BIGINT NOT NULL,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  UNIQUE          (user_id, post_id),
  FOREIGN KEY     (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY     (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

DROP TRIGGER trigger_manage_comments_nb ON comments;
DROP TRIGGER trigger_manage_posts ON posts;
DROP FUNCTION manage_comments_nb();
DROP FUNCTION manage_posts();

CREATE FUNCTION manage_comments_nb()
RETURNS TRIGGER AS $trigger_manage_comments_nb$

  BEGIN

    -- Check that post_id is given
    IF (TG_OP = 'INSERT') THEN
      IF NEW.post_id IS NULL THEN
        RAISE EXCEPTION 'post_id cannot be null';
      END IF;
    END IF;

    -- Substract or add one to comments_nb
    IF (TG_OP = 'DELETE') THEN
      UPDATE posts SET comments_nb = comments_nb - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE posts SET comments_nb = comments_nb + 1 WHERE id = NEW.post_id;
    END IF;

    -- Fill the time fields
    IF (TG_OP = 'INSERT') THEN
      NEW.created := current_timestamp;
      NEW.updated := current_timestamp;
    END IF;

    RETURN NEW;

  END;

$trigger_manage_comments_nb$ LANGUAGE plpgsql;

CREATE FUNCTION manage_posts()
  RETURNS TRIGGER AS $trigger_manage_posts$

BEGIN

  -- Check that author_id is given
  IF NEW.author_id IS NULL THEN
    RAISE EXCEPTION 'author_id cannot be null.';
  END IF;

  -- Fill the time fields
  IF (TG_OP = 'INSERT') THEN
    NEW.created := current_timestamp;
  END IF;
  NEW.updated := current_timestamp;

  RETURN NEW;

END

$trigger_manage_posts$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_manage_comments_nb
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE manage_comments_nb();

CREATE TRIGGER trigger_manage_posts
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE PROCEDURE manage_posts();