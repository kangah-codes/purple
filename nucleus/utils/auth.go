package utils

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"nucleus/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func GenerateTokenPair(userID uint) (models.TokenPair, error) {
	// Generate access token
	db := GetDB()
	accessToken := jwt.New(jwt.SigningMethodHS256)
	accessClaims := accessToken.Claims.(jwt.MapClaims)
	accessClaims["user_id"] = userID
	accessClaims["exp"] = time.Now().Add(time.Minute * 15).Unix() // Short-lived

	accessTokenString, err := accessToken.SignedString([]byte("your_access_token_secret"))
	if err != nil {
		return models.TokenPair{}, err
	}

	// Generate refresh token
	refreshToken := jwt.New(jwt.SigningMethodHS256)
	refreshClaims := refreshToken.Claims.(jwt.MapClaims)
	refreshClaims["user_id"] = userID
	refreshClaims["exp"] = time.Now().Add(time.Hour * 24 * 30).Unix() // Long-lived (30 days)

	refreshTokenString, err := refreshToken.SignedString([]byte("your_refresh_token_secret"))
	if err != nil {
		return models.TokenPair{}, err
	}

	session := models.Session{
		UserID:    userID,
		Token:     accessTokenString,
		ExpiresAt: time.Now().Add(time.Minute * 15),
	}
	sessionTokenResult := db.Create(&session)

	if sessionTokenResult.Error != nil {
		return models.TokenPair{}, sessionTokenResult.Error
	}

	sessionRefreshToken := models.RefreshToken{
		SessionID: session.ID,
		Token:     refreshTokenString,
		ExpiresAt: time.Now().Add(time.Hour * 24 * 30),
	}
	refreshTokenResult := db.Create(&sessionRefreshToken)

	if refreshTokenResult.Error != nil {
		return models.TokenPair{}, refreshTokenResult.Error
	}

	return models.TokenPair{
		AccessToken: session, RefreshToken: sessionRefreshToken}, nil
}

func RefreshTokens(refreshToken string) (models.TokenPair, error) {
	// Validate refresh token
	token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte("your_refresh_token_secret"), nil
	})

	if err != nil || !token.Valid {
		return models.TokenPair{}, err
	}

	claims := token.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(uint)

	// Generate new token pair
	return GenerateTokenPair(userID)
}

func ValidateSessionToken(db *gorm.DB, token string) (*models.Session, error) {
	var session models.Session
	if err := db.Where("token = ? AND expires_at > ?", token, time.Now()).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid or expired session token")
		}
		return nil, err
	}

	return &session, nil
}

func ValidateRefreshToken(db *gorm.DB, token string) (*models.RefreshToken, error) {
	var refreshToken models.RefreshToken
	if err := db.Where("token = ? AND is_revoked = ? AND expires_at > ?", token, false, time.Now()).First(&refreshToken).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid or expired refresh token")
		}
		return nil, err
	}
	return &refreshToken, nil
}

func RevokeRefreshToken(db *gorm.DB, token string) error {
	return db.Model(&models.RefreshToken{}).Where("token = ?", token).Update("is_revoked", true).Error
}

func RevokeAllUserTokens(db *gorm.DB, userID uint) error {
	return db.Model(&models.RefreshToken{}).Where("user_id = ?", userID).Update("is_revoked", true).Error
}

func CleanExpiredTokens(db *gorm.DB) error {
	return db.Where("expires_at < ?", time.Now()).Delete(&models.RefreshToken{}).Error
}

func HashPassword(pw string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)

	return string(hashedPassword), err
}

func CheckPasswordHash(pw, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw))

	return err == nil
}

func GenerateSessionToken() (string, error) {
	token := make([]byte, 32)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(token), nil
}

func CreateSession(db *gorm.DB, userID uint) (models.TokenPair, error) {
	token, err := GenerateSessionToken()
	if err != nil {
		return models.TokenPair{}, err
	}

	session := models.Session{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(time.Hour * 24),
	}
	result := db.Create(&session)
	if result.Error != nil {
		return models.TokenPair{}, result.Error
	}

	refreshToken, err := GenerateSessionToken()
	if err != nil {
		return models.TokenPair{}, err
	}
	refreshSession := models.RefreshToken{
		SessionID: session.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(time.Hour * 24 * 30),
	}
	result = db.Create(&refreshSession)
	if result.Error != nil {
		return models.TokenPair{}, result.Error
	}

	return models.TokenPair{
		AccessToken:  session,
		RefreshToken: refreshSession,
	}, nil
}
