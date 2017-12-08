package main_test

import (
    "./routes"
    "./db"
    "./config"
    "./types"
	"testing"
	"os"
	"net/http"
	"net/http/httptest"
	"encoding/json"
	"github.com/labstack/echo"
	"strings"
	"strconv"
)

var (
	Token           string
	UserId          int
	PostId          int
	CommentId       int
	FriendshipId    int
	LikeId          int
	LikeCommentId   int
	SecondUserId    int
)

func cleanDb() {
	db.App.Db.Exec("DELETE FROM users")
	db.App.Db.Exec("ALTER SEQUENCE users_id_seq RESTART WITH 1; " +
		"ALTER SEQUENCE posts_id_seq RESTART WITH 1; " +
		"ALTER SEQUENCE comments_id_seq RESTART WITH 1; " +
		"ALTER SEQUENCE comment_likes_id_seq RESTART WITH 1; " +
		"ALTER SEQUENCE post_likes_id_seq RESTART WITH 1; " +
		"ALTER SEQUENCE friendships_id_seq RESTART WITH 1")
}

func TestMain(m *testing.M) {
	db.App.Initialize(config.DbTestInfo)
	cleanDb()
	routes.Init(true)
	code := m.Run()
	cleanDb()
	os.Exit(code)
}

//
// USERS' TESTS
//

func TestUserRegisterANewUser(t *testing.T) {
	payload := `{"login":"userTest","email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestUserRegisterANewUserNoEmail(t *testing.T) {
	payload := `{"login":"userTest","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestUserRegisterANewUserNoLogin(t *testing.T) {
	payload := `{"email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestUserRegisterANewUserShortPassword(t *testing.T) {
	payload := `{"login":"userTest","email":"user2@test.org","password":"fooB"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestUserRegisterANewUserDuplicatedLogin(t *testing.T) {
	payload := `{"login":"userTest","email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestUserRegisterANewUserDuplicatedEmail(t *testing.T) {
	payload := `{"login":"userTest2","email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestUserLoginWithGoodInformations(t *testing.T) {
	payload := `{"login":"userTest","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/login", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		Token = m["token"].(string)
		UserId = int(m["user_id"].(float64))
	}
}

func TestUserLoginWithBadInformations(t *testing.T) {
	payload := `{"login":"userTest","password":"fooBarFalse"}`
	req, _ := http.NewRequest("POST", "/login", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusUnauthorized, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestUserUpdateUserGoodInformations(t *testing.T) {
	payload := `{"login":"userTest2"}`
	req, _ := http.NewRequest("PUT", "/users/" + strconv.Itoa(UserId), strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v': '%v'", m["status"], m["message"])
	}
}

func TestUserUpdateUserBadLogin(t *testing.T) {
	payload := `{"login":"user"}`
	req, _ := http.NewRequest("PUT", "/users/" + strconv.Itoa(UserId), strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v': '%v'", m["status"], m["message"])
	}
}

func TestUserDeleteAUserNotAuthorized(t *testing.T) {
	req, _ := http.NewRequest("DELETE", "/users/" + strconv.Itoa(UserId + 1), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusForbidden, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v': '%v'", m["status"], m["message"])
	}
}

func TestUserDeleteAUser(t *testing.T) {
	req, _ := http.NewRequest("DELETE", "/users/" + strconv.Itoa(UserId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v': '%v'", m["status"], m["message"])
	}
}

//
// POSTS' TESTS
//


func TestPostRegisterANewUser(t *testing.T) {
	cleanDb()
	payload := `{"login":"userTest","email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestPostLoginWithGoodInformations(t *testing.T) {
	payload := `{"login":"userTest","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/login", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		Token = m["token"].(string)
		UserId = int(m["user_id"].(float64))
	}
}

func TestPostAddANewPost(t *testing.T) {
	payload := `{"content":"New post"}`
	req, _ := http.NewRequest("POST", "/posts", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		PostId = int(m["post_id"].(float64))
	}
}

func TestPostAddANewPostBadInformations(t *testing.T) {
	req, _ := http.NewRequest("POST", "/posts", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestPostGetPostsOfHimself(t *testing.T) {
	req, _ := http.NewRequest("GET", "/posts?author_id=" + strconv.Itoa(UserId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestPostGetAllPosts(t *testing.T) {
	req, _ := http.NewRequest("GET", "/posts", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestPostAddASecondPost(t *testing.T) {
	payload := `{"content":"Second post"}`
	req, _ := http.NewRequest("POST", "/posts", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		PostId = int(m["post_id"].(float64))
	}
}

func TestPostCheckPostsOrder(t *testing.T) {
	req, _ := http.NewRequest("GET", "/posts", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m types.PostResponse
	json.Unmarshal(response.Body.Bytes(), &m)

	if m.Status != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m.Status)
	} else {
		if m.Data[0].Created.Before(*m.Data[1].Created) {
			t.Errorf("Expected data ordered by 'created ASC' but got 'created DESC'")
		}
	}
}

func TestPostUpdateAPost(t *testing.T) {
	payload := `{"content":"Newer post"}`
	req, _ := http.NewRequest("PUT", "/posts/" + strconv.Itoa(PostId), strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestPostUpdateAPostBadInformations(t *testing.T) {
	req, _ := http.NewRequest("PUT", "/posts/" + strconv.Itoa(PostId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestPostDeleteAPost(t *testing.T) {
	req, _ := http.NewRequest("DELETE", "/posts/" + strconv.Itoa(PostId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}


//
// COMMENTS' TESTS
//


func TestCommentRegisterANewUser(t *testing.T) {
	cleanDb()
	payload := `{"login":"userTest","email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestCommentLoginWithGoodInformations(t *testing.T) {
	payload := `{"login":"userTest","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/login", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		Token = m["token"].(string)
		UserId = int(m["user_id"].(float64))
	}
}

func TestCommentAddANewPost(t *testing.T) {
	payload := `{"content":"New post"}`
	req, _ := http.NewRequest("POST", "/posts", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		PostId = int(m["post_id"].(float64))
	}
}

func TestCommentAddANewComment(t *testing.T) {
	payload := `{"content":"New comment","post_id":` + strconv.Itoa(PostId) + `}`
	req, _ := http.NewRequest("POST", "/comments", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v': '%v", m["status"], m["message"])
	} else {
		CommentId = int(m["comment_id"].(float64))
	}
}

func TestCommentAddANewCommentBadInformations(t *testing.T) {
	req, _ := http.NewRequest("POST", "/comments", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestCommentGetCommentsOfAPost(t *testing.T) {
	req, _ := http.NewRequest("GET", "/comments?post_id=" + strconv.Itoa(PostId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestCommentGetASpecificComment(t *testing.T) {
	req, _ := http.NewRequest("GET", "/comments/" + strconv.Itoa(CommentId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestCommentAddASecondComment(t *testing.T) {
	payload := `{"content":"Second comment","post_id":` + strconv.Itoa(PostId) + `}`
	req, _ := http.NewRequest("POST", "/comments", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v': '%v", m["status"], m["message"])
	} else {
		CommentId = int(m["comment_id"].(float64))
	}
}

func TestCommentCheckCommentsOrder(t *testing.T) {
	req, _ := http.NewRequest("GET", "/comments?post_id=" + strconv.Itoa(PostId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m types.CommentResponse
	json.Unmarshal(response.Body.Bytes(), &m)

	if m.Status != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m.Status)
	} else {
		if m.Data[0].Created.After(*m.Data[1].Created) {
			t.Errorf("Expected data ordered by 'created DESC' but got 'created ASC'")
		}
	}
}

func TestCommentUpdateAComment(t *testing.T) {
	payload := `{"content":"Newer comment"}`
	req, _ := http.NewRequest("PUT", "/comments/" + strconv.Itoa(CommentId), strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestCommentUpdateACommentBadInformations(t *testing.T) {
	req, _ := http.NewRequest("PUT", "/comments/" + strconv.Itoa(CommentId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestCommentDeleteAComment(t *testing.T) {
	req, _ := http.NewRequest("DELETE", "/comments/" + strconv.Itoa(CommentId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

//
// LIKES' TESTS
//

func TestLikesRegisterANewUser(t *testing.T) {
	cleanDb()
	payload := `{"login":"userTest","email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestLikesLoginWithGoodInformations(t *testing.T) {
	payload := `{"login":"userTest","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/login", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		Token = m["token"].(string)
		UserId = int(m["user_id"].(float64))
	}
}

func TestLikesAddANewPost(t *testing.T) {
	payload := `{"content":"New post"}`
	req, _ := http.NewRequest("POST", "/posts", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		PostId = int(m["post_id"].(float64))
	}
}

func TestLikesAddAPostLikeBadInformations(t *testing.T) {
	req, _ := http.NewRequest("POST", "/likes", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestLikesAddAPostLike(t *testing.T) {
	payload := `{"post_id":` + strconv.Itoa(PostId) + `}`
	req, _ := http.NewRequest("POST", "/likes", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		LikeId = int(m["like_id"].(float64))
	}
}

func TestLikesGetLikesOfAPost(t *testing.T) {
	req, _ := http.NewRequest("GET", "/likes?post_id=" + strconv.Itoa(PostId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestLikesDeleteALike(t *testing.T) {
	req, _ := http.NewRequest("DELETE", "/likes/" + strconv.Itoa(LikeId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

//
// COMMENTLIKES' TESTS
//

func TestCommentLikesRegisterANewUser(t *testing.T) {
	cleanDb()
	payload := `{"login":"userTest","email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestCommentLikesLoginWithGoodInformations(t *testing.T) {
	payload := `{"login":"userTest","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/login", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		Token = m["token"].(string)
		UserId = int(m["user_id"].(float64))
	}
}

func TestCommentLikesAddANewPost(t *testing.T) {
	payload := `{"content":"New post"}`
	req, _ := http.NewRequest("POST", "/posts", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		PostId = int(m["post_id"].(float64))
	}
}

func TestCommentLikesAddANewComment(t *testing.T) {
	payload := `{"content":"New comment","post_id":` + strconv.Itoa(PostId) + `}`
	req, _ := http.NewRequest("POST", "/comments", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v': '%v", m["status"], m["message"])
	} else {
		CommentId = int(m["comment_id"].(float64))
	}
}

func TestCommentLikesAddACommentLikeBadInformations(t *testing.T) {
	req, _ := http.NewRequest("POST", "/likeComments", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestCommentLikesAddAPostLike(t *testing.T) {
	payload := `{"comment_id":` + strconv.Itoa(CommentId) + `}`
	req, _ := http.NewRequest("POST", "/likeComments", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		LikeCommentId = int(m["comment_like_id"].(float64))
	}
}

func TestCommentLikesGetLikesOfAPost(t *testing.T) {
	req, _ := http.NewRequest("GET", "/likeComments?comment_id=" + strconv.Itoa(CommentId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestCommentLikesDeleteALike(t *testing.T) {
	req, _ := http.NewRequest("DELETE", "/likeComments/" + strconv.Itoa(LikeCommentId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

//
// FRIENDSHIPS' TESTS
//

func TestFriendshipRegisterANewUser(t *testing.T) {
	cleanDb()
	payload := `{"login":"userTest","email":"user@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestFriendshipRegisterASecondUser(t *testing.T) {
	payload := `{"login":"userTest2","email":"user2@test.org","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/register", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestFriendshipLogin(t *testing.T) {
	payload := `{"login":"userTest","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/login", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		Token = m["token"].(string)
		UserId = int(m["user_id"].(float64))
	}
}

func TestFriendshipSecondLogin(t *testing.T) {
	payload := `{"login":"userTest2","password":"fooBar"}`
	req, _ := http.NewRequest("POST", "/login", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		SecondUserId = int(m["user_id"].(float64))
	}
}

func TestFriendshipFollow(t *testing.T) {
	payload := `{"following_id":` + strconv.Itoa(SecondUserId) + `}`
	req, _ := http.NewRequest("POST", "/friendships", strings.NewReader(payload))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	} else {
		FriendshipId = int(m["friendship_id"].(float64))
	}
}

func TestFriendshipFollowBadInformations(t *testing.T) {
	req, _ := http.NewRequest("POST", "/friendships", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "error" {
		t.Errorf("Expected status to be 'error'. Got '%v'", m["status"])
	}
}

func TestFriendshipGetNumberOfFollowing(t *testing.T) {
	req, _ := http.NewRequest("GET", "/followingNb?user_id=" + strconv.Itoa(UserId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestFriendshipGetNumberOfFollower(t *testing.T) {
	req, _ := http.NewRequest("GET", "/followerNb?user_id=" + strconv.Itoa(UserId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestFriendshipGetFollowingList(t *testing.T) {
	req, _ := http.NewRequest("GET", "/friendships", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

func TestFriendshipGetFollowingListNotLoggedIn(t *testing.T) {
	req, _ := http.NewRequest("GET", "/friendships", nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != nil {
		t.Errorf("Expected status to be '<nil>'. Got '%v'", m["status"])
	}
}

func TestFriendshipDeleteNotLoggedIn(t *testing.T) {
	req, _ := http.NewRequest("DELETE", "/friendships/" + strconv.Itoa(FriendshipId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != nil {
		t.Errorf("Expected status to be '<nil>'. Got '%v'", m["status"])
	}
}

func TestFriendshipDelete(t *testing.T) {
	req, _ := http.NewRequest("DELETE", "/friendships/" + strconv.Itoa(FriendshipId), nil)
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer " + Token)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["status"] != "success" {
		t.Errorf("Expected status to be 'success'. Got '%v'", m["status"])
	}
}

//
// HELPERS
//

func executeRequest(req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	routes.Router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}
