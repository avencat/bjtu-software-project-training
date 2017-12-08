package db

import (
	"github.com/jackc/pgx"
	"database/sql"
	"github.com/labstack/gommon/log"
)

type AppContainer struct {
	Db  *pgx.ConnPool
}

var (
	App  AppContainer
)

func (a *AppContainer) Close() {
	a.Db.Close()
}

func (a *AppContainer) Initialize(configuration pgx.ConnPoolConfig) {
	var err error
	a.Db, err = pgx.NewConnPool(configuration)
	if err != nil {
		log.Fatal(err)
	}
}

func NewNullString(s string) sql.NullString {
	if len(s) == 0 {
		return sql.NullString{}
	}
	return sql.NullString{
		String: s,
		Valid: true,
	}
}