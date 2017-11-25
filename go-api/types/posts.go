package types

import (
	"database/sql"
	"github.com/lib/pq"
)

// TYPES used by Posts
type Post struct {
	Id              sql.NullInt64   `json:"id"`
	AuthorId        sql.NullInt64   `json:"author_id"`
	Content         sql.NullString  `json:"content"`
	CommentsNb      sql.NullInt64   `json:"comments_nb"`
	LikesNb         sql.NullInt64   `json:"likes_nb"`
	Created         pq.NullTime     `json:"created"`
	Updated         pq.NullTime     `json:"updated"`
}