package queries

import (
	"net/http"
	"time"
	"../types"
	"encoding/json"
	"../db"
	"fmt"
	"github.com/gorilla/mux"
	"strconv"
	"database/sql"
)

func CreateFriendship(res http.ResponseWriter, req *http.Request) {

	now := time.Now()

	var body types.FriendshipForm
	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&body)
	if err != nil {
		panic(err)
	}
	defer req.Body.Close()
	loggedId := req.Context().Value(types.MyUserKey{}).(int64)

	if body.FollowingId == 0 {

		db.JsonResponse(http.StatusBadRequest, res, types.Response{
			Status:     "error",
			Message:    "following_id can not be null.",
		})
		return

	} else {

		err = db.Db.QueryRow("INSERT into friendships(following_id, follower_id, following_date, created, updated) " +
			"values($1, $2, $3, $3, $3) " +
			"RETURNING friendships.id AS friendship_id",
			body.FollowingId, loggedId, now).Scan(&body.Id)

		if err != nil || body.Id <= 0 {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    err.Error(),
			})
			CheckErr(err)
			return
		}

		db.JsonResponse(http.StatusCreated, res, types.FriendshipResponse{
			Status:         "success",
			FriendshipId:   body.Id,
			Message:        fmt.Sprintf("Inserted one friendship from user %v to user %v.", loggedId, body.FollowingId),
		})
	}
}

func DeleteFriendship(res http.ResponseWriter, req *http.Request) {

	vars := mux.Vars(req)
	deleteIdString := vars["id"]
	friendshipId, ok := strconv.ParseInt(deleteIdString, 10, 64)
	loggedId := req.Context().Value(types.MyUserKey{}).(int64)

	if ok != nil {
		db.JsonResponse(http.StatusBadRequest, res, types.Response{
			Status:     "error",
			Message:    "Id not provided.",
		})
		return
	}

	friendship, err := findFriendshipById(friendshipId)

	if err != nil {
		db.JsonResponse(http.StatusInternalServerError, res, types.Response{
			Status:     "error",
			Message:    err.Error(),
		})
		CheckErr(err)
		return
	} else if !friendship.FollowerId.Valid || friendship.FollowerId.Int64 != loggedId {

		db.JsonResponse(http.StatusForbidden, res, types.Response{
			Status:     "error",
			Message:    "You can't delete this friendship",
		})
		return

	} else {

		_, err := db.Db.Exec("DELETE FROM friendships WHERE id = $1", friendshipId)

		if err != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:  "error",
				Message: err.Error(),
			})
		} else {
			message := fmt.Sprintf("Removed friendship %v", friendshipId)
			db.JsonResponse(http.StatusOK, res, types.Response{
				Status:  "success",
				Message: message,
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

func GetFriendships(res http.ResponseWriter, req *http.Request) {

	loggedId := req.Context().Value(types.MyUserKey{}).(int64)
	var userId int64; var ok, err error; var results *sql.Rows; var friendships []types.SingleFriendshipDataResponse
	vars := mux.Vars(req)
	userIdString := vars["user_id"]
	if userIdString == "" {
		userIdString = vars["author_id"]
		if userIdString == "" {
			userId = loggedId
		} else {
			userId, ok = strconv.ParseInt(userIdString, 10, 64)
			if ok != nil {
				db.JsonResponse(http.StatusInternalServerError, res, types.Response{
					Status:     "error",
					Message:    ok.Error(),
				})
				CheckErr(ok)
				return
			}
		}
	} else {
		userId, ok = strconv.ParseInt(userIdString, 10, 64)
		if ok != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    ok.Error(),
			})
			CheckErr(ok)
			return
		}
	}

	followers := vars["followers"]
	followerId := vars["follower_id"]
	followingId := vars["following_id"]

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
		db.JsonResponse(http.StatusInternalServerError, res, types.Response{
			Status:     "error",
			Message:    err.Error(),
		})
		CheckErr(err)
		return
	}
	defer results.Close()

	for results.Next() {
		var friendship types.SingleFriendshipData
		if err := results.
			Scan(&friendship.Id, &friendship.FollowingId, &friendship.FollowerId, &friendship.FollowingDate,
				&friendship.User.Login, &friendship.User.Firstname, &friendship.User.Lastname, &friendship.User.Id); err != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    err.Error(),
			})
			CheckErr(err)
			return
		}

		var singleFriendship types.SingleFriendshipDataResponse

		if friendship.Id.Valid {
			singleFriendship.Id = friendship.Id.Int64
		}
		if friendship.FollowingId.Valid {
			singleFriendship.FollowingId = friendship.FollowingId.Int64
		}
		if friendship.FollowerId.Valid {
			singleFriendship.FollowerId = friendship.FollowerId.Int64
		}
		if friendship.FollowingDate.Valid {
			singleFriendship.FollowingDate = &(friendship.FollowingDate.Time)
		}
		if friendship.User.Login.Valid {
			singleFriendship.User.Login = friendship.User.Login.String
		}
		if friendship.User.Firstname.Valid {
			singleFriendship.User.Firstname = friendship.User.Firstname.String
		}
		if friendship.User.Lastname.Valid {
			singleFriendship.User.Lastname = friendship.User.Lastname.String
		}
		if friendship.User.Id.Valid {
			singleFriendship.User.Id = friendship.User.Id.Int64
		}

		friendships = append(friendships, singleFriendship)
	}
	if err := results.Err(); err != nil {
		db.JsonResponse(http.StatusInternalServerError, res, types.Response{
			Status:     "error",
			Message:    err.Error(),
		})
		CheckErr(err)
		return
	}

	db.JsonResponse(http.StatusOK, res, types.ResponseData{
		Status:     "success",
		Data:       friendships,
		Message:    "Retrieved friendships",
	})
}

func GetFollowingNb(res http.ResponseWriter, req *http.Request) {

	loggedId := req.Context().Value(types.MyUserKey{}).(int64)
	var userId int64; var ok, err error
	vars := mux.Vars(req)
	userIdString := vars["user_id"]
	if userIdString == "" {
		userIdString = vars["author_id"]
		if userIdString == "" {
			userId = loggedId
		} else {
			userId, ok = strconv.ParseInt(userIdString, 10, 64)
			if ok != nil {
				db.JsonResponse(http.StatusInternalServerError, res, types.Response{
					Status:     "error",
					Message:    ok.Error(),
				})
				CheckErr(ok)
				return
			}
		}
	} else {
		userId, ok = strconv.ParseInt(userIdString, 10, 64)
		if ok != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    ok.Error(),
			})
			CheckErr(ok)
			return
		}
	}

	var count sql.NullInt64

	err = db.Db.QueryRow("SELECT COUNT(id) FROM friendships WHERE follower_id = $1", userId).Scan(&count)

	if err != nil && err != sql.ErrNoRows {
		db.JsonResponse(http.StatusInternalServerError, res, types.Response{
			Status:     "error",
			Message:    err.Error(),
		})
		CheckErr(err)
		return
	}

	db.JsonResponse(http.StatusOK, res, types.ResponseData{
		Status:     "success",
		Data:       count.Int64,
		Message:    "Retrieved number of users that follow user " + string(userId),
	})

}

func GetFollowerNb(res http.ResponseWriter, req *http.Request) {

	loggedId := req.Context().Value(types.MyUserKey{}).(int64)
	var userId int64; var ok, err error
	vars := mux.Vars(req)
	userIdString := vars["user_id"]
	if userIdString == "" {
		userIdString = vars["author_id"]
		if userIdString == "" {
			userId = loggedId
		} else {
			userId, ok = strconv.ParseInt(userIdString, 10, 64)
			if ok != nil {
				db.JsonResponse(http.StatusInternalServerError, res, types.Response{
					Status:     "error",
					Message:    ok.Error(),
				})
				CheckErr(ok)
				return
			}
		}
	} else {
		userId, ok = strconv.ParseInt(userIdString, 10, 64)
		if ok != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    ok.Error(),
			})
			CheckErr(ok)
			return
		}
	}

	var count sql.NullInt64

	err = db.Db.QueryRow("SELECT COUNT(id) FROM friendships WHERE following_id = $1", userId).Scan(&count)

	if err != nil && err != sql.ErrNoRows {
		db.JsonResponse(http.StatusInternalServerError, res, types.Response{
			Status:     "error",
			Message:    err.Error(),
		})
		CheckErr(err)
		return
	}

	db.JsonResponse(http.StatusOK, res, types.ResponseData{
		Status:     "success",
		Data:       count.Int64,
		Message:    "Retrieved number of users that user " + string(userId) + " is following",
	})

}
