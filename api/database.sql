DROP DATABASE IF EXISTS socialnetwork;
CREATE DATABASE socialnetwork;

\c socialnetwork;

CREATE TABLE      users (
  id              SERIAL PRIMARY KEY,
  firstname       TEXT,
  lastname        TEXT,
  birthday        DATE,
  email           TEXT UNIQUE NOT NULL,
  login           TEXT UNIQUE NOT NULL,
  gender          BIGINT,
  telephone       TEXT UNIQUE,
  password        TEXT NOT NULL,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  following_nb    BIGINT NOT NULL DEFAULT 0,
  follower_nb     BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY     (gender) REFERENCES gender(id),
  CONSTRAINT      login_min_length CHECK (length(login) >= 5)
);

CREATE INDEX      fullname ON users (firstname, lastname);

CREATE TABLE      friendships (
  id              SERIAL PRIMARY KEY,
  follower_id     BIGINT NOT NULL,
  following_id    BIGINT NOT NULL,
  following_date  TIMESTAMPTZ,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  FOREIGN KEY     (follower_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY     (following_id)  REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE          (follower_id, following_id)
);

CREATE TABLE      posts (
  id              SERIAL PRIMARY KEY,
  author_id       BIGINT NOT NULL,
  content         TEXT,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  comments_nb     BIGINT NOT NULL DEFAULT 0,
  likes_nb        BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY     (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE      comments (
  id              SERIAL PRIMARY KEY,
  author_id       BIGINT NOT NULL,
  post_id         BIGINT NOT NULL,
  content         TEXT,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  likes_nb        BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY     (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY     (post_id)   REFERENCES posts(id) ON DELETE CASCADE
);

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

CREATE TABLE      gender (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ
);

INSERT INTO       gender(title, description) VALUES('Male', 'Gender for boys and men');
INSERT INTO       gender(title, description) VALUES('Female', 'Gender for girls and women');
INSERT INTO       gender(title, description) VALUES('Other', 'Gender for everyone else');



-- **************************
-- * Functions and triggers *
-- **************************

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

      RETURN NEW;
    ELSE
      RETURN OLD;
    END IF;

  END;

$trigger_manage_comments_nb$ LANGUAGE plpgsql;


CREATE FUNCTION manage_likes_nb()
  RETURNS TRIGGER AS $trigger_manage_likes_nb$

  BEGIN

    -- Check that post_id is given
    IF (TG_OP = 'INSERT') THEN
      IF NEW.post_id IS NULL THEN
        RAISE EXCEPTION 'post_id cannot be null';
      END IF;
    END IF;

    -- Substract or add one to likes_nb
    IF (TG_OP = 'DELETE') THEN
      UPDATE posts SET likes_nb = posts.likes_nb - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE posts SET likes_nb = posts.likes_nb + 1 WHERE id = NEW.post_id;
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

$trigger_manage_likes_nb$ LANGUAGE plpgsql;


CREATE FUNCTION manage_comment_likes_nb()
  RETURNS TRIGGER AS $trigger_manage_comment_likes_nb$

  BEGIN

    -- Check that post_id is given
    IF (TG_OP = 'INSERT') THEN
      IF NEW.comment_id IS NULL THEN
        RAISE EXCEPTION 'post_id cannot be null';
      END IF;
    END IF;

    -- Substract or add one to likes_nb
    IF (TG_OP = 'DELETE') THEN
      UPDATE comments SET likes_nb = comments.likes_nb - 1 WHERE id = OLD.comment_id;
    ELSE
      UPDATE comments SET likes_nb = comments.likes_nb + 1 WHERE id = NEW.comment_id;
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

$trigger_manage_comment_likes_nb$ LANGUAGE plpgsql;


CREATE FUNCTION sanitize_username_and_email()
  RETURNS TRIGGER AS $trigger_sanitize_username_and_email$

BEGIN

  -- trim and lower email and login
  IF NEW.email IS NOT NULL THEN
    NEW.email := lower(trim(NEW.email));
  END IF;

  IF NEW.login IS NOT NULL THEN
    NEW.login := lower(trim(NEW.login));
  END IF;

  -- Fill the time fields
  IF (TG_OP = 'INSERT') THEN
    NEW.created := current_timestamp;
  END IF;
  NEW.updated := current_timestamp;

  RETURN NEW;

END

$trigger_sanitize_username_and_email$ LANGUAGE plpgsql;


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


CREATE FUNCTION manage_comments()
  RETURNS TRIGGER AS $trigger_manage_comments$

BEGIN

  -- Check that author_id && post_id are given
  IF NEW.author_id IS NULL THEN
    RAISE EXCEPTION 'author_id cannot be null.';
  ELSEIF NEW.post_id IS NULL THEN
    RAISE EXCEPTION 'post_id cannot be null.';
  END IF;

  -- Fill the time fields
  IF (TG_OP = 'INSERT') THEN
    NEW.created := current_timestamp;
  END IF;
  NEW.updated := current_timestamp;

  RETURN NEW;

END

$trigger_manage_comments$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_manage_posts
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE PROCEDURE manage_posts();

CREATE TRIGGER trigger_manage_comments
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE manage_comments();

CREATE TRIGGER trigger_manage_comments_nb
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE manage_comments_nb();

CREATE TRIGGER trigger_manage_following_nb
  AFTER INSERT OR DELETE ON friendships
  FOR EACH ROW
  EXECUTE PROCEDURE manage_following_nb();

CREATE TRIGGER trigger_manage_likes_nb
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE PROCEDURE manage_likes_nb();

CREATE TRIGGER trigger_manage_comment_likes_nb
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE PROCEDURE manage_comment_likes_nb();

CREATE TRIGGER trigger_sanitize_username_and_email
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE sanitize_username_and_email();
