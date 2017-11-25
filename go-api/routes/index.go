package routes

import (
	"github.com/gorilla/mux"
	"net/http"

	"../queries"
)

var (
	Router = mux.NewRouter()
)

func Init() {
	Router.Handle("/profile", queries.ValidateToken(http.HandlerFunc(queries.NotImplemented))).Methods("Post")
	Router.HandleFunc("/logout", queries.NotImplemented)
	initUsers()
	initFriendships()
}