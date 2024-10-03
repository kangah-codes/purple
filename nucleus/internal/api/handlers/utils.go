package handlers

import (
	"nucleus/internal/api/types"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func FetchAccountGroups(c *gin.Context) {
	c.JSON(200, types.Response{Status: 200, Message: "User updated successfully", Data: utils.AccountGroups})
}
