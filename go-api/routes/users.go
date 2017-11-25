package routes

import (
	"../queries"
	"net/http"
)

func initUsers() {
	Router.HandleFunc("/login", queries.Login).Methods("POST")
	Router.HandleFunc("/users/login", queries.Login).Methods("POST")
	Router.HandleFunc("/register", queries.CreateUser).Methods("POST")
	Router.HandleFunc("/users/register", queries.CreateUser).Methods("POST")
	Router.Handle("/users/{id}", queries.ValidateToken(http.HandlerFunc(queries.DeleteUser))).
		Methods("DELETE")
	Router.Handle("/users", queries.ValidateToken(http.HandlerFunc(queries.GetUsers))).
		Methods("GET")
	Router.Handle("/users/{id}", queries.ValidateToken(http.HandlerFunc(queries.GetSingleUser))).
		Methods("GET")
}
