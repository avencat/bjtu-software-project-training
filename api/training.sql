DROP DATABASE IF EXISTS socialnetwork;
CREATE DATABASE socialnetwork;

\c socialnetwork;

CREATE TABLE      users (
  id              SERIAL PRIMARY KEY,
  firstname       VARCHAR,
  lastname        VARCHAR,
  birthday        DATE,
  email           VARCHAR UNIQUE NOT NULL,
  login           VARCHAR UNIQUE NOT NULL,
  gender          SMALLINT,
  telephone       VARCHAR UNIQUE,
  password        VARCHAR NOT NULL,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  CONSTRAINT      login_min_length CHECK (length(login) >= 5),
  CONSTRAINT      pwd_min_length CHECK (length(password) >= 6)
);

CREATE INDEX      fullname ON users (firstname, lastname);

CREATE TABLE      friendship (
  id              SERIAL PRIMARY KEY,
  follower_id     BIGINT NOT NULL,
  following_id    BIGINT NOT NULL,
  following_date  TIMESTAMPTZ,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  FOREIGN KEY     (follower_id)   REFERENCES users(id),
  FOREIGN KEY     (following_id)  REFERENCES users(id),
  UNIQUE          (follower_id, following_id)
);

CREATE TABLE      posts (
  id              SERIAL PRIMARY KEY,
  author_id       BIGINT NOT NULL,
  content         TEXT,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  comments_nb     BIGINT,
  likes_nb        BIGINT,
  FOREIGN KEY     (author_id) REFERENCES users(id)
);

CREATE TABLE      comments (
  id              SERIAL PRIMARY KEY,
  author_id       BIGINT NOT NULL,
  post_id         BIGINT NOT NULL,
  content         TEXT,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  likes_nb        BIGINT,
  FOREIGN KEY     (author_id) REFERENCES users(id),
  FOREIGN KEY     (post_id)   REFERENCES posts(id)
);

CREATE TABLE      post_likes (
  id              SERIAL PRIMARY KEY,
  user_id         BIGINT UNIQUE NOT NULL,
  post_id         BIGINT UNIQUE NOT NULL,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  FOREIGN KEY     (user_id) REFERENCES users(id),
  FOREIGN KEY     (post_id) REFERENCES posts(id)
);

CREATE TABLE      comment_likes (
  id              SERIAL PRIMARY KEY,
  user_id         BIGINT UNIQUE NOT NULL,
  comment_id      BIGINT UNIQUE NOT NULL,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  FOREIGN KEY     (user_id)     REFERENCES users(id),
  FOREIGN KEY     (comment_id)  REFERENCES comments(id)
);

CREATE TABLE      gender (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR NOT NULL,
  description     TEXT,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ
);



-- **************************
-- * Functions and triggers *
-- **************************

CREATE FUNCTION manage_comments_nb()
  RETURNS TRIGGER AS $trigger_manage_comments_nb$

  BEGIN

    -- Check that post_id is given
    IF NEW.post_id IS NULL THEN
      RAISE EXCEPTION 'post_id cannot be null';
    END IF;

    -- Substract or add one to comments_nb
    IF (TG_OP = 'DELETE') THEN
      UPDATE posts SET comments_nb = comments_nb - 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE posts SET comments_nb = comments_nb + 1 WHERE id = NEW.post_id;
    END IF;

    -- Fill the time fields
    NEW.created := current_timestamp;
    NEW.updated := current_timestamp;

    RETURN NEW;

  END;

$trigger_manage_comments_nb$ LANGUAGE plpgsql;


CREATE FUNCTION manage_likes_nb()
  RETURNS TRIGGER AS $trigger_manage_likes_nb$

  BEGIN

    -- Check that post_id is given
    IF NEW.post_id IS NULL THEN
      RAISE EXCEPTION 'post_id cannot be null';
    END IF;

    -- Substract or add one to likes_nb
    IF (TG_OP = 'DELETE') THEN
      UPDATE posts SET likes_nb = posts.likes_nb - 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE posts SET likes_nb = posts.likes_nb + 1 WHERE id = NEW.post_id;
    END IF;

    -- Fill the time fields
    NEW.created := current_timestamp;
    NEW.updated := current_timestamp;

    RETURN NEW;

  END;

$trigger_manage_likes_nb$ LANGUAGE plpgsql;


CREATE FUNCTION manage_comment_likes_nb()
  RETURNS TRIGGER AS $trigger_manage_comment_likes_nb$

  BEGIN

    -- Check that post_id is given
    IF NEW.comment_id IS NULL THEN
      RAISE EXCEPTION 'post_id cannot be null';
    END IF;

    -- Substract or add one to likes_nb
    IF (TG_OP = 'DELETE') THEN
      UPDATE comments SET likes_nb = comments.likes_nb - 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE comments SET likes_nb = comments.likes_nb + 1 WHERE id = NEW.comment_id;
    END IF;

    -- Fill the time fields
    NEW.created := current_timestamp;
    NEW.updated := current_timestamp;

    RETURN NEW;

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
      NEW.email := lower(trim(NEW.login));
    END IF;

    -- Fill the time fields
    IF (TG_OP = 'INSERT') THEN
      NEW.created := current_timestamp;
    END IF;
    NEW.updated := current_timestamp;

    RETURN NEW;

  END

$trigger_sanitize_username_and_email$LANGUAGE plpgsql;


CREATE TRIGGER trigger_manage_comments_nb
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE manage_comments_nb();

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
