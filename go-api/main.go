package main

import (
    "./routes"
    "./db"
    "./config"
)

func main() {
	db.App.Initialize(config.DbInfo)
	routes.Init(false)
	routes.Router.Logger.Fatal(routes.Router.Start(":3001"))
}
