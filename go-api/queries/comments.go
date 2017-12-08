package queries

import (
	"github.com/labstack/echo"
	"../types"
	"time"
	"net/http"
	"../db"
	"fmt"
	"strconv"
	"github.com/jackc/pgx"
	"github.com/jackc/pgx/pgtype"
)

func CreateComment(c echo.Context) error {

	now := time.Now()

	var body types.CommentForm; var err error
	c.Bind(&body)
	loggedId := getUserId(c)

	if body.Content == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "content can not be null.",
		})
	} else if body.PostId == 0 {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "post_id can not be null.",
		})
	} else {

		err = db.App.Db.QueryRow("INSERT into comments(author_id, post_id, content, likes_nb, created, updated)"+
			"values($1, $2, $3, 0, $4, $4) "+
			"RETURNING comments.id AS comment_id",
			loggedId, body.PostId, body.Content, now).
			Scan(&body.Id)

		if err != nil || body.Id <= 0 {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})
		}

		return c.JSON(http.StatusCreated, echo.Map{
			"status":  "success",
			"comment_id": body.Id,
			"message": fmt.Sprintf("Inserted one comment for user %v to post %v.",
				loggedId, body.PostId),
		})
	}

}

func DeleteComment(c echo.Context) error {

	commentId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	loggedId := getUserId(c)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":   "error",
			"message":  "Id not provided",
		})
	}

	comment, err := findCommentById(commentId)

	if err != nil {
		if err != pgx.ErrNoRows {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		} else {
			return c.JSON(http.StatusNotFound, echo.Map{
				"status":   "error",
				"message":  "Comment not found",
			})
		}
	} else if comment.AuthorId.Status != pgtype.Present || int64(comment.AuthorId.Int) != loggedId {

		return c.JSON(http.StatusForbidden, echo.Map{
			"status":   "error",
			"message":  "You can't delete this comment",
		})

	} else {

		_, err := db.App.Db.Exec("DELETE FROM comments WHERE id = $1", comment.Id.Int)

		if err != nil {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})

		} else {
			message := fmt.Sprintf("Removed comment %v", comment.Id.Int)
			return c.JSON(http.StatusOK, echo.Map{
				"status":  "success",
				"message": message,
			})
		}
	}
}

func findCommentById(id int64) (types.Comment, error) {

	var comment types.Comment

	err := db.App.Db.QueryRow("SELECT * FROM comments WHERE id = $1", id).
		Scan(&comment.Id, &comment.AuthorId, &comment.PostId, &comment.Content, &comment.Created,
			&comment.Updated, &comment.LikesNb)

	if err != nil {
		if err == pgx.ErrNoRows {
			return types.Comment{}, err
		} else {
			CheckErr(err)
			return types.Comment{}, err
		}
	}

	return comment, nil
}

func GetComment(c echo.Context) error {

	var err error
	var comment types.SingleCommentData
	commentId, ok := strconv.ParseInt(c.Param("id"), 10, 64)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "id not specified.",
		})
	}

	err = db.App.Db.QueryRow("SELECT comments.id, comments.content, comments.author_id, comments.likes_nb, " +
		"comments.post_id, comments.created, comments.updated, users.login, users.firstname, users.lastname " +
		"FROM comments INNER JOIN users ON comments.author_id = users.id WHERE comments.id = $1", commentId).
		Scan(&comment.Id, &comment.Content, &comment.AuthorId, &comment.LikesNb, &comment.PostId, &comment.Created,
			&comment.Updated, &comment.User.Login, &comment.User.Firstname, &comment.User.Lastname)

	if err != nil && err != pgx.ErrNoRows {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":  "error",
			"message": err.Error(),
		})
	} else {
		message := fmt.Sprintf("Retrieved comment %v.", comment.Id)
		return c.JSON(http.StatusOK, echo.Map{
			"status":   "success",
			"data":     comment,
			"message":  message,
		})
	}
}

func GetComments(c echo.Context) error {

	var postId int64; var ok, err error; var results *pgx.Rows; var comments []types.SingleCommentDataResponse
	postId, ok = strconv.ParseInt(c.QueryParam("post_id"), 10, 64)

	if ok != nil  {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "post_id not provided.",
		})
	} else {
		results, err = db.App.Db.Query("SELECT comments.id, comments.content, comments.author_id, " +
			"comments.likes_nb, comments.post_id, comments.created, comments.updated, users.login, users.firstname, " +
			"users.lastname FROM comments INNER JOIN users ON comments.author_id = users.id " +
			"WHERE comments.post_id = $1 ORDER BY comments.created ASC", postId)
	}

	if err != nil && err != pgx.ErrNoRows {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	for results.Next() {
		var comment types.SingleCommentData
		if err = results.
			Scan(&comment.Id, &comment.Content, &comment.AuthorId, &comment.LikesNb, &comment.PostId,
				&comment.Created, &comment.Updated, &comment.User.Login, &comment.User.Firstname,
				&comment.User.Lastname); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		}

		var singleComment types.SingleCommentDataResponse

		if comment.Id.Status == pgtype.Present {
			singleComment.Id = int64(comment.Id.Int)
		}
		if comment.Content.Status == pgtype.Present {
			singleComment.Content = comment.Content.String
		}
		if comment.AuthorId.Status == pgtype.Present {
			singleComment.AuthorId = int64(comment.AuthorId.Int)
			singleComment.User.Id = int64(comment.AuthorId.Int)
		}
		if comment.LikesNb.Status == pgtype.Present {
			singleComment.LikesNb = int64(comment.LikesNb.Int)
		}
		if comment.PostId.Status == pgtype.Present {
			singleComment.PostId = int64(comment.PostId.Int)
		}
		if comment.Created.Status == pgtype.Present {
			singleComment.Created = &(comment.Created.Time)
		}
		if comment.Updated.Status == pgtype.Present {
			singleComment.Updated = &(comment.Updated.Time)
		}
		if comment.User.Login.Status == pgtype.Present {
			singleComment.User.Login = comment.User.Login.String
		}
		if comment.User.Firstname.Status == pgtype.Present {
			singleComment.User.Firstname = comment.User.Firstname.String
		}
		if comment.User.Lastname.Status == pgtype.Present {
			singleComment.User.Lastname = comment.User.Lastname.String
		}

		comments = append(comments, singleComment)
	}
	if err = results.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"status":   "success",
		"data":     comments,
		"message":  "Retrieved friendships",
	})
}

func UpdateComment(c echo.Context) error {

	loggedId := getUserId(c)
	commentId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	now := time.Now()
	var body types.CommentForm; var err error
	c.Bind(&body)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "id not specified.",
		})
	}

	comment, err := findCommentById(commentId)

	if err != nil {
		if err != pgx.ErrNoRows {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		} else {
			return c.JSON(http.StatusNotFound, echo.Map{
				"status":   "error",
				"message":  "Post not found",
			})
		}
	} else if loggedId != int64(comment.AuthorId.Int) {
		return c.JSON(http.StatusForbidden, echo.Map{
			"status":   "error",
			"message":  "You can't update this comment",
		})
	} else if body.Content == "" {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":  "error",
			"message": "content can not be null.",
		})

	} else {

		_, err = db.App.Db.Exec("UPDATE comments SET content=COALESCE($1, content), updated=$2 WHERE id=$3",
		body.Content, now, commentId)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})
		} else {
			message := fmt.Sprintf("Updated comment %v.", comment.Id)
			return c.JSON(http.StatusOK, echo.Map{
				"status":  "success",
				"message": message,
			})
		}
	}
}
