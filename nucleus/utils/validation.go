package utils

import "regexp"

func ValidatePassword(s string) bool {
	var passwordRegex = regexp.MustCompile(`^[a-zA-Z0-9@$!%*?&]*[a-z][a-zA-Z0-9@$!%*?&]*$`)

	return passwordRegex.MatchString(s)
}

func ValidateEmail(e string) bool {
	var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

	return emailRegex.MatchString(e)
}
