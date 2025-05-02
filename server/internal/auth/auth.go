package auth

type User struct {
	ID          string `json:"uid" gorm:"primaryKey"`
	DisplayName string `json:"uid" gorm:"not null"`
}

func CreateUser(u *User) error {
	return nil
}
