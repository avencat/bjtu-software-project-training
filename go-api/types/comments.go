package types

import (
	"github.com/jackc/pgx/pgtype"
	"time"
)

// TYPES used by Comments
type Comment struct {
	Id              pgtype.Int4         `json:"id"`
	AuthorId        pgtype.Int8         `json:"author_id"`
	PostId          pgtype.Int8         `json:"post_id"`
	Content         pgtype.Text         `json:"content"`
	LikesNb         pgtype.Int8         `json:"likes_nb"`
	Created         pgtype.Timestamptz  `json:"created"`
	Updated         pgtype.Timestamptz  `json:"updated"`
}

type CommentForm struct {
	Id              int64       `json:"id,omitempty"`
	Content         string      `json:"content,omitempty"`
	AuthorId        int64       `json:"author_id,omitempty"`
	PostId          int64       `json:"post_id,omitempty"`
	LikesNb         int64       `json:"likes_nb,omitempty"`
	Created         *time.Time  `json:"created,omitempty"`
	Updated         *time.Time  `json:"updated,omitempty"`
}

type SingleCommentData struct {
	Comment
	User        User    `json:"user,omitempty"`
}

type SingleCommentDataResponse struct {
	CommentForm
	User            UserForm    `json:"user,omitempty"`
}
