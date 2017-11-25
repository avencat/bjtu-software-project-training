package types

import (
	"database/sql"
	"github.com/lib/pq"
	"time"
)

// TYPES used by USERS
type User struct {
	Id          sql.NullInt64   `json:"id"`
	Firstname   sql.NullString  `json:"firstname"`
	Lastname    sql.NullString  `json:"lastname"`
	Birthday    pq.NullTime     `json:"birthday"`
	Email       sql.NullString  `json:"email"`
	Login       sql.NullString  `json:"login"`
	Telephone   sql.NullString  `json:"telephone"`
	Password    sql.NullString  `json:"-"`
	FollowerNb  sql.NullInt64   `json:"follower_nb"`
	FollowingNb sql.NullInt64   `json:"following_nb"`
	Created     pq.NullTime     `json:"created"`
	Updated     pq.NullTime     `json:"updated"`
}

type UserForm struct {
	Id          int64       `json:"id"`
	Firstname   string      `json:"firstname,omitempty"`
	Lastname    string      `json:"lastname,omitempty"`
	Birthday    *time.Time   `json:"birthday,omitempty"`
	Email       string      `json:"email,omitempty"`
	Login       string      `json:"login,omitempty"`
	Telephone   string      `json:"telephone,omitempty"`
	Password    string      `json:"password,omitempty"`
	FollowerNb  int64       `json:"follower_nb"`
	FollowingNb int64       `json:"following_nb"`
	Created     *time.Time   `json:"created,omitempty"`
	Updated     *time.Time   `json:"updated,omitempty"`
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
	FriendshipId    sql.NullInt64   `json:"friendship_id"`
}

type SingleUserDataResponse struct {
	UserForm
	FriendshipId    int64           `json:"friendship_id,omitempty"`
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
