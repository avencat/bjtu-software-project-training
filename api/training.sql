DROP DATABASE IF EXISTS socialnetwork;
CREATE DATABASE socialnetwork;

\c socialnetwork;

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  firstname   VARCHAR,
  lastname    VARCHAR,
  birthday    DATE,
  email       VARCHAR UNIQUE NOT NULL,
  login       VARCHAR UNIQUE NOT NULL,
  gender      SMALLINT,
  telephone   VARCHAR UNIQUE,
  password    VARCHAR NOT NULL
);

CREATE INDEX fullname ON users (firstname, lastname);

CREATE TABLE friendship (
  id              SERIAL PRIMARY KEY,
  follower_id     BIGINT NOT NULL,
  following_id    BIGINT NOT NULL,
  following_date  TIMESTAMPTZ,
  FOREIGN KEY     (follower_id)   REFERENCES users(id),
  FOREIGN KEY     (following_id)  REFERENCES users(id),
  UNIQUE          (follower_id, following_id)
);

CREATE TABLE posts (
  id              SERIAL PRIMARY KEY,
  author_id       BIGINT NOT NULL,
  content         TEXT,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  comments_nb     BIGINT,
  likes_nb        BIGINT,
  FOREIGN KEY     (author_id) REFERENCES users(id)
);

CREATE TABLE comments (
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

CREATE TABLE post_likes (
  id              SERIAL PRIMARY KEY,
  user_id         BIGINT UNIQUE NOT NULL,
  post_id         BIGINT UNIQUE NOT NULL,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  FOREIGN KEY     (user_id) REFERENCES users(id),
  FOREIGN KEY     (post_id) REFERENCES posts(id)
);

CREATE TABLE comment_likes (
  id              SERIAL PRIMARY KEY,
  user_id         BIGINT UNIQUE NOT NULL,
  comment_id      BIGINT UNIQUE NOT NULL,
  created         TIMESTAMPTZ,
  updated         TIMESTAMPTZ,
  FOREIGN KEY     (user_id)     REFERENCES users(id),
  FOREIGN KEY     (comment_id)  REFERENCES comments(id)
);



-- **************************
-- * Functions and triggers *
-- **************************

CREATE FUNCTION manage_comments_nb() RETURNS TRIGGER AS $trigger_manage_comments_nb$
  BEGIN
    -- Check that post_id is given
    IF NEW.post_id IS NULL THEN
      RAISE EXCEPTION 'post_id cannot be null';
    END IF;

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

CREATE FUNCTION manage_likes_nb() RETURNS TRIGGER AS $trigger_manage_likes_nb$
  BEGIN
    -- Check that post_id is given
    IF NEW.post_id IS NULL THEN
      RAISE EXCEPTION 'post_id cannot be null';
    END IF;

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

CREATE FUNCTION manage_comment_likes_nb() RETURNS TRIGGER AS $trigger_manage_comment_likes_nb$
  BEGIN
    -- Check that post_id is given
    IF NEW.comment_id IS NULL THEN
      RAISE EXCEPTION 'post_id cannot be null';
    END IF;

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

CREATE TRIGGER trigger_manage_comments_nb
  AFTER INSERT OR DELETE ON comments
  EXECUTE PROCEDURE manage_comments_nb();

CREATE TRIGGER trigger_manage_likes_nb
  AFTER INSERT OR DELETE ON post_likes
  EXECUTE PROCEDURE manage_likes_nb();

CREATE TRIGGER trigger_manage_comment_likes_nb
  AFTER INSERT OR DELETE ON comment_likes
  EXECUTE PROCEDURE manage_comment_likes_nb();
