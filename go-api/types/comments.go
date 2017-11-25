package types

import (
	"database/sql"
	"github.com/lib/pq"
)

// TYPES used by Comments
type Comment struct {
	Id              sql.NullInt64   `json:"id"`
	AuthorId        sql.NullInt64   `json:"author_id"`
	PostId          sql.NullInt64   `json:"post_id"`
	Content         sql.NullString  `json:"content"`
	LikesNb         sql.NullInt64   `json:"likes_nb"`
	Created         pq.NullTime     `json:"created"`
	Updated         pq.NullTime     `json:"updated"`
}
