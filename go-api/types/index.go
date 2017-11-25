package types

import "github.com/dgrijalva/jwt-go"

type Response struct {
	Status      string  `json:"status"`
	Message     string  `json:"message"`
}

type MyUserKey struct {
	UserId      int64   `json:"user_id"`
}

type Claims struct {
	Id          int64   `json:"id"`
	jwt.StandardClaims  `json:"standardClaims"`
}
