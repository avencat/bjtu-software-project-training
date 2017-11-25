package types

import (
	"database/sql"
	"github.com/lib/pq"
)

// TYPES used by Friendships
type Friendship struct {
	Id              sql.NullInt64   `json:"id"`
	FollowerId      sql.NullInt64  `json:"follower_id"`
	FollowingId     sql.NullInt64   `json:"following_id"`
	FollowingDate   pq.NullTime     `json:"following_date"`
	Created         pq.NullTime     `json:"created"`
	Updated         pq.NullTime     `json:"updated"`
}