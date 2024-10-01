package utils

import (
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

func ValidatePassword(s string) bool {
	var passwordRegex = regexp.MustCompile(`^[a-zA-Z0-9@$!%*?&]*[a-z][a-zA-Z0-9@$!%*?&]*$`)

	return passwordRegex.MatchString(s)
}

func ValidateEmail(e string) bool {
	var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

	return emailRegex.MatchString(e)
}

func RegisterCustomValidations(v *validator.Validate) {
	v.RegisterValidation("oneof", validateOneOf)
}

func validateOneOf(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	params := fl.Param()
	for _, param := range strings.Split(params, " ") {
		if value == param {
			return true
		}
	}
	return false
}
