package queries

import (
	"../db"
	"net/http"
	"time"
	"github.com/dgrijalva/jwt-go"
	"../types"
	"fmt"
	"strings"
	"golang.org/x/crypto/bcrypt"
	"regexp"
	"strconv"
	"github.com/labstack/echo"
	"github.com/jackc/pgx"
	"github.com/jackc/pgx/pgtype"
)


const JwtSecret = "25015c61-030e-452f-a92f-5b8cdb0b627e"


func CreateUser(c echo.Context) error {

	mailRegex := "(\\w[-._\\w]*\\w@\\w[-._\\w]*\\w\\.\\w{2,3})"
	loginRegex := "^[a-z_0-9]{5,}$"
	emailErrorRegex := "(users_email_key)"
	loginErrorRegex := "(users_login_key)"
	now := time.Now()

	var body types.UserForm
	c.Bind(&body)

	var matchEmail, matchLogin bool

	if body.Email != "" {
		body.Email = strings.TrimSpace(strings.ToLower(body.Email))
		matchEmail, _ = regexp.MatchString(mailRegex, body.Email)
	} else {
		matchEmail = false
	}

	if body.Login != "" {
		body.Login = strings.TrimSpace(strings.ToLower(body.Login))
		matchLogin, _ = regexp.MatchString(loginRegex, body.Login)
	} else {
		matchLogin = false
	}

	if len(body.Password) < 6 {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":         "error",
			"message":        "Password should be at least 6 characters.",
		})

	} else if !matchEmail {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":         "error",
			"message":        "Bad email.",
		})

	} else if !matchLogin {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":         "error",
			"message":        "Login should be at least 5 characters and use only a-z, 1-9 or _.",
		})

	} else {

		pass, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)

		body.Password = string(pass)

		firstname := db.NewNullString(body.Firstname)
		lastname := db.NewNullString(body.Lastname)
		telephone := db.NewNullString(body.Telephone)

		_, err := db.App.Db.Exec("INSERT into users(firstname, lastname, birthday, email, login, telephone, password, created, updated, following_nb, follower_nb) values($1, $2, $3, $4, $5, $6, $7, $8, $8, 0, 0)",
		&firstname, &lastname, body.Birthday, body.Email,
			body.Login, &telephone, body.Password, now)

		if err != nil {
			if matchErrorEmail, _ := regexp.MatchString(emailErrorRegex, err.Error()); matchErrorEmail {

				return c.JSON(http.StatusBadRequest, echo.Map{
					"status":         "error",
					"message":        "Email already taken.",
				})

			} else if matchError, _ := regexp.MatchString(loginErrorRegex, err.Error()); matchError {
				return c.JSON(http.StatusBadRequest, echo.Map{
					"status":         "error",
					"message":        "Login already taken.",
				})
			} else {

				return c.JSON(http.StatusBadRequest, echo.Map{
					"status":         "error",
					"message":        err.Error(),
				})
			}
		} else {

			return c.JSON(http.StatusBadRequest, echo.Map{
				"status":         "success",
				"message":        "Inserted one user",
			})
		}

	}

}


func DeleteUser(c echo.Context) error {
	deleteId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	userId := getUserId(c)

	if ok != nil || userId != deleteId {
		return c.JSON(http.StatusForbidden, echo.Map{
			"status":         "error",
			"message":        "You are not authorized to delete this user.",
		})
	} else {

		_, err := db.App.Db.Exec("DELETE FROM users WHERE id = $1", userId)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":         "error",
				"message":        err.Error(),
			})
		} else {
			message := fmt.Sprintf("Removed user %v", userId)
			return c.JSON(http.StatusOK, echo.Map{
				"status":     "success",
				"message":    message,
			})
		}

	}
}


func FindUserById(id int64) (types.User, error) {

	var user types.User

	err := db.App.Db.QueryRow("SELECT * FROM users WHERE id = $1", id).
		Scan(&user.Id, &user.Firstname, &user.Lastname, &user.Birthday, &user.Email,
		&user.Login, &user.Telephone, &user.Password, &user.Created, &user.Updated,
		&user.FollowingNb, &user.FollowerNb)

	if err != nil {
		if err == pgx.ErrNoRows {
			return types.User{}, err
		} else {
			CheckErr(err)
			return types.User{}, err
		}
	}

	return user, nil
}


func FindUserByLogin(username string) (types.User, error) {

	var user types.User

	err := db.App.Db.QueryRow("SELECT * FROM users WHERE login = $1", username).
		Scan(&user.Id, &user.Firstname, &user.Lastname, &user.Birthday, &user.Email,
		&user.Login, &user.Telephone, &user.Password, &user.Created, &user.Updated,
		&user.FollowingNb, &user.FollowerNb)

	if err != nil {
		if err == pgx.ErrNoRows {
			return types.User{}, err
		} else {
			CheckErr(err)
			return types.User{}, err
		}
	}

	return user, nil
}


// create a JWT and return it to the client
func Login(c echo.Context) error {

	var credentials types.LoginCredentials
	c.Bind(&credentials)

	user, err := FindUserByLogin(credentials.Login)

	passwordMatch := bcrypt.CompareHashAndPassword([]byte(user.Password.String), []byte(credentials.Password))

	if err == nil && user.Id.Status == pgtype.Present && passwordMatch == nil {

		// Set custom claims
		/*claims := types.Claims {
			Id: user.Id.Int64,
			StandardClaims: jwt.StandardClaims{
				ExpiresAt: time.Now().Add(time.Hour * 72).Unix(),
			},
		}*/

		// Create token with claims
		token := jwt.New(jwt.SigningMethodHS256)

		claims := token.Claims.(jwt.MapClaims)
		claims["id"] = user.Id.Int
		claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

		// Generate encoded token and send it as response.
		t, err := token.SignedString([]byte(JwtSecret))
		if err != nil {
			return err
		}
		return c.JSON(http.StatusOK, echo.Map{
			"status":         "success",
			"message":        "User successfully logged in.",
			"token":          t,
			"user_id":        user.Id.Int,
			"following_nb":   user.FollowingNb.Int,
		})
	} else {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"status":         "error",
			"message":        "Incorrect username or password.",
		})
	}
}


func GetSingleUser(c echo.Context) error {

	var err error

	userId, ok := strconv.ParseInt(c.Param("id"), 10, 64)
	loggedId := getUserId(c)

	if ok != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"status":     "error",
			"message":    "You are not authorized to access this content.",
		})
	}

	request := "SELECT users.id, users.login, users.firstname, users.lastname, users.birthday, " +
		"users.following_nb, users.follower_nb, friendships.id AS friendship_id"

	var userData types.SingleUserData

	if userId == loggedId {

		err = db.App.Db.QueryRow(request + ", users.telephone, users.email FROM users " +
			"LEFT JOIN friendships ON friendships.follower_id = $1 AND friendships.following_id = $2 " +
			"WHERE users.id = $2", loggedId, userId).Scan(&userData.Id, &userData.Login, &userData.Firstname,
			&userData.Lastname, &userData.Birthday, &userData.FollowingNb, &userData.FollowerNb,
			&userData.FriendshipId, &userData.Telephone, &userData.Email)

	} else {

		err = db.App.Db.QueryRow(request + " FROM users " +
			"LEFT JOIN friendships ON friendships.follower_id = $1 AND friendships.following_id = $2 " +
			"WHERE users.id = $2", loggedId, userId).
			Scan(&userData.Id, &userData.Login, &userData.Firstname, &userData.Lastname, &userData.Birthday,
			&userData.FollowingNb, &userData.FollowerNb, &userData.FriendshipId)

	}

	if err != nil && err != pgx.ErrNoRows {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":     "error",
			"message":    err.Error(),
		})
	} else if err == pgx.ErrNoRows {
		return c.JSON(http.StatusNotFound, echo.Map{
			"status":   "error",
			"message":  "Not found.",
		})
	}

	var userDataResponse types.SingleUserDataResponse

	if userData.Id.Status == pgtype.Present {
		userDataResponse.Id = int64(userData.Id.Int)
	}
	if userData.Login.Status == pgtype.Present {
		userDataResponse.Login = userData.Login.String
	}
	if userData.Firstname.Status == pgtype.Present {
		userDataResponse.Firstname = userData.Firstname.String
	}
	if userData.Lastname.Status == pgtype.Present {
		userDataResponse.Lastname = userData.Lastname.String
	}
	if userData.Birthday.Status == pgtype.Present {
		userDataResponse.Birthday = &(userData.Birthday.Time)
	}
	if userData.FollowingNb.Status == pgtype.Present {
		userDataResponse.FollowingNb = int64(userData.FollowingNb.Int)
	}
	if userData.FollowerNb.Status == pgtype.Present {
		userDataResponse.FollowerNb = int64(userData.FollowerNb.Int)
	}
	if userData.FriendshipId.Status == pgtype.Present {
		userDataResponse.FriendshipId = int64(userData.FriendshipId.Int)
	}
	if userData.Email.Status == pgtype.Present {
		userDataResponse.Email = userData.Email.String
	}
	if userData.Telephone.Status == pgtype.Present {
		userDataResponse.Telephone = userData.Telephone.String
	}

	response := types.SingleUserResponse{
		Status:         "success",
		User:           userDataResponse,
		Message:        "User successfully retrieved.",
	}

	return c.JSON(http.StatusOK, response)
}


func GetUsers(c echo.Context) error {

	var results *pgx.Rows; var err error; var users []types.SingleUserDataResponse

	loggedId := getUserId(c)

	query := "SELECT users.id, users.firstname, users.lastname, users.login, users.birthday, users.following_nb," +
		" users.follower_nb, friendships.id AS friendship_id, friendships.following_date AS following_date " +
		"FROM users " +
		"LEFT JOIN friendships " +
		"ON friendships.following_id = users.id AND friendships.follower_id = $1 " +
		"WHERE users.id != $1"

	q := string(c.QueryParam("q"))

	if q != "" {

		results, err = db.App.Db.Query(query + " AND (users.firstname LIKE $2 OR users.lastname " +
			"LIKE $2 OR users.login LIKE $2 OR users.email = $3) ORDER BY friendships.following_id DESC",
			loggedId, "%" + q + "%", q)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		}

	} else {

		results, err = db.App.Db.Query(query + " ORDER BY friendships.following_id DESC",
			loggedId)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		}

	}
	defer results.Close()

	for results.Next() {
		var user types.SingleUserData
		if err := results.
			Scan(&user.Id, &user.Firstname, &user.Lastname, &user.Login, &user.Birthday,
			&user.FollowingNb, &user.FollowerNb, &user.FriendshipId, &user.FollowingDate); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"status":   "error",
				"message":  err.Error(),
			})
		}

		var singleUser types.SingleUserDataResponse

		if user.Id.Status == pgtype.Present {
			singleUser.Id = int64(user.Id.Int)
		}
		if user.Login.Status == pgtype.Present {
			singleUser.Login = user.Login.String
		}
		if user.Firstname.Status == pgtype.Present {
			singleUser.Firstname = user.Firstname.String
		}
		if user.Lastname.Status == pgtype.Present {
			singleUser.Lastname = user.Lastname.String
		}
		if user.Birthday.Status == pgtype.Present {
			singleUser.Birthday = &(user.Birthday.Time)
		}
		if user.FollowingNb.Status == pgtype.Present {
			singleUser.FollowingNb = int64(user.FollowingNb.Int)
		}
		if user.FollowerNb.Status == pgtype.Present {
			singleUser.FollowerNb = int64(user.FollowerNb.Int)
		}
		if user.FriendshipId.Status == pgtype.Present {
			singleUser.FriendshipId = int64(user.FriendshipId.Int)
		}
		if user.FollowingDate.Status == pgtype.Present {
			singleUser.FollowingDate = &(user.FollowingDate.Time)
		}

		users = append(users, singleUser)
	}
	if err := results.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"status":   "error",
			"message":  err.Error(),
		})
	}

	response := types.MultipleUserResponse{
		Status:         "success",
		Data:           users,
		Message:        "Retrieved users",
	}

	return c.JSON(http.StatusOK, response)
}


// middleware to grant access to private pages
func ValidateToken(c echo.Context) bool {
	if strings.Contains(c.Request().URL.String(), "login") {

		return true

	} else if strings.Contains(c.Request().URL.String(), "register") {

		return true

	} else if c.Request().Method == echo.OPTIONS {

		return true

	}

	return false
}


func UpdateUser(c echo.Context) error {

	mailRegex := "(\\w[-._\\w]*\\w@\\w[-._\\w]*\\w\\.\\w{2,3})"
	loginRegex := "^[a-z_0-9]{5,}$"
	emailErrorRegex := "(users_email_key)"
	loginErrorRegex := "(users_login_key)"
	now := time.Now()

	loggedId := getUserId(c)

	var body types.UserForm
	c.Bind(&body)

	var matchEmail, matchLogin bool

	if body.Email != "" {
		body.Email = strings.TrimSpace(strings.ToLower(body.Email))
		matchEmail, _ = regexp.MatchString(mailRegex, body.Email)
	} else {
		matchEmail = false
	}

	if body.Login != "" {
		body.Login = strings.TrimSpace(strings.ToLower(body.Login))
		matchLogin, _ = regexp.MatchString(loginRegex, body.Login)
	} else {
		matchLogin = false
	}

	if password := db.NewNullString(body.Password); password.Valid && len(body.Password) < 6 {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":   "error",
			"message":  "Password should be at least 6 characters.",
		})

	} else if !matchEmail {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":   "error",
			"message":  "Bad email.",
		})

	} else if !matchLogin {

		return c.JSON(http.StatusBadRequest, echo.Map{
			"status":   "error",
			"message":  "Login should be at least 5 characters and use only a-z, 1-9 or _.",
		})

	} else {

		if password.Valid {
			pass, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
			body.Password = string(pass)
		}

		firstname := db.NewNullString(body.Firstname)
		lastname := db.NewNullString(body.Lastname)
		login := db.NewNullString(body.Login)
		email := db.NewNullString(body.Email)
		telephone := db.NewNullString(body.Telephone)
		password := db.NewNullString(body.Password)

		_, err := db.App.Db.Exec("UPDATE users SET firstname=COALESCE($1, firstname), lastname=COALESCE($2, lastname), birthday=COALESCE($3, birthday), login=COALESCE($4, login), telephone=COALESCE($5, telephone), password=COALESCE($6, password), email=COALESCE($7, email), updated=$8 WHERE id = $9",
			&firstname, &lastname, body.Birthday,
			&login, &telephone,
			&password, &email, now, loggedId)

		if err != nil {
			if matchErrorEmail, _ := regexp.MatchString(emailErrorRegex, err.Error()); matchErrorEmail {

				return c.JSON(http.StatusBadRequest, echo.Map{
					"status":   "error",
					"message":  "Email already taken.",
				})

			} else if matchError, _ := regexp.MatchString(loginErrorRegex, err.Error()); matchError {

				return c.JSON(http.StatusBadRequest, echo.Map{
					"status":   "error",
					"message":  "Login already taken.",
				})

			} else {

				return c.JSON(http.StatusInternalServerError, echo.Map{
					"status":   "error",
					"message":  err.Error(),
				})

			}
		} else {

			return c.JSON(http.StatusCreated, echo.Map{
				"status":   "success",
				"message":  fmt.Sprintf("Updated one user %v", loggedId),
			})

		}

	}

}


func CheckErr(err error) {
	if err != nil {
		panic(err)
	}
}
