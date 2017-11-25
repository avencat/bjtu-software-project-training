package main

import (
    "log"
    "net/http"
    "./routes"

	/*
	"strings"
	"fmt"
	"io/ioutil"
	"crypto/rsa"
	"github.com/dgrijalva/jwt-go/request"
	"github.com/gorilla/mux"
	*/
	"fmt"
	"github.com/gorilla/handlers"
)

func main() {
	routes.Init()
	fmt.Println("Server listening on port :3001")
    log.Fatal(http.ListenAndServe(":3001", handlers.CORS(handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}), handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}), handlers.AllowedOrigins([]string{"*"}))(routes.Router)))
}
