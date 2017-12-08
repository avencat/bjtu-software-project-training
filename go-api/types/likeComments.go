package types

import (
	"github.com/jackc/pgx/pgtype"
	"time"
)

// TYPES used by LikeComments
type LikeComment struct {
	Id              pgtype.Int4         `json:"id"`
	UserId          pgtype.Int8         `json:"user_id"`
	CommentId       pgtype.Int8         `json:"comment_id"`
	Created         pgtype.Timestamptz  `json:"created"`
	Updated         pgtype.Timestamptz  `json:"updated"`
}

type LikeCommentForm struct {
	Id              int64       `json:"id,omitempty"`
	UserId          int64       `json:"user_id,omitempty"`
	CommentId       int64       `json:"comment_id,omitempty"`
	Created         *time.Time  `json:"created,omitempty"`
	Updated         *time.Time  `json:"updated,omitempty"`
}

type SingleLikeCommentData struct {
	LikeComment
	User            User        `json:"user,omitempty"`
}

type SingleLikeCommentDataResponse struct {
	LikeCommentForm
	User            UserForm    `json:"user,omitempty"`
}
