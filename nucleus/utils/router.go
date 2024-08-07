package utils

import (
	"github.com/gin-gonic/gin"
)

func CreateV1Group(r *gin.Engine) *gin.RouterGroup {
	return r.Group("/api/v1")
}
