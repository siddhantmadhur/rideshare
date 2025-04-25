package auth

type User struct {
	UID         string `json:"uid" gorm:"primaryKey"`
	DisplayName string `json:"uid" gorm:"not null"`
}

type CreateUserParams struct {
	UID string `json:"uid"`
}

func CreateUser(params CreateUserParams) (*User, error) {
	return nil, nil
}
