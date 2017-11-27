package types

import (
	"time"
	"github.com/jackc/pgx/pgtype"
)

// TYPES used by USERS
type User struct {
	Id          pgtype.Int4         `json:"id"`
	Firstname   pgtype.Text         `json:"firstname"`
	Lastname    pgtype.Text         `json:"lastname"`
	Birthday    pgtype.Timestamptz  `json:"birthday"`
	Email       pgtype.Text         `json:"email"`
	Login       pgtype.Text         `json:"login"`
	Telephone   pgtype.Text         `json:"telephone"`
	Password    pgtype.Text         `json:"-"`
	FollowerNb  pgtype.Int8         `json:"follower_nb"`
	FollowingNb pgtype.Int8         `json:"following_nb"`
	Created     pgtype.Timestamptz  `json:"created"`
	Updated     pgtype.Timestamptz  `json:"updated"`
}

type UserForm struct {
	Id          int64       `json:"id,omitempty"`
	Firstname   string      `json:"firstname,omitempty"`
	Lastname    string      `json:"lastname,omitempty"`
	Birthday    *time.Time  `json:"birthday,omitempty"`
	Email       string      `json:"email,omitempty"`
	Login       string      `json:"login,omitempty"`
	Telephone   string      `json:"telephone,omitempty"`
	Password    string      `json:"password,omitempty"`
	FollowerNb  int64       `json:"follower_nb"`
	FollowingNb int64       `json:"following_nb"`
	Created     *time.Time  `json:"created,omitempty"`
	Updated     *time.Time  `json:"updated,omitempty"`
}

type UserResponse struct {
	Status      string  `json:"status"`
	Token       string  `json:"token"`
	UserId      int64   `json:"user_id"`
	Message     string  `json:"message"`
	FollowingNb int64   `json:"following_nb"`
}

type SingleUserData struct {
	User
	FriendshipId    pgtype.Int4         `json:"friendship_id"`
	FollowingDate   pgtype.Timestamptz  `json:"following_date"`
}

type SingleUserDataResponse struct {
	UserForm
	FriendshipId    int64           `json:"friendship_id,omitempty"`
	FollowingDate   *time.Time       `json:"following_date,omitempty"`
}

type SingleUserResponse struct {
	Status  string                  `json:"status"`
	User    SingleUserDataResponse  `json:"user"`
	Message string                  `json:"message"`
}

type MultipleUserResponse struct {
	Status  string                      `json:"status"`
	Data    []SingleUserDataResponse    `json:"data"`
	Message string                      `json:"message"`
}

type LoginCredentials struct {
	Login           string          `json:"login"`
	Password        string          `json:"password"`
}
