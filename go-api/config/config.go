package config

import (
	"github.com/jackc/pgx"
)

const (
	DB_USER         = "avencat"
	DB_PASSWORD     = "root"
	DB_NAME         = "socialnetwork"
	DB_HOST         = "localhost"
	DB_PORT         = 5432
	MAX_CONNECTIONS = 1000
)

var (
	dbInfo = pgx.ConnConfig{
		Host:       DB_HOST,
		Database:   DB_NAME,
		User:       DB_USER,
		Password:   DB_PASSWORD,
		Port:       DB_PORT,
	}

	DbInfo = pgx.ConnPoolConfig{
		ConnConfig: dbInfo,
		MaxConnections: MAX_CONNECTIONS,
	}
)
