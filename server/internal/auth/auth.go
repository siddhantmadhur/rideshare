package auth

type User struct {
	ID          string `json:"uid" gorm:"primaryKey"`
	DisplayName string `json:"display_name" gorm:"not null"`
	Age         int    `json:"age" gorm:"not null"`
}

func CreateUser(u *User) error {
	return nil
}
