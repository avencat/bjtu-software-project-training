package queries

import (
	"github.com/labstack/echo"
	"time"
	"../types"
	"net/http"
	"../db"
	"fmt"
	"strconv"
	"github.com/jackc/pgx"
	"github.com/jackc/pgx/pgtype"
)

func CreateLike(c echo.Context) error {

	now := time.Now()

	var body types.LikeForm; var err error
	c.Bind(&body)
	loggedId := getUserId(c)

	if body.PostId <= 0 {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "post_id can not be null.",
		})

	} else {

		err = db.App.Db.QueryRow("INSERT into post_likes(user_id, post_id, created, updated) "+
			"VALUES($1, $2, $3, $3) "+
			"RETURNING post_likes.id AS like_id",
			loggedId, body.PostId, now).Scan(&body.Id)

		if err != nil || body.Id <= 0 {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})
		}

		return c.JSON(http.StatusCreated, echo.Map{
			"status":  "success",
			"like_id": body.Id,
			"message": fmt.Sprintf("Inserted one like from user %v to post %v", loggedId, body.PostId),
		})
	}
}

func DeleteLike(c echo.Context) error {

	likeId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	loggedId := getUserId(c)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":   "error",
			"message":  "Id not provided",
		})
	}

	like, err := findLikeById(likeId)

	if err != nil {
		if err != pgx.ErrNoRows {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		} else {
			return c.JSON(http.StatusNotFound, echo.Map{
				"status":   "error",
				"message":  "Like not found",
			})
		}
	} else if like.UserId.Status != pgtype.Present || int64(like.UserId.Int) != loggedId {
		return c.JSON(http.StatusForbidden, echo.Map{
			"status":   "error",
			"message":  "You can't delete this like",
		})
	} else {

		_, err := db.App.Db.Exec("DELETE FROM post_likes WHERE id = $1", like.Id.Int)

		if err != nil {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})

		} else {
			message := fmt.Sprintf("Removed like %v", like.Id.Int)

			return c.JSON(http.StatusOK, echo.Map{
				"status":  "success",
				"message": message,
			})
		}
	}
}

func findLikeById(id int64) (types.Like, error) {

	var like types.Like

	err := db.App.Db.QueryRow("SELECT * FROM post_likes WHERE id = $1", id).
		Scan(&like.Id, &like.UserId, &like.PostId, &like.Created, &like.Updated)

	if err != nil {
		if err == pgx.ErrNoRows {
			return types.Like{}, err
		} else {
			CheckErr(err)
			return types.Like{}, err
		}
	}

	return like, nil
}

func GetLikes(c echo.Context) error {

	var postId int64; var ok, err error; var results *pgx.Rows; var likes []types.SingleLikeDataResponse
	postId, ok = strconv.ParseInt(c.QueryParam("post_id"), 10, 64)

	if ok != nil  {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "post_id not provided.",
		})
	} else {
		results, err = db.App.Db.Query("SELECT post_likes.id, post_likes.user_id, post_likes.post_id, post_likes.created, post_likes.updated, " +
			"users.login, users.firstname, users.lastname " +
			"FROM post_likes INNER JOIN users ON post_likes.user_id = users.id " +
			"WHERE post_likes.post_id = $1", postId)
	}

	if err != nil && err != pgx.ErrNoRows {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	for results.Next() {
		var like types.SingleLikeData
		if err = results.
			Scan(&like.Id, &like.UserId, &like.PostId, &like.Created, &like.Updated,
			&like.User.Login, &like.User.Firstname, &like.User.Lastname); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		}

		var singleLike types.SingleLikeDataResponse

		if like.Id.Status == pgtype.Present {
			singleLike.Id = int64(like.Id.Int)
		}
		if like.UserId.Status == pgtype.Present {
			singleLike.UserId = int64(like.UserId.Int)
			singleLike.User.Id = int64(like.UserId.Int)
		}
		if like.PostId.Status == pgtype.Present {
			singleLike.PostId = int64(like.PostId.Int)
		}
		if like.Created.Status == pgtype.Present {
			singleLike.Created = &(like.Created.Time)
		}
		if like.Updated.Status == pgtype.Present {
			singleLike.Updated = &(like.Updated.Time)
		}
		if like.User.Login.Status == pgtype.Present {
			singleLike.User.Login = like.User.Login.String
		}
		if like.User.Firstname.Status == pgtype.Present {
			singleLike.User.Firstname = like.User.Firstname.String
		}
		if like.User.Lastname.Status == pgtype.Present {
			singleLike.User.Lastname = like.User.Lastname.String
		}

		likes = append(likes, singleLike)
	}
	if err = results.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"status":   "success",
		"data":     likes,
		"message":  "Retrieved likes",
	})
}
