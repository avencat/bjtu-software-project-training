package types

import (
	"github.com/jackc/pgx/pgtype"
	"time"
)

// TYPES used by Posts
type Post struct {
	Id              pgtype.Int4         `json:"id"`
	Content         pgtype.Text         `json:"content"`
	AuthorId        pgtype.Int8         `json:"author_id"`
	CommentsNb      pgtype.Int8         `json:"comments_nb"`
	LikesNb         pgtype.Int8         `json:"likes_nb"`
	Created         pgtype.Timestamptz  `json:"created"`
	Updated         pgtype.Timestamptz  `json:"updated"`
}

type PostForm struct {
	Id              int64       `json:"id,omitempty"`
	Content         string      `json:"content,omitempty"`
	AuthorId        int64       `json:"author_id,omitempty"`
	CommentsNb      int64       `json:"comments_nb,omitempty"`
	LikesNb         int64       `json:"likes_nb,omitempty"`
	Created         *time.Time  `json:"created,omitempty"`
	Updated         *time.Time  `json:"updated,omitempty"`
}

type SinglePostData struct {
	Post
	User        User    `json:"user,omitempty"`
}

type SinglePostDataResponse struct {
	PostForm
	User            UserForm    `json:"user,omitempty"`
}

type PostResponse struct {
	Data            []SinglePostDataResponse    `json:"data,omitempty"`
	Status          string                      `json:"status,omitempty"`
	Message         string                      `json:"message,omitempty"`
}
