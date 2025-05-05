package chat

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

// User represents one user in the system.
type User struct {
	ID   string `json:"id"`   // unique user identifier
	Name string `json:"name"` // display name
}

// Message represents one chat message in a room.
type Message struct {
	ID        string    `json:"id"`        // unique message identifier
	RoomID    string    `json:"roomId"`    // the room this message belongs to
	SenderID  string    `json:"senderId"`  // who sent it
	Content   string    `json:"content"`   // text payload
	CreatedAt time.Time `json:"createdAt"` // timestamp of send
}

// ChatRoom holds two participants and their message history.
type ChatRoom struct {
	ID           string    `json:"id"`           // unique room ID (UUID)
	Name         string    `json:"name"`         // optional room name
	ParticipantA string    `json:"participantA"` // one user ID
	ParticipantB string    `json:"participantB"` // the other user ID
	Messages     []Message `json:"messages"`     // history, in send order
}

// ChatStore is a thread-safe in-memory store of all rooms.
type ChatStore struct {
	mu    sync.RWMutex
	rooms map[string]*ChatRoom // key = sorted(userA:userB)
}

// NewChatStore creates an empty ChatStore.
func NewChatStore() *ChatStore {
	return &ChatStore{
		rooms: make(map[string]*ChatRoom),
	}
}

// store is the global in-memory chat store.       // **added**
var store = NewChatStore()

// roomKey returns a key for a pair of users.
func roomKey(userA, userB string) string {
	if userA < userB {
		return userA + ":" + userB
	}
	return userB + ":" + userA
}

// GetOrCreateRoom returns an existing room for the two users, or makes a new one.
func (s *ChatStore) GetOrCreateRoom(userA, userB string) *ChatRoom {
	key := roomKey(userA, userB)

	s.mu.Lock()
	defer s.mu.Unlock()

	if room, ok := s.rooms[key]; ok {
		return room
	}

	// create new
	id := uuid.New().String()
	room := &ChatRoom{
		ID:           id,
		Name:         "chat_" + id,
		ParticipantA: userA,
		ParticipantB: userB,
		Messages:     []Message{},
	}
	s.rooms[key] = room
	return room
}

// DeleteHistory clears all messages in the room of those two users.
func (s *ChatStore) DeleteHistory(userA, userB string) {
	key := roomKey(userA, userB)

	s.mu.Lock()
	defer s.mu.Unlock()

	if room, ok := s.rooms[key]; ok {
		room.Messages = []Message{}
	}
}

// AddMessage appends a new message to the given room and returns it.
func (s *ChatStore) AddMessage(roomID, senderID, content string) *Message {
	s.mu.Lock()
	defer s.mu.Unlock()

	// find the room by ID
	for _, room := range s.rooms {
		if room.ID == roomID {
			msg := Message{
				ID:        uuid.New().String(),
				RoomID:    roomID,
				SenderID:  senderID,
				Content:   content,
				CreatedAt: time.Now(),
			}
			room.Messages = append(room.Messages, msg)
			return &msg
		}
	}
	return nil
}

// GetHistory returns a copy of all messages in the room, in order.
func (s *ChatStore) GetHistory(roomID string) []Message {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, room := range s.rooms {
		if room.ID == roomID {
			h := make([]Message, len(room.Messages))
			copy(h, room.Messages)
			return h
		}
	}
	return nil
}

// GetLatestMessage returns the most recent message in the room, or nil.
func (s *ChatStore) GetLatestMessage(roomID string) *Message {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, room := range s.rooms {
		if room.ID == roomID && len(room.Messages) > 0 {
			m := room.Messages[len(room.Messages)-1]
			return &m
		}
	}
	return nil
}
