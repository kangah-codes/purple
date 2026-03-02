package templates

import (
	"bytes"
	"html/template"
)

// renders an html template with variables
func RenderTemplate(templatePath string, variables map[string]string) (string, error) {
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return "", err
	}

	var rendered bytes.Buffer
	err = tmpl.Execute(&rendered, variables)
	if err != nil {
		return "", err
	}

	return rendered.String(), nil
}
