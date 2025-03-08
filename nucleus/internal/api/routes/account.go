package routes

import (
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"
	"nucleus/utils"

	"github.com/gin-gonic/gin"
)

func RegisterAccountRoutes(r *gin.RouterGroup) {
	db := utils.GetDB()
	accountGroup := r.Group("/account")
	{
		accountGroup.POST(
			"/",
			middleware.AuthMiddleware(db), middleware.RequireParams([]string{"userID"}),
			handlers.CreateAccount,
		)
		accountGroup.GET(
			"/",
			middleware.AuthMiddleware(db), middleware.PaginationMiddleware(),
			middleware.RequireParams([]string{"userID"}),
			handlers.FetchUserAccounts,
		)
		accountGroup.DELETE(
			"/:accountID",
			middleware.AuthMiddleware(db), middleware.RequireParams([]string{"userID"}),
			handlers.DeleteUserAccount,
		)
		accountGroup.PATCH(
			"/:accountID",
			middleware.AuthMiddleware(db), middleware.RequireParams([]string{"userID"}),
			handlers.UpdateUserAccount,
		)
	}
}
