package routes

import (
	"net/http"
	"../queries"
)

func initFriendships() {
	Router.Handle("/friendships/{id}", queries.ValidateToken(http.HandlerFunc(queries.DeleteFriendship))).
		Methods("DELETE")
	Router.Handle("/friendships", queries.ValidateToken(http.HandlerFunc(queries.GetFriendships))).
		Methods("GET")
	Router.Handle("/friendships", queries.ValidateToken(http.HandlerFunc(queries.CreateFriendship))).
		Methods("POST")
	Router.Handle("/friendships/{id}", queries.ValidateToken(http.HandlerFunc(queries.NotImplemented))).
		Methods("GET")
	Router.Handle("/friendships/{id}", queries.ValidateToken(http.HandlerFunc(queries.NotImplemented))).
		Methods("PUT")
	Router.Handle("/friendships", queries.ValidateToken(http.HandlerFunc(queries.NotImplemented))).
		Methods("PUT")
	Router.Handle("/followerNb", queries.ValidateToken(http.HandlerFunc(queries.GetFollowerNb))).
		Methods("GET")
	Router.Handle("/followingNb", queries.ValidateToken(http.HandlerFunc(queries.GetFollowingNb))).
		Methods("GET")
}