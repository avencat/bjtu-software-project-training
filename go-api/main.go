package main

import (
    "./routes"

	/*
	"strings"
	"fmt"
	"io/ioutil"
	"crypto/rsa"
	"github.com/dgrijalva/jwt-go/request"
	"github.com/gorilla/mux"
	*/
	//"github.com/gorilla/handlers"
)

func main() {
	routes.Init()
	routes.Router.Logger.Fatal(routes.Router.Start(":3001"))
    //log.Fatal(http.ListenAndServe(":3001", handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}), handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}), handlers.AllowedOrigins([]string{"*"}))(routes.Router)))
}
