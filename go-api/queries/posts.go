package queries

import (
	"github.com/labstack/echo"
	"time"
	"../types"
	"net/http"
	"fmt"
	"../db"
	"strconv"
	"github.com/jackc/pgx/pgtype"
	"github.com/jackc/pgx"
)

func CreatePost(c echo.Context) error {

	now := time.Now()

	var body types.PostForm; var err error
	c.Bind(&body)
	loggedId := getUserId(c)

	if body.Content == "" {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "content can not be null.",
		})

	} else {

		err = db.App.Db.QueryRow("INSERT INTO posts(author_id, content, comments_nb, likes_nb, created, updated) "+
			"VALUES($1, $2, 0, 0, $3, $3) "+
			"RETURNING posts.id AS post_id",
			loggedId, body.Content, now).Scan(&body.Id)

		if err != nil || body.Id <= 0 {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})
		}

		return c.JSON(http.StatusCreated, echo.Map{
			"status":  "success",
			"post_id": body.Id,
			"message": fmt.Sprintf("Inserted one post for user %v.",
				loggedId),
		})
	}

}

func DeletePost(c echo.Context) error {

	postId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	loggedId := getUserId(c)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":   "error",
			"message":  "Id not provided",
		})
	}

	post, err := findPostById(postId)

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
	} else if post.AuthorId.Status != pgtype.Present || int64(post.AuthorId.Int) != loggedId {

		return c.JSON(http.StatusForbidden, echo.Map{
			"status":   "error",
			"message":  "You can't delete this post",
		})

	} else {

		_, err := db.App.Db.Exec("DELETE FROM posts WHERE id = $1", post.Id.Int)

		if err != nil {

			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})

		} else {
			message := fmt.Sprintf("Removed post %v", post.Id.Int)

			return c.JSON(http.StatusOK, echo.Map{
				"status":  "success",
				"message": message,
			})
		}
	}
}

func findPostById(id int64) (types.Post, error) {

	var post types.Post

	err := db.App.Db.QueryRow("SELECT * FROM posts WHERE id = $1", id).
		Scan(&post.Id, &post.AuthorId, &post.Content, &post.Created, &post.Updated, &post.CommentsNb, &post.LikesNb)

	if err != nil {
		if err == pgx.ErrNoRows {
			return types.Post{}, err
		} else {
			CheckErr(err)
			return types.Post{}, err
		}
	}

	return post, nil
}

func GetAllPosts(c echo.Context) error {

	loggedId := getUserId(c)
	var userId int64; var ok, err error; var results *pgx.Rows; var posts []types.SinglePostDataResponse
	userId, ok = strconv.ParseInt(c.QueryParam("user_id"), 10, 64)
	if ok != nil || userId == 0 {
		userId, ok = strconv.ParseInt(c.QueryParam("author_id"), 10, 64)
	}
	request := "SELECT posts.id, posts.content, posts.author_id, posts.likes_nb, posts.comments_nb, posts.created, posts.updated, " +
		"users.login, users.firstname, users.lastname " +
		"FROM posts INNER JOIN users ON posts.author_id = users.id "
	requestEnd := " ORDER BY posts.created DESC, posts.id DESC"

	if ok == nil  {
		if userId == loggedId {
			results, err = db.App.Db.Query(request + "WHERE posts.author_id = $1" + requestEnd, loggedId)
		} else {
			results, err = db.App.Db.Query(request + "WHERE posts.author_id " +
				"IN (SELECT following_id FROM friendships WHERE follower_id = $1 AND following_id = $2)" + requestEnd,
					loggedId, userId)
		}
	} else {
		results, err = db.App.Db.Query(request + "WHERE posts.author_id IN (SELECT following_id FROM friendships " +
			"WHERE follower_id = $1) OR posts.author_id = $1" + requestEnd, loggedId)
	}

	if err != nil && err != pgx.ErrNoRows {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	for results.Next() {
		var post types.SinglePostData
		if err := results.
			Scan(&post.Id, &post.Content, &post.AuthorId, &post.LikesNb, &post.CommentsNb, &post.Created, &post.Updated,
			&post.User.Login, &post.User.Firstname, &post.User.Lastname); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		}

		var singlePost types.SinglePostDataResponse

		if post.Id.Status == pgtype.Present {
			singlePost.Id = int64(post.Id.Int)
		}
		if post.Content.Status == pgtype.Present {
			singlePost.Content = post.Content.String
		}
		if post.AuthorId.Status == pgtype.Present {
			singlePost.AuthorId = int64(post.AuthorId.Int)
			singlePost.User.Id = int64(post.AuthorId.Int)
		}
		if post.LikesNb.Status == pgtype.Present {
			singlePost.LikesNb = int64(post.LikesNb.Int)
		}
		if post.CommentsNb.Status == pgtype.Present {
			singlePost.CommentsNb = int64(post.CommentsNb.Int)
		}
		if post.Created.Status == pgtype.Present {
			singlePost.Created = &(post.Created.Time)
		}
		if post.Updated.Status == pgtype.Present {
			singlePost.Updated = &(post.Updated.Time)
		}
		if post.User.Login.Status == pgtype.Present {
			singlePost.User.Login = post.User.Login.String
		}
		if post.User.Firstname.Status == pgtype.Present {
			singlePost.User.Firstname = post.User.Firstname.String
		}
		if post.User.Lastname.Status == pgtype.Present {
			singlePost.User.Lastname = post.User.Lastname.String
		}

		posts = append(posts, singlePost)
	}
	if err := results.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"status":   "success",
		"data":     posts,
		"message":  "Retrieved friendships",
	})
}

func GetSinglePost(c echo.Context) error {

	var err error
	var post types.SinglePostData
	postId, ok := strconv.ParseInt(c.Param("id"), 10, 64)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "id not specified.",
		})
	}

	err = db.App.Db.QueryRow("SELECT posts.id, posts.content, posts.author_id, posts.likes_nb, posts.comments_nb, posts.created, posts.updated, " +
		"users.login, users.firstname, users.lastname " +
		"FROM posts INNER JOIN users ON posts.author_id = users.id " +
		"WHERE posts.id = $1 " +
		"ORDER BY posts.id DESC, posts.created DESC",postId).
		Scan(&post.Id, &post.Content, &post.AuthorId, &post.LikesNb, &post.CommentsNb, &post.Created, &post.Updated,
			&post.User.Login, &post.User.Firstname, &post.User.Lastname)

	if err != nil && err != pgx.ErrNoRows {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":  "error",
			"message": err.Error(),
		})
	} else {
		message := fmt.Sprintf("Retrieved post %v.", post.Id)
		return c.JSON(http.StatusOK, echo.Map{
			"status":   "success",
			"data":     post,
			"message":  message,
		})
	}
}

func UpdatePost(c echo.Context) error {

	loggedId := getUserId(c)
	postId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	now := time.Now()
	var body types.PostForm; var err error
	c.Bind(&body)

	if ok != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":     "error",
			"message":    "id not specified.",
		})
	}

	post, err := findPostById(postId)

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
	} else if loggedId != int64(post.AuthorId.Int) {
		return c.JSON(http.StatusForbidden, echo.Map{
			"status":   "error",
			"message":  "You can't update this post",
		})
	} else if body.Content == "" {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":  "error",
			"message": "content can not be null.",
		})

	} else {

		_, err = db.App.Db.Exec("UPDATE posts SET content=COALESCE($1, content), updated=$2 WHERE id=$3",
			body.Content, now, postId)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":  "error",
				"message": err.Error(),
			})
		} else {
			message := fmt.Sprintf("Updated post %v.", post.Id)
			return c.JSON(http.StatusOK, echo.Map{
				"status":  "success",
				"message": message,
			})
		}
	}
}
