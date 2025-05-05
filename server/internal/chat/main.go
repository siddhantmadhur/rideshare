// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// main.go
package chat

import (
	"encoding/json" // **added**
	"flag"
	"log"
	"net/http"
	"sync"
)

var addr = flag.String("addr", ":8080", "http service address")

// a map of all hubs, one per room
var hubsMu sync.Mutex // **added**  
var hubs   = make(map[string]*Hub) // **added**

// getHub returns (or creates) the single Hub for a room.
func getHub(roomID string) *Hub {
	hubsMu.Lock()
	defer hubsMu.Unlock()

	if hub, ok := hubs[roomID]; ok {
		return hub
	}
	hub := newHub()
	hubs[roomID] = hub
	go hub.run()
	return hub
}

// handleUsers returns a static list of users.          
func handleUsers(w http.ResponseWriter, r *http.Request) {
	// TODO: right now only for testing, need to be replaced by actual user data
	usersList := []User{ 
		{ID: "u1", Name: "User111111"},
		{ID: "u2", Name: "User222222"},
		{ID: "u3", Name: "User333333"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(usersList)
}

// handleRoom creates a new room for users, or returns the existing one.
func handleRoom(w http.ResponseWriter, r *http.Request) {
	userA := r.URL.Query().Get("userA")
	userB := r.URL.Query().Get("userB")
	if userA == "" || userB == "" {
		http.Error(w, "Missing userA or userB", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		room := store.GetOrCreateRoom(userA, userB)
		history := store.GetHistory(room.ID)

		resp := struct {
			RoomID  string    `json:"roomId"`
			History []Message `json:"history"`
		}{
			RoomID:  room.ID,
			History: history,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)

	case http.MethodDelete:
		store.DeleteHistory(userA, userB)
		w.WriteHeader(http.StatusOK)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleLatest returns the single most recent message in a room.
func handleLatest(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("roomID")
	if roomID == "" {
		http.Error(w, "Missing roomID", http.StatusBadRequest)
		return
	}
	m := store.GetLatestMessage(roomID)
	if m == nil {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(m)
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	http.ServeFile(w, r, "home.html")
}

func main() {
	flag.Parse()

	http.HandleFunc("/", serveHome)
	http.HandleFunc("/users", handleUsers)   // **added**
	http.HandleFunc("/room", handleRoom)     // **added**
	http.HandleFunc("/latest", handleLatest) // **added**

	// WebSocket endpoint reads userId & roomId from query and picks the right hub
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		userID := r.URL.Query().Get("userId")
		roomID := r.URL.Query().Get("roomId")
		if userID == "" || roomID == "" {
			http.Error(w, "Missing userId or roomId", http.StatusBadRequest)
			return
		}
		hub := getHub(roomID)
		serveWs(hub, w, r)
	})

	log.Println("Server listening on", *addr)
	if err := http.ListenAndServe(*addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
