package types

import (
	"github.com/jackc/pgx/pgtype"
	"time"
)

// TYPES used by Comments
type Like struct {
	Id              pgtype.Int4         `json:"id"`
	UserId          pgtype.Int8         `json:"user_id"`
	PostId          pgtype.Int8         `json:"post_id"`
	Created         pgtype.Timestamptz  `json:"created"`
	Updated         pgtype.Timestamptz  `json:"updated"`
}

type LikeForm struct {
	Id              int64       `json:"id,omitempty"`
	UserId          int64       `json:"user_id,omitempty"`
	PostId          int64       `json:"post_id,omitempty"`
	Created         *time.Time  `json:"created,omitempty"`
	Updated         *time.Time  `json:"updated,omitempty"`
}

type SingleLikeData struct {
	Like
	User        User    `json:"user,omitempty"`
}

type SingleLikeDataResponse struct {
	LikeForm
	User            UserForm    `json:"user,omitempty"`
}
