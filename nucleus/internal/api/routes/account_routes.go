package routes

import (
	"nucleus/internal/api/containers"
	"nucleus/internal/api/handlers"
	"nucleus/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterAccountRoutes(r *gin.RouterGroup, container *containers.Container) {
	accountHandler := handlers.NewAccountHandler(container.AccountService)

	accountGroup := r.Group("/account")
	{
		accountGroup.POST(
			"/",
			middleware.RequireParams([]string{"userID"}),
			accountHandler.CreateAccount,
		)
		accountGroup.GET(
			"/",
			middleware.PaginationMiddleware(),
			middleware.RequireParams([]string{"userID"}),
			accountHandler.FetchUserAccounts,
		)
		accountGroup.DELETE(
			"/:accountID",
			middleware.RequireParams([]string{"userID"}),
			accountHandler.DeleteUserAccount,
		)
		accountGroup.PATCH(
			"/:accountID",
			middleware.RequireParams([]string{"userID"}),
			accountHandler.UpdateUserAccount,
		)
	}
}
