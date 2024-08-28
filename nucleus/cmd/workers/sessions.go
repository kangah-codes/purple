package workers

import (
	"context"
	"nucleus/internal/models"
	"nucleus/utils"
	"sync"
	"time"

	"gorm.io/gorm"
)

type SessionCleaner struct {
	db     *gorm.DB
	ticker *time.Ticker
	done   chan bool
	wg     sync.WaitGroup
}

func NewSessionCleaner(db *gorm.DB) *SessionCleaner {
	return &SessionCleaner{
		db:   db,
		done: make(chan bool),
	}
}

func (sc *SessionCleaner) Start(ctx context.Context) {
	sc.ticker = time.NewTicker(1 * time.Hour)
	sc.wg.Add(1)
	go func() {
		defer sc.wg.Done()
		for {
			select {
			case <-sc.ticker.C:
				sc.deleteExpiredSessions()
			case <-ctx.Done():
				return
			case <-sc.done:
				return
			}
		}
	}()
}

func (sc *SessionCleaner) Stop() {
	if sc.ticker != nil {
		sc.ticker.Stop()
	}
	sc.done <- true
	sc.wg.Wait()
}

func (sc *SessionCleaner) deleteExpiredSessions() {
	now := time.Now()
	sessionResult := sc.db.Where("expires_at <= ?", now).Delete(&models.Session{})
	if sessionResult.Error != nil {
		utils.ErrorLogger.Printf("Error deleting expired sessions: %v", sessionResult.Error)
	} else {
		utils.ErrorLogger.Printf("Deleted %d expired sessions", sessionResult.RowsAffected)
	}

	refreshTokenResult := sc.db.Where("expires_at <= ?", now).Delete(&models.RefreshToken{})
	if refreshTokenResult.Error != nil {
		utils.ErrorLogger.Printf("Error deleting expired refresh tokens: %v", refreshTokenResult.Error)
	} else {
		utils.ErrorLogger.Printf("Deleted %d expired refresh tokens", refreshTokenResult.RowsAffected)
	}
}
