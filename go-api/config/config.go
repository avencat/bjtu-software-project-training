package config

import (
	"github.com/jackc/pgx"
)

const (
	DB_USER         = "avencat"
	DB_PASSWORD     = "root"
	DB_NAME         = "socialnetwork"
	DB_TEST_NAME    = "socialnetworktest"
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

	dbTestInfo = pgx.ConnConfig{
		Host:       DB_HOST,
		Database:   DB_TEST_NAME,
		User:       DB_USER,
		Password:   DB_PASSWORD,
		Port:       DB_PORT,
	}

	DbInfo = pgx.ConnPoolConfig{
		ConnConfig: dbInfo,
		MaxConnections: MAX_CONNECTIONS,
	}

	DbTestInfo = pgx.ConnPoolConfig{
		ConnConfig: dbTestInfo,
		MaxConnections: MAX_CONNECTIONS,
	}
)
