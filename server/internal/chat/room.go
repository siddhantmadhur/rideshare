package chat

// represents a chat room
type room struct{
	clients map[*client]struct{} // represents all clients in a room

	forward chan []byte
}
