package utils

import (
	"log"
	"os"
	"strconv"
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
