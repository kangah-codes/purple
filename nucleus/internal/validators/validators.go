package validators

import "strings"

// custom type for trimming strings
type TrimmedString string

func (t *TrimmedString) UnmarshalText(text []byte) error {
	*t = TrimmedString(strings.TrimSpace(string(text)))
	return nil
}
