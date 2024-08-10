package handlers

import (
	"fmt"
	"nucleus/utils"
	"strconv"

	"nucleus/internal/api/types"
	"nucleus/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateUser(c *gin.Context) {
	signUp := types.SignUpDTO{}
	db := utils.GetDB()
	if err := c.ShouldBindJSON(&signUp); err != nil {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	if !utils.ValidatePassword(signUp.Password) {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid password", Data: nil})
		return
	}

	if !utils.ValidateEmail(signUp.Email) {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid email", Data: nil})
		return
	}

	hashedPassword, err := utils.HashPassword(signUp.Password)
	if err != nil {
		c.JSON(500, types.Response{Status: 500, Message: "Failed to create user", Data: nil})
		return
	}

	user := models.User{
		Username:    signUp.Username,
		Email:       signUp.Email,
		Password:    hashedPassword,
		PhoneNumber: signUp.PhoneNumber,
		FirstName:   signUp.FirstName,
		LastName:    signUp.LastName,
	}

	result := db.Create(&user)
	if result.Error != nil {
		c.JSON(500, types.Response{Status: 500, Message: fmt.Sprintf("Failed to create user: %s", result.Error.Error()), Data: nil})
	}

	c.JSON(201, types.Response{Status: 201, Message: "User created successfully", Data: user})
}

func DeleteUser(c *gin.Context) {
	db := utils.GetDB()
	user := models.User{}
	userID := c.Param("id")

	result := db.First(&user, userID)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "User not found", Data: nil})
		return
	}

	db.Delete(&user)
	c.JSON(200, types.Response{Status: 200, Message: "User deleted successfully", Data: nil})
}

func FetchUser(c *gin.Context) {
	db := utils.GetDB()
	user := models.User{}

	result := db.First(&user, c.Param("id"))
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(404, types.Response{Status: 404, Message: "User not found", Data: nil})
		} else {
			c.JSON(500, types.Response{Status: 500, Message: "Internal Server Error", Data: nil})
		}
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "User fetched successfully", Data: user})
}

func FetchUsers(c *gin.Context) {
	db := utils.GetDB()
	users := []models.User{}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var totalItems int64
	db.Model(&models.User{}).Count(&totalItems)

	result := db.Limit(pageSize).Offset(offset).Find(&users)
	if result.Error != nil {
		c.JSON(500, types.Response{Status: 500, Message: "Failed to fetch users", Data: nil})
		return
	}

	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))

	c.JSON(200, types.Response{
		Status:     200,
		Message:    "Users fetched successfully",
		Data:       users,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		TotalItems: int(totalItems),
	})
}

func UpdateUser(c *gin.Context) {
	db := utils.GetDB()
	user := models.User{}
	userID := c.Param("id")

	result := db.First(&user, userID)
	if result.Error != nil {
		c.JSON(404, types.Response{Status: 404, Message: "User not found", Data: nil})
		return
	}

	update := types.UpdateAccountDTO{}
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(400, types.Response{Status: 400, Message: "Invalid request", Data: nil})
		return
	}

	user.PhoneNumber = update.PhoneNumber
	user.Username = update.Username

	result = db.Save(&user)
	if result.Error != nil {
		c.JSON(500, types.Response{Status: 500, Message: "Failed to update user", Data: nil})
		return
	}

	c.JSON(200, types.Response{Status: 200, Message: "User updated successfully", Data: user})
}
