package config

import "fmt"

const (
	DB_USER     = "avencat"
	DB_PASSWORD = "root"
	DB_NAME     = "socialnetwork"
)

var (
	Dbinfo      = fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable", DB_USER, DB_PASSWORD, DB_NAME)
)
