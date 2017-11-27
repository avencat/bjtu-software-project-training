package routes

import (
	"../queries"
)

func initFriendships() {
	Router.DELETE("/friendships/:id", queries.DeleteFriendship)
	Router.GET("/friendships", queries.GetFriendships)
	Router.POST("/friendships", queries.CreateFriendship)
	Router.GET("/friendships/:id", queries.NotImplemented)
	Router.PUT("/friendships/:id", queries.NotImplemented)
	Router.PUT("/friendships", queries.NotImplemented)
	Router.GET("/followerNb", queries.GetFollowerNb)
	Router.GET("/followingNb", queries.GetFollowingNb)
}