package queries

import (
	"net/http"
	"time"
	"../types"
	"../db"
	"fmt"
	"strconv"
	"database/sql"
	"github.com/labstack/echo"
	"github.com/jackc/pgx"
	"github.com/jackc/pgx/pgtype"
)

func CreateFriendship(c echo.Context) error {

	now := time.Now()

	var body types.FriendshipForm; var err error
	c.Bind(&body)
	loggedId := getUserId(c)

	if body.FollowingId == 0 {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "following_id can not be null.",
		})

	} else {

		err = db.Db.QueryRow("INSERT into friendships(following_id, follower_id, following_date, created, updated) " +
			"values($1, $2, $3, $3, $3) " +
			"RETURNING friendships.id AS friendship_id",
			body.FollowingId, loggedId, now).Scan(&body.Id)

		if err != nil || body.Id <= 0 {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":     "error",
				"message":    err.Error(),
			})
		}

		return c.JSON(http.StatusCreated, echo.Map{
			"status":         "success",
			"friendship_id":  body.Id,
			"message":        fmt.Sprintf("Inserted one friendship from user %v to user %v.",
				loggedId, body.FollowingId),
		})
	}
}

func DeleteFriendship(c echo.Context) error {

	friendshipId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	loggedId := getUserId(c)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":   "error",
			"message":  "Id not provided",
		})
	}

	friendship, err := findFriendshipById(friendshipId)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	} else if friendship.FollowerId.Status != pgtype.Present || int64(friendship.FollowerId.Int) != loggedId {

		return c.JSON(http.StatusForbidden, echo.Map{
			"status":   "error",
			"message":  "You can't delete this friendship",
		})

	} else {

		_, err := db.Db.Exec("DELETE FROM friendships WHERE id = $1", friendshipId)

		if err != nil {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})

		} else {
			message := fmt.Sprintf("Removed friendship %v", friendshipId)

			return c.JSON(http.StatusOK, echo.Map{
				"status":  "success",
				"message": message,
			})
		}
	}
}

func findFriendshipById(id int64) (types.Friendship, error) {

	var friendship types.Friendship

	err := db.Db.QueryRow("SELECT * FROM friendships WHERE id = $1", id).
		Scan(&friendship.Id, &friendship.FollowerId, &friendship.FollowingId, &friendship.FollowingDate, &friendship.Created, &friendship.Updated)

	if err != nil {
		if err == sql.ErrNoRows {
			return types.Friendship{}, err
		} else {
			CheckErr(err)
			return types.Friendship{}, err
		}
	}

	return friendship, nil
}

func GetFriendships(c echo.Context) error {

	loggedId := getUserId(c)
	var userId int64; var ok, err error; var results *pgx.Rows; var friendships []types.SingleFriendshipDataResponse
	userId, ok = strconv.ParseInt(c.Param("user_id"), 10, 64)
	if ok != nil || userId == 0 {
		userId, ok = strconv.ParseInt(c.Param("author_id"), 10, 64)
		if ok != nil || userId == 0 {
			userId = loggedId
		}
	}

	followers := c.Param("followers")
	followerId := c.Param("follower_id")
	followingId := c.Param("following_id")

	request := "SELECT friendships.id, friendships.following_id, friendships.follower_id, friendships.following_date, " +
		"users.login, users.firstname, users.lastname, users.id AS user_id " +
		"FROM friendships INNER JOIN users ON"
	requestEnd := " ORDER BY friendships.id DESC, friendships.following_date DESC"

	if followers == "true" {

		request += " friendships.follower_id = users.id WHERE friendships.following_id = $1"

		if followerId != "" {

			results, err = db.Db.Query(request + " AND friendships.follower_id = $2" + requestEnd, userId, followerId)

		} else {

			results, err = db.Db.Query(request + requestEnd, userId)

		}

	} else {

		request += " friendships.following_id = users.id WHERE friendships.follower_id = $1"

		if followingId != "" {

			results, err = db.Db.Query(request + " AND friendships.following_id = $2" + requestEnd, userId, followingId)

		} else {

			results, err = db.Db.Query(request + requestEnd, userId)

		}

	}

	if err != nil && err != sql.ErrNoRows {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	for results.Next() {
		var friendship types.SingleFriendshipData
		if err := results.
			Scan(&friendship.Id, &friendship.FollowingId, &friendship.FollowerId, &friendship.FollowingDate,
				&friendship.User.Login, &friendship.User.Firstname, &friendship.User.Lastname, &friendship.User.Id); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		}

		var singleFriendship types.SingleFriendshipDataResponse

		if friendship.Id.Status == pgtype.Present {
			singleFriendship.Id = int64(friendship.Id.Int)
		}
		if friendship.FollowingId.Status == pgtype.Present {
			singleFriendship.FollowingId = int64(friendship.FollowingId.Int)
		}
		if friendship.FollowerId.Status == pgtype.Present {
			singleFriendship.FollowerId = int64(friendship.FollowerId.Int)
		}
		if friendship.FollowingDate.Status == pgtype.Present {
			singleFriendship.FollowingDate = &(friendship.FollowingDate.Time)
		}
		if friendship.User.Login.Status == pgtype.Present {
			singleFriendship.User.Login = friendship.User.Login.String
		}
		if friendship.User.Firstname.Status == pgtype.Present {
			singleFriendship.User.Firstname = friendship.User.Firstname.String
		}
		if friendship.User.Lastname.Status == pgtype.Present {
			singleFriendship.User.Lastname = friendship.User.Lastname.String
		}
		if friendship.User.Id.Status == pgtype.Present {
			singleFriendship.User.Id = int64(friendship.User.Id.Int)
		}

		friendships = append(friendships, singleFriendship)
	}
	if err := results.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"status":   "success",
		"data":     friendships,
		"message":  "Retrieved friendships",
	})
}

func GetFollowingNb(c echo.Context) error {

	loggedId := getUserId(c)
	var userId int64; var ok, err error
	userId, ok = strconv.ParseInt(c.Param("user_id"), 10, 64)
	if ok != nil || userId == 0 {
		userId, ok = strconv.ParseInt(c.Param("author_id"), 10, 64)
		if ok != nil || userId == 0 {
			userId = loggedId
		}
	}

	var count pgtype.Int8

	err = db.Db.QueryRow("SELECT COUNT(id) FROM friendships WHERE follower_id = $1", userId).Scan(&count)

	if err != nil && err != sql.ErrNoRows {
		print(err.Error())
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"status":   "success",
		"data":     count.Int,
		"message":  "Retrieved number of users that follow user " + string(userId),
	})
}

func GetFollowerNb(c echo.Context) error {

	loggedId := getUserId(c)
	var userId int64; var ok, err error
	userId, ok = strconv.ParseInt(c.Param("user_id"), 10, 64)
	if ok != nil || userId == 0 {
		userId, ok = strconv.ParseInt(c.Param("author_id"), 10, 64)
		if ok != nil || userId == 0 {
			userId = loggedId
		}
	}

	var count pgtype.Int8

	err = db.Db.QueryRow("SELECT COUNT(id) FROM friendships WHERE following_id = $1", userId).Scan(&count)

	if err != nil && err != sql.ErrNoRows {
		print(err.Error())
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"status":   "success",
		"data":     count.Int,
		"message":  "Retrieved number of users that user " + string(userId) + " is following",
	})
}
