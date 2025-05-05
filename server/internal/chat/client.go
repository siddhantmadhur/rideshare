// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// A `Client` acts as an intermediary between the websocket connection and a single instance of the `Hub` type.
package chat

import (
	"bytes"
	"encoding/json" // **added**
	"log"
	"net/http" // **added**
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

// Client represents one websocket connection in a particular room.
type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	userID string // **added** which user this client is
	roomID string // **added** which room this client is in
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// readPump reads from WS, stores in ChatStore, and broadcasts JSON to the room.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err,
				websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// trim and convert
		content := string(bytes.TrimSpace(bytes.Replace(raw, newline, space, -1)))

		// store in history
		msg := store.AddMessage(c.roomID, c.userID, content)
		if msg == nil {
			continue
		}

		// marshal to JSON and broadcast
		if b, err := json.Marshal(msg); err == nil {
			c.hub.broadcast <- b
		}
	}
}

// writePump sends JSON messages from hub to websocket.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// hub closed
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// flush any queued
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}
			w.Close()

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveWs upgrades HTTP → WS, replays history, then registers client with its room.
func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	roomID := r.URL.Query().Get("roomId")
	if userID == "" || roomID == "" {
		http.Error(w, "Missing userId or roomId", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		roomID: roomID,
	}

	// preload entire history into this client's send queue
	history := store.GetHistory(roomID)
	for _, m := range history {
		if b, err := json.Marshal(m); err == nil {
			client.send <- b
		}
	}

	client.hub.register <- client
	go client.writePump()
	go client.readPump()
}
