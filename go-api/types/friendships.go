package types

import (
	"database/sql"
	"github.com/lib/pq"
	"time"
)

// TYPES used by Friendships
type Friendship struct {
	Id              sql.NullInt64   `json:"id"`
	FollowerId      sql.NullInt64   `json:"follower_id"`
	FollowingId     sql.NullInt64   `json:"following_id"`
	FollowingDate   pq.NullTime     `json:"following_date"`
	Created         pq.NullTime     `json:"created"`
	Updated         pq.NullTime     `json:"updated"`
}

type FriendshipForm struct {
	Id              int64       `json:"id,omitempty"`
	FollowerId      int64       `json:"follower_id,omitempty"`
	FollowingId     int64       `json:"following_id,omitempty"`
	FollowingDate   *time.Time  `json:"following_date,omitempty"`
	Created         *time.Time  `json:"created,omitempty"`
	Updated         *time.Time  `json:"updated,omitempty"`
}

type SingleFriendshipData struct {
	Friendship
	User        User    `json:"user,omitempty"`
}

type SingleFriendshipDataResponse struct {
	FriendshipForm
	User            UserForm    `json:"user,omitempty"`
}

type FriendshipResponse struct {
	Status          string      `json:"status"`
	FriendshipId    int64       `json:"friendship_id"`
	Message         string      `json:"message"`
}