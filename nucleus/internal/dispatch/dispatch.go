package dispatch

import (
	"context"
	"encoding/json"
	"fmt"
	"nucleus/internal/log"
	"reflect"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type DispatchClient struct {
	redis  *redis.Client
	pubsub *redis.PubSub
	mu     sync.RWMutex
	subs   map[string][]subscription
}

type AckError struct {
	MessageID string
	Details   string
}

func (e *AckError) Error() string {
	return fmt.Sprintf("message %s failed: %s", e.MessageID, e.Details)
}

func NewAckError(messageID, details string) *AckError {
	return &AckError{
		MessageID: messageID,
		Details:   details,
	}
}

type subscription struct {
	payloadType reflect.Type
	callback    any
}

type BaseListener interface {
	GetChannel() string
	Register(*DispatchClient) error
}

type Listener[T any] struct {
	Channel  string
	Callback func(T) error
}

type Message struct {
	ID        string `json:"id"`
	Channel   string `json:"channel"`
	Data      any    `json:"data"`
	Timestamp int64  `json:"timestamp"`
}

type Acknowledgement struct {
	MessageID string `json:"message_id"`
	Status    string `json:"status"`
	Error     string `json:"error,omitempty"`
}

func (l Listener[T]) GetChannel() string {
	return l.Channel
}

func (l Listener[T]) Register(c *DispatchClient) error {
	return Subscribe(c, l.Channel, l.Callback)
}

func NewDispatchClient(redisClient *redis.Client) (*DispatchClient, error) {
	ctx := context.Background()
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &DispatchClient{
		redis: redisClient,
		subs:  make(map[string][]subscription),
	}, nil
}

// Initialize and subscribe all listeners
func InitListeners(c *DispatchClient, listeners []BaseListener) error {
	for _, listener := range listeners {
		if err := listener.Register(c); err != nil {
			return fmt.Errorf("failed to subscribe to channel %s: %w", listener.GetChannel(), err)
		}
	}
	return nil
}

// Subscribe adds a callback for a specific channel
func Subscribe[T any](c *DispatchClient, channel string, callback func(T) error) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	wrappedCallback := func(payload T) error {
		err := callback(payload)
		return err
	}

	// if first time subscribing to this channel, set up Redis PubSub
	if _, exists := c.subs[channel]; !exists {
		if c.pubsub == nil {
			c.pubsub = c.redis.Subscribe(context.Background(), channel)
		} else {
			// add subscription to the existing PubSub
			if err := c.pubsub.Subscribe(context.Background(), channel); err != nil {
				return fmt.Errorf("failed to subscribe to channel %s: %w", channel, err)
			}
		}
	}

	// register typed callback
	c.subs[channel] = append(c.subs[channel], subscription{
		payloadType: reflect.TypeOf((*T)(nil)).Elem(),
		callback:    wrappedCallback,
	})

	return nil
}

// Publish an event with a typed payload
func Publish[T any](c *DispatchClient, channel string, payload T) error {
	ctx := context.Background()
	msg := Message{
		ID:        uuid.New().String(),
		Channel:   channel,
		Data:      payload,
		Timestamp: time.Now().Unix(),
	}

	msgJSON, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}
	if err := c.redis.Publish(ctx, channel, msgJSON).Err(); err != nil {
		return err
	}

	ackChannel := fmt.Sprintf("%s.ack.%s", msg.Channel, msg.ID)
	pubsub := c.redis.Subscribe(ctx, ackChannel)
	defer pubsub.Close()

	// wait for messsage ack
	select {
	case message := <-pubsub.Channel():
		var ack Acknowledgement
		if err := json.Unmarshal([]byte(message.Payload), &ack); err != nil {
			return err
		}
		if ack.Status == "error" {
			return NewAckError(msg.ID, ack.Error)
		}
		return nil
	case <-time.After(5 * time.Second):
		return NewAckError(msg.ID, "acknowledgment timeout")
	}
}

// StartListening begins listening for incoming messages on all subscribed channels
func StartListening(c *DispatchClient, ctx context.Context) error {
	if c.pubsub == nil {
		return fmt.Errorf("no subscriptions found; please subscribe to at least one channel before listening")
	}

	go func() {
		ch := c.pubsub.Channel()

		for {
			select {
			case <-ctx.Done():
				return
			case msg := <-ch:
				if msg != nil {
					go c.handleMessage(msg)
				}
			}
		}
	}()

	return nil
}

func sendAcknowledgment(c *DispatchClient, msg Message, success bool, errMsg string) error {
	ack := Acknowledgement{
		MessageID: msg.ID,
		Status:    "success",
		Error:     "",
	}

	if !success {
		ack.Status = "error"
		ack.Error = errMsg
	}

	ackChannel := fmt.Sprintf("%s.ack.%s", msg.Channel, msg.ID)
	data, err := json.Marshal(ack)
	if err != nil {
		return fmt.Errorf("failed to marshal acknowledgment: %w", err)
	}

	return c.redis.Publish(context.Background(), ackChannel, data).Err()
}

// handleMessage processes the incoming message
func (c *DispatchClient) handleMessage(m any) {
	var msg Message
	redisMsg, ok := m.(*redis.Message)
	if !ok {
		log.ErrorLogger.Errorf("Invalid message type: expected *redis.Message")
		return
	}
	if err := json.Unmarshal([]byte(redisMsg.Payload), &msg); err != nil {
		log.ErrorLogger.Errorf("Failed to unmarshal message: %v", err)
		_ = sendAcknowledgment(c, msg, false, "Invalid message format")
		return
	}

	c.mu.RLock()
	subs, exists := c.subs[msg.Channel]
	c.mu.RUnlock()

	if !exists {
		log.ErrorLogger.Errorf("No subscribers for channel %s", msg.Channel)
		_ = sendAcknowledgment(c, msg, false, "No subscribers found")
		return
	}

	var processingError error
	for _, sub := range subs {
		payloadPtr := reflect.New(sub.payloadType).Interface()

		// Marshal and unmarshal the Data field instead of Payload
		payloadData, err := json.Marshal(msg.Data)
		if err != nil {
			processingError = fmt.Errorf("error marshaling message data: %v", err)
			log.ErrorLogger.Errorf("error marshaling message data: %v", err)
			continue
		}

		if err := json.Unmarshal(payloadData, payloadPtr); err != nil {
			processingError = fmt.Errorf("error unmarshaling message data: %v", err)
			log.ErrorLogger.Errorf("error unmarshaling message data: %v", err)
			continue
		}

		callbackValue := reflect.ValueOf(sub.callback)
		payloadValue := reflect.ValueOf(payloadPtr).Elem()

		results := callbackValue.Call([]reflect.Value{payloadValue})
		if len(results) > 0 && !results[0].IsNil() {
			if err, ok := results[0].Interface().(error); ok {
				processingError = fmt.Errorf("callback error: %v", err)
				log.ErrorLogger.Errorf("callback error: %v", err)
			}
		}
	}

	// Send acknowledgment based on processing result
	errMsg := ""
	if processingError != nil {
		errMsg = processingError.Error()
	}
	if err := sendAcknowledgment(c, msg, processingError == nil, errMsg); err != nil {
		log.ErrorLogger.Errorf("Failed to send acknowledgment: %v", err)
	}
}

// Close gracefully shuts down the client
func (c *DispatchClient) Close() error {
	if c.pubsub != nil {
		if err := c.pubsub.Close(); err != nil {
			return err
		}
	}
	return c.redis.Close()
}
