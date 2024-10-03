package utils

import (
	"math"
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
	v.RegisterValidation("validNumber", validateNumber)
	v.RegisterValidation("validCurrency", validateCurrency)
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

func validateNumber(fl validator.FieldLevel) bool {
	balance := fl.Field().Float()
	return !math.IsNaN(balance) && !math.IsInf(balance, 0)
}

func validateCurrency(fl validator.FieldLevel) bool {
	currency := fl.Field().String()

	// check if the currency is in the Currencies slice which is a slice of Currency structs
	for _, c := range Currencies {
		if c.Code == currency {
			return true
		}
	}

	return false
}
