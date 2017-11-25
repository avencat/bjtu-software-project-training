package queries

import (
	"../db"
	"net/http"
	"time"
	"encoding/json"
	"github.com/dgrijalva/jwt-go"
	"log"
	"../types"
	"fmt"
	"context"
	"strings"
	"database/sql"
	"golang.org/x/crypto/bcrypt"
	"regexp"
	"github.com/gorilla/mux"
	"strconv"
)


const JwtSecret = "25015c61-030e-452f-a92f-5b8cdb0b627e"


func CreateUser(res http.ResponseWriter, req *http.Request) {

	mailRegex := "(\\w[-._\\w]*\\w@\\w[-._\\w]*\\w\\.\\w{2,3})"
	loginRegex := "^[a-z_0-9]{5,}$"
	emailErrorRegex := "(users_email_key)"
	loginErrorRegex := "(users_login_key)"
	now := time.Now()

	var body types.UserForm
	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&body)
	if err != nil {
		panic(err)
	}
	defer req.Body.Close()

	var matchEmail, matchLogin bool

	if body.Email != "" {
		body.Email = strings.TrimSpace(strings.ToLower(body.Email))
		matchEmail, err = regexp.MatchString(mailRegex, body.Email)
	} else {
		matchEmail = false
	}

	if body.Login != "" {
		body.Login = strings.TrimSpace(strings.ToLower(body.Login))
		matchLogin, err = regexp.MatchString(loginRegex, body.Login)
	} else {
		matchLogin = false
	}

	if len(body.Password) < 6 {

		fmt.Println(body.Password)

		db.JsonResponse(http.StatusBadRequest, res, types.Response{
			Status:     "error",
			Message:    "Password should be at least 6 characters.",
		})

	} else if !matchEmail {

		fmt.Println("email")

		db.JsonResponse(http.StatusBadRequest, res, types.Response{
			Status:     "error",
			Message:    "Bad email.",
		})

	} else if !matchLogin {

		fmt.Println("login")

		db.JsonResponse(http.StatusBadRequest, res, types.Response{
			Status:     "error",
			Message:    "Login should be at least 5 characters and use only a-z, 1-9 or _.",
		})

	} else {

		fmt.Println("afterAll")

		pass, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)

		body.Password = string(pass)

		_, err := db.Db.Exec("INSERT into users(firstname, lastname, birthday, email, login, telephone, password, created, updated, following_nb, follower_nb) values($1, $2, $3, $4, $5, $6, $7, $8, $8, 0, 0)",
		db.NewNullString(body.Firstname), db.NewNullString(body.Lastname), body.Birthday, body.Email, body.Login, db.NewNullString(body.Telephone), body.Password, now)

		if err != nil {
			if matchErrorEmail, _ := regexp.MatchString(emailErrorRegex, err.Error()); matchErrorEmail {
				db.JsonResponse(http.StatusBadRequest, res, types.Response{
					Status:     "error",
					Message:    "Email already taken.",
				})
			} else if matchError, _ := regexp.MatchString(loginErrorRegex, err.Error()); matchError {
				db.JsonResponse(http.StatusBadRequest, res, types.Response{
					Status:     "error",
					Message:    "Login already taken.",
				})
			} else {
				db.JsonResponse(http.StatusInternalServerError, res, types.Response{
					Status:     "error",
					Message:    err.Error(),
				})
			}
		} else {
			db.JsonResponse(http.StatusCreated, res, types.Response{
				Status:     "success",
				Message:    "Inserted one user",
			})
		}

	}

}


func DeleteUser(res http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	deleteIdString := vars["id"]
	userId := req.Context().Value(types.MyUserKey{}).(int64)
	deleteId, ok := strconv.ParseInt(deleteIdString, 10, 64)

	if ok != nil || userId != deleteId {
		db.JsonResponse(http.StatusForbidden, res, types.Response{
			Status:     "error",
			Message:    "You are not authorized to delete this user.",
		})
	} else {

		_, err := db.Db.Exec("DELETE FROM users WHERE id = $1", userId)

		if err != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    err.Error(),
			})
		} else {
			message := fmt.Sprintf("Removed user %v", userId)
			db.JsonResponse(http.StatusOK, res, types.Response{
				Status:     "success",
				Message:    message,
			})
		}

	}
}


func FindUserById(id int64) (types.User, error) {

	var user types.User

	err := db.Db.QueryRow("SELECT * FROM users WHERE id = $1", id).
		Scan(&user.Id, &user.Firstname, &user.Lastname, &user.Birthday, &user.Email,
		&user.Login, &user.Telephone, &user.Password, &user.Created, &user.Updated,
		&user.FollowingNb, &user.FollowerNb)

	if err != nil {
		if err == sql.ErrNoRows {
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

	err := db.Db.QueryRow("SELECT * FROM users WHERE login = $1", username).
		Scan(&user.Id, &user.Firstname, &user.Lastname, &user.Birthday, &user.Email,
		&user.Login, &user.Telephone, &user.Password, &user.Created, &user.Updated,
		&user.FollowingNb, &user.FollowerNb)

	if err != nil {
		if err == sql.ErrNoRows {
			return types.User{}, err
		} else {
			CheckErr(err)
			return types.User{}, err
		}
	}

	return user, nil
}


// create a JWT and return it to the client
func Login(res http.ResponseWriter, req *http.Request) {

	// Expires the token in 24 hours
	expireToken := time.Now().Add(time.Hour * 24).Unix()

	var credentials types.LoginCredentials
	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&credentials)
	if err != nil {
		panic(err)
	}
	defer req.Body.Close()

	user, err := FindUserByLogin(credentials.Login)

	passwordMatch := bcrypt.CompareHashAndPassword([]byte(user.Password.String), []byte(credentials.Password))

	if err == nil && user.Id.Valid && passwordMatch == nil {
		claims := types.Claims {
			Id: user.Id.Int64,
			StandardClaims: jwt.StandardClaims {
				ExpiresAt: expireToken,
				Issuer:    "socialNetwork",
			},
		}

		// Create the token using your claims
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		// Signs the token with a secret.
		signedToken, _ := token.SignedString([]byte(JwtSecret))

		response := types.UserResponse{
			Status:         "success",
			Message:        "User successfully logged in.",
			Token:          signedToken,
			UserId:         user.Id.Int64,
			FollowingNb:    user.FollowingNb.Int64,
		}

		db.JsonResponse(http.StatusOK, res, response)

	} else {
		db.JsonResponse(http.StatusUnauthorized, res, types.Response{
			Status:         "error",
			Message:        "Incorrect username or password.",
		})
	}
}


func GetSingleUser(res http.ResponseWriter, req *http.Request) {

	var err error

	vars := mux.Vars(req)
	userIdString := vars["id"]
	loggedId := req.Context().Value(types.MyUserKey{}).(int64)
	userId, ok := strconv.ParseInt(userIdString, 10, 64)


	request := "SELECT users.id, users.login, users.firstname, users.lastname, users.birthday, " +
		"users.following_nb, users.follower_nb, friendships.id AS friendship_id"

	if ok != nil {
		db.JsonResponse(http.StatusUnauthorized, res, types.Response{
			Status:     "error",
			Message:    "You are not authorized to access this content.",
		})
		return
	}

	var userData types.SingleUserData

	if userId == loggedId {

		err = db.Db.QueryRow(request + ", users.telephone, users.email FROM users " +
			"LEFT JOIN friendships ON friendships.follower_id = $1 AND friendships.following_id = $2 " +
			"WHERE users.id = $2", loggedId, userId).Scan(&userData.Id, &userData.Login, &userData.Firstname, &userData.Lastname, &userData.Birthday,
			&userData.FollowingNb, &userData.FollowerNb, &userData.FriendshipId, &userData.Telephone, &userData.Email)

	} else {

		err = db.Db.QueryRow(request + " FROM users " +
			"LEFT JOIN friendships ON friendships.follower_id = $1 AND friendships.following_id = $2 " +
			"WHERE users.id = $2", loggedId, userId).
			Scan(&userData.Id, &userData.Login, &userData.Firstname, &userData.Lastname, &userData.Birthday,
			&userData.FollowingNb, &userData.FollowerNb, &userData.FriendshipId)

	}

	if err != nil && err != sql.ErrNoRows {
		db.JsonResponse(http.StatusInternalServerError, res, types.Response{
			Status:     "error",
			Message:    err.Error(),
		})
		CheckErr(err)
		return
	} else if err == sql.ErrNoRows {
		http.NotFound(res, req)
		return
	}

	var userDataResponse types.SingleUserDataResponse

	if userData.Id.Valid {
		userDataResponse.Id = userData.Id.Int64
	}
	if userData.Login.Valid {
		userDataResponse.Login = userData.Login.String
	}
	if userData.Firstname.Valid {
		userDataResponse.Firstname = userData.Firstname.String
	}
	if userData.Lastname.Valid {
		userDataResponse.Lastname = userData.Lastname.String
	}
	if userData.Birthday.Valid {
		*userDataResponse.Birthday = userData.Birthday.Time
	}
	if userData.FollowingNb.Valid {
		userDataResponse.FollowingNb = userData.FollowingNb.Int64
	}
	if userData.FollowerNb.Valid {
		userDataResponse.FollowerNb = userData.FollowerNb.Int64
	}
	if userData.FriendshipId.Valid {
		userDataResponse.Id = userData.FriendshipId.Int64
	}
	if userData.Email.Valid {
		userDataResponse.Email = userData.Email.String
	}
	if userData.Telephone.Valid {
		userDataResponse.Telephone = userData.Telephone.String
	}

	response := types.SingleUserResponse{
		Status:         "success",
		User:           userDataResponse,
		Message:        "User successfully logged in.",
	}

	db.JsonResponse(http.StatusOK, res, response)
}


func GetUsers(res http.ResponseWriter, req *http.Request) {

	var results *sql.Rows; var err error; var users []types.SingleUserDataResponse

	loggedId := req.Context().Value(types.MyUserKey{}).(int64)

	query := "SELECT users.id, users.firstname, users.lastname, users.login, users.birthday, users.following_nb, users.follower_nb," +
		" friendships.id AS friendship_id " +
		"FROM users " +
		"LEFT JOIN friendships " +
		"ON friendships.following_id = users.id AND friendships.follower_id = $1 " +
		"WHERE users.id != $1"

	q := req.URL.Query().Get("q")

	if q != "" {

		results, err = db.Db.Query(query + " AND (users.firstname LIKE $2 OR users.lastname " +
			"LIKE $2 OR users.login LIKE $2 OR users.email = $3) ORDER BY friendships.following_id DESC",
			loggedId, "%" + q + "%", q)

		if err != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    err.Error(),
			})
			CheckErr(err)
			return
		}

	} else {

		results, err = db.Db.Query(query + " ORDER BY friendships.following_id DESC",
			loggedId)

		if err != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    err.Error(),
			})
			CheckErr(err)
			return
		}

	}
	defer results.Close()

	for results.Next() {
		var user types.SingleUserData
		if err := results.
			Scan(&user.Id, &user.Firstname, &user.Lastname, &user.Login, &user.Birthday,
			&user.FollowingNb, &user.FollowerNb, &user.FriendshipId); err != nil {
			db.JsonResponse(http.StatusInternalServerError, res, types.Response{
				Status:     "error",
				Message:    err.Error(),
			})
			CheckErr(err)
			return
		}

		var singleUser types.SingleUserDataResponse

		if user.Id.Valid {
			singleUser.Id = user.Id.Int64
		}
		if user.Login.Valid {
			singleUser.Login = user.Login.String
		}
		if user.Firstname.Valid {
			singleUser.Firstname = user.Firstname.String
		}
		if user.Lastname.Valid {
			singleUser.Lastname = user.Lastname.String
		}
		if user.Birthday.Valid {
			*singleUser.Birthday = user.Birthday.Time
		}
		if user.FollowingNb.Valid {
			singleUser.FollowingNb = user.FollowingNb.Int64
		}
		if user.FollowerNb.Valid {
			singleUser.FollowerNb = user.FollowerNb.Int64
		}
		if user.FriendshipId.Valid {
			singleUser.Id = user.FriendshipId.Int64
		}

		users = append(users, singleUser)
	}
	if err := results.Err(); err != nil {
		db.JsonResponse(http.StatusInternalServerError, res, types.Response{
			Status:     "error",
			Message:    err.Error(),
		})
		CheckErr(err)
		return
	}

	response := types.MultipleUserResponse{
		Status:         "success",
		Data:           users,
		Message:        "Retrieved users",
	}

	db.JsonResponse(http.StatusOK, res, response)
}


// middleware to grant access to private pages
func ValidateToken(h http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		log.Println("middleware", req.URL)

		authorization := req.Header.Get("Authorization")

		token, err := jwt.ParseWithClaims(strings.Replace(authorization, "Bearer ", "", 1), &types.Claims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(JwtSecret), nil
		})
		if err != nil {
			print(err)
			http.NotFound(res, req)
			return
		}

		if claims, ok := token.Claims.(*types.Claims); ok && token.Valid {
			ctx := context.WithValue(req.Context(), types.MyUserKey{}, claims.Id)
			h.ServeHTTP(res, req.WithContext(ctx))
		} else {
			fmt.Println(err)
			http.NotFound(res, req)
		}
	})
}


func UpdateUser(res http.ResponseWriter, req *http.Request) {

	loginRegex := "^[a-z_0-9]{5,}$"
	loginErrorRegex := "(users_login_key)"
	now := time.Now()

	var body types.UserForm
	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&body)
	if err != nil {
		panic(err)
	}
	defer req.Body.Close()

	var matchLogin bool

	if body.Login != "" {
		body.Login = strings.TrimSpace(strings.ToLower(body.Login))
		matchLogin, err = regexp.MatchString(loginRegex, body.Login)
	} else {
		matchLogin = false
	}

	if password := db.NewNullString(body.Password); password.Valid && len(body.Password) < 6 {

		db.JsonResponse(http.StatusBadRequest, res, types.Response{
			Status:     "error",
			Message:    "Password should be at least 6 characters.",
		})

	} else if login := db.NewNullString(body.Login); login.Valid && !matchLogin {

		db.JsonResponse(http.StatusBadRequest, res, types.Response{
			Status:     "error",
			Message:    "Login should be at least 5 characters and use only a-z, 1-9 or _.",
		})

	} else {

		if password.Valid {
			pass, _ := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
			body.Password = string(pass)
		}

		_, err := db.Db.Exec("INSERT into users(firstname, lastname, birthday, login, telephone, password, created, updated, following_nb, follower_nb) values($1, $2, $3, $4, $5, $6, $7, $7, 0, 0)",
			db.NewNullString(body.Firstname), db.NewNullString(body.Lastname), body.Birthday, db.NewNullString(body.Login), db.NewNullString(body.Telephone), db.NewNullString(body.Password), now)

		if err != nil {
			if matchError, _ := regexp.MatchString(loginErrorRegex, err.Error()); matchError {
				db.JsonResponse(http.StatusBadRequest, res, types.Response{
					Status:     "error",
					Message:    "Login already taken.",
				})
			} else {
				db.JsonResponse(http.StatusInternalServerError, res, types.Response{
					Status:     "error",
					Message:    err.Error(),
				})
			}
		} else {
			db.JsonResponse(http.StatusCreated, res, types.Response{
				Status:     "success",
				Message:    "Inserted one user",
			})
		}

	}

}


func CheckErr(err error) {
	if err != nil {
		panic(err)
	}
}
