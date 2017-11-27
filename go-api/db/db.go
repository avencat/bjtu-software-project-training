package db

import (
	"github.com/jackc/pgx"
	"encoding/json"
	"net/http"
	"../config"
	"database/sql"
)

var (
	Db, err     = pgx.NewConnPool(config.DbInfo)
)

func Close() {
	Db.Close()
}

func JsonResponse(status int, w http.ResponseWriter, response interface{}) {

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(jsonResponse)
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