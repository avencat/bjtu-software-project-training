package types

import (
	"time"
	"github.com/jackc/pgx/pgtype"
)

// TYPES used by Friendships
type Friendship struct {
	Id              pgtype.Int4         `json:"id"`
	FollowerId      pgtype.Int8         `json:"follower_id"`
	FollowingId     pgtype.Int8         `json:"following_id"`
	FollowingDate   pgtype.Timestamptz  `json:"following_date"`
	Created         pgtype.Timestamptz  `json:"created"`
	Updated         pgtype.Timestamptz  `json:"updated"`
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