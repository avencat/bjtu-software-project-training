package routes

import (
	"../queries"
)

func initPosts() {
	Router.DELETE("/posts/:id", queries.DeletePost)
	Router.GET("/posts", queries.GetAllPosts)
	Router.POST("/posts", queries.CreatePost)
	Router.GET("/posts/:id", queries.GetSinglePost)
	Router.PUT("/posts/:id", queries.UpdatePost)
}