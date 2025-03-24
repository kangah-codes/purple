package dispatch

import (
	"context"
	"encoding/json"
	"fmt"
	"nucleus/internal/log"
	"reflect"
	"sync"

	"github.com/redis/go-redis/v9"
)

type DispatchClient struct {
	redis  *redis.Client
	pubsub *redis.PubSub
	mu     sync.RWMutex
	subs   map[string][]subscription
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
		callback:    callback,
	})

	return nil
}

// Publish an event with a typed payload
func Publish[T any](c *DispatchClient, channel string, payload T) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	return c.redis.Publish(context.Background(), channel, data).Err()
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

// handleMessage processes the incoming message
func (c *DispatchClient) handleMessage(msg *redis.Message) {
	c.mu.RLock()
	subs, exists := c.subs[msg.Channel]
	c.mu.RUnlock()

	if !exists {
		log.ErrorLogger.Errorf("No subscribers for channel %s", msg.Channel)
		return
	}

	for _, sub := range subs {
		// create a new instance of the payload type
		payloadPtr := reflect.New(sub.payloadType).Interface()

		// unmarshal JSON into the payload instance
		if err := json.Unmarshal([]byte(msg.Payload), payloadPtr); err != nil {
			log.ErrorLogger.Errorf("Error unmarshaling message from channel %s: %v", msg.Channel, err)
			continue
		}

		// call the callback with the dereferenced payload
		callbackValue := reflect.ValueOf(sub.callback)
		payloadValue := reflect.ValueOf(payloadPtr).Elem()

		// call the function and handle errors
		results := callbackValue.Call([]reflect.Value{payloadValue})
		if len(results) > 0 && !results[0].IsNil() {
			if err, ok := results[0].Interface().(error); ok {
				log.ErrorLogger.Errorf("Error in callback for channel %s: %v", msg.Channel, err)
			}
		}
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
