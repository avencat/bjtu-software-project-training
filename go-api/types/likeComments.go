package types

import (
	"database/sql"
	"github.com/lib/pq"
)

// TYPES used by LikeComments
type LikeComments struct {
	Id              sql.NullInt64   `json:"id"`
	UserId          sql.NullInt64   `json:"user_id"`
	CommentId       sql.NullInt64   `json:"comment_id"`
	Created         pq.NullTime     `json:"created"`
	Updated         pq.NullTime     `json:"updated"`
}