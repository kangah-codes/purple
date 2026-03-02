package log

import (
	"os"

	"github.com/rs/zerolog"
)

// Custom logger wrapper struct
type Logger struct {
	zerolog.Logger
}

// Global loggers for backward compatibility
var (
	InfoLogger  *Logger
	ErrorLogger *Logger
)

// InitLogger initializes global loggers
func InitLogger() {
	// Create zerolog instances for Info and Error
	infoOutput := zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: "2006-01-02 15:04:05"}
	errorOutput := zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: "2006-01-02 15:04:05"}

	infoLogger := zerolog.New(infoOutput).With().Timestamp().Logger()
	errorLogger := zerolog.New(errorOutput).With().Timestamp().Logger()

	// Wrap zerolog loggers in the Logger struct
	InfoLogger = &Logger{infoLogger}
	ErrorLogger = &Logger{errorLogger}
}

func (l *Logger) Printf(format string, v ...interface{}) {
	l.Logger.Info().Msgf(format, v...)
}

func (l *Logger) Println(v ...interface{}) {
	l.Logger.Info().Msgf("%v", v...)
}

func (l *Logger) Debugf(format string, v ...interface{}) {
	l.Logger.Debug().Msgf(format, v...)
}

func (l *Logger) Debugln(v ...interface{}) {
	l.Logger.Debug().Msgf("%v", v...)
}

func (l *Logger) Errorf(format string, v ...interface{}) {
	l.Logger.Error().Msgf(format, v...)
}

func (l *Logger) Errorln(v ...interface{}) {
	l.Logger.Error().Msgf("%v", v...)
}

func (l *Logger) Fatal(v ...interface{}) {
	l.Logger.Fatal().Msgf("%v", v...)
}

func (l *Logger) Fatalf(v ...interface{}) {
	l.Logger.Fatal().Msgf("%v", v...)
}
