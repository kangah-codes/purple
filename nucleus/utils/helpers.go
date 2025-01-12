package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

func EnvValue(envKey string, defaultValue string) string {
	val, present := os.LookupEnv(envKey)
	if present {
		return val
	} else {
		return defaultValue
	}
}

func EnvValueInt(envKey string, defaultValue int) int {
	val, present := os.LookupEnv(envKey)
	if present {
		retVal, _ := strconv.Atoi(val)
		return retVal
	} else {
		return defaultValue
	}
}

func EnvValueBool(envKey string, defaultValue bool) bool {
	val, present := os.LookupEnv(envKey)
	if present {
		retVal, err := strconv.ParseBool(val)

		if err != nil {
			log.Panicf("Environment variable %s is not a boolean type!", envKey)
		}

		return retVal
	} else {
		return defaultValue
	}
}

func IsValidString(str string) bool {
	return str != ""
}

func FormatStrToDateTime(dateStr string) time.Time {
	// dte is in this format: 2021-08-01T00:00:00.000Z
	if !IsValidString(dateStr) {
		return time.Time{}
	}

	dte, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		return time.Time{}
	}

	return dte
}

type IPInfo struct {
	IP       string `json:"ip"`
	Country  string `json:"country"`
	Currency string `json:"currency"`
}

func GetCountryAndCurrencyFromIP(ipAddress string) (*IPInfo, error) {
	// Use a geolocation API to get country info
	resp, err := http.Get(fmt.Sprintf("https://ipapi.co/%s/json/", ipAddress))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	country, ok := result["country_name"].(string)
	if !ok {
		return nil, fmt.Errorf("country not found")
	}

	currency, ok := result["currency"].(string)
	if !ok {
		return nil, fmt.Errorf("currency not found")
	}

	return &IPInfo{
		IP:       ipAddress,
		Country:  country,
		Currency: currency,
	}, nil
}

func EachDayOfInterval(start time.Time, end time.Time) []time.Time {
	var dates []time.Time
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		dates = append(dates, d)
	}
	return dates
}

func DateEqual(date1, date2 time.Time) bool {
	loc := time.UTC
	date1 = date1.In(loc)
	date2 = date2.In(loc)
	y1, m1, d1 := date1.Date()
	y2, m2, d2 := date2.Date()
	return y1 == y2 && m1 == m2 && d1 == d2
}
