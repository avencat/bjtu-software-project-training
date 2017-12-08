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

func CreateLikeComment(c echo.Context) error {

	now := time.Now()

	var body types.LikeCommentForm; var err error
	c.Bind(&body)
	loggedId := getUserId(c)

	if body.CommentId <= 0 {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "post_id can not be null.",
		})

	} else {

		err = db.App.Db.QueryRow("INSERT INTO comment_likes(user_id, comment_id, created, updated) " +
			"values($1, $2, $3, $3) " +
			"RETURNING comment_likes.id AS comment_like_id",
			loggedId, body.CommentId, now).Scan(&body.Id)

		if err != nil || body.Id <= 0 {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})
		}

		return c.JSON(http.StatusCreated, echo.Map{
			"status":  "success",
			"comment_like_id": body.Id,
			"message": fmt.Sprintf("Inserted one like from user %v to comment %v", loggedId, body.CommentId),
		})
	}
}

func DeleteLikeComment(c echo.Context) error {

	likeId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	loggedId := getUserId(c)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":   "error",
			"message":  "Id not provided",
		})
	}

	like, err := findLikeCommentById(likeId)

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
			"message":  "You can't delete this like.",
		})
	} else {

		_, err := db.App.Db.Exec("DELETE FROM comment_likes WHERE id = $1", like.Id.Int)

		if err != nil {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})

		} else {
			message := fmt.Sprintf("Removed likeComment %v", like.Id.Int)

			return c.JSON(http.StatusOK, echo.Map{
				"status":  "success",
				"message": message,
			})
		}
	}
}

func findLikeCommentById(id int64) (types.LikeComment, error) {

	var like types.LikeComment

	err := db.App.Db.QueryRow("SELECT * FROM comment_likes WHERE id = $1", id).
		Scan(&like.Id, &like.UserId, &like.CommentId, &like.Created, &like.Updated)

	if err != nil {
		if err == pgx.ErrNoRows {
			return types.LikeComment{}, err
		} else {
			CheckErr(err)
			return types.LikeComment{}, err
		}
	}

	return like, nil
}

func GetLikeComments(c echo.Context) error {

	var commentId int64; var ok, err error; var results *pgx.Rows; var likes []types.SingleLikeCommentDataResponse
	commentId, ok = strconv.ParseInt(c.QueryParam("comment_id"), 10, 64)

	if ok != nil  {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "comment_id not provided.",
		})
	} else {
		results, err = db.App.Db.Query("SELECT comment_likes.id, comment_likes.user_id, comment_likes.comment_id, " +
			"comment_likes.created, comment_likes.updated, users.login, users.firstname, users.lastname " +
			"FROM comment_likes INNER JOIN users ON comment_likes.user_id = users.id " +
			"WHERE comment_likes.comment_id = $1", commentId)
	}

	if err != nil && err != pgx.ErrNoRows {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	for results.Next() {
		var like types.SingleLikeCommentData
		if err = results.
			Scan(&like.Id, &like.UserId, &like.CommentId, &like.Created, &like.Updated,
			&like.User.Login, &like.User.Firstname, &like.User.Lastname); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		}

		var singleLike types.SingleLikeCommentDataResponse

		if like.Id.Status == pgtype.Present {
			singleLike.Id = int64(like.Id.Int)
		}
		if like.UserId.Status == pgtype.Present {
			singleLike.UserId = int64(like.UserId.Int)
			singleLike.User.Id = int64(like.UserId.Int)
		}
		if like.CommentId.Status == pgtype.Present {
			singleLike.CommentId = int64(like.CommentId.Int)
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
		"message":  "Retrieved Likes of Comment",
	})
}
