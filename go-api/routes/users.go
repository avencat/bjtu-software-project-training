package routes

import (
	"../queries"
)

func initUsers() {
	Router.POST("/login", queries.Login)
	Router.POST("/users/login", queries.Login)
	Router.POST("/register", queries.CreateUser)
	Router.POST("/users/register", queries.CreateUser)
	Router.DELETE("/users/:id", queries.DeleteUser)
	Router.GET("/users", queries.GetUsers)
	Router.GET("/users/:id", queries.GetSingleUser)
	Router.PUT("/users/:id", queries.UpdateUser)
	Router.PUT("/users", queries.UpdateUser)
}
