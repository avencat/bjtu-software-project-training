package types

import (
	"database/sql"
	"github.com/lib/pq"
)

// TYPES used by Comments
type Likes struct {
	Id              sql.NullInt64   `json:"id"`
	UserId          sql.NullInt64   `json:"user_id"`
	PostId          sql.NullInt64   `json:"post_id"`
	Created         pq.NullTime     `json:"created"`
	Updated         pq.NullTime     `json:"updated"`
}