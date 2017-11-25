package queries

import (
	"net/http"
	"../db"
	"../types"
)

type Response struct {
	Message string `json:"message"`
}

var NotImplemented = http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
	v := req.Context().Value(types.MyUserKey{})

	if v == nil {
		db.JsonResponse(http.StatusForbidden, res, types.Response{
			Status: "error",
			Message: "You must log in first.",
		})
		return
	} else {
		db.JsonResponse(http.StatusNotImplemented, res, types.Response{
			Status: "error",
			Message: "Not Implemented.",
		})
	}
})
