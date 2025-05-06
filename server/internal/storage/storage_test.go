package storage

import (
	"fmt"
	"testing"

	"gorm.io/gorm"
)

func TestConnection(t *testing.T) {
	db, err := GetConnection()

	if err != nil {
		fmt.Printf("ERROR: %s\n", err.Error())
		t.FailNow()
	}

	// DO THIS TO CREATE A MODEL / SCHEMA / TABLE on the DATABASE
	type exampleModal struct {
		gorm.Model
		Username string `gorm:"not null;unique`
	}
	err = db.AutoMigrate(&exampleModal{})
	if err != nil {
		fmt.Printf("ERROR: %s\n", err.Error())
		t.FailNow()
	}
	// END OF updating schema

	// DO THIS TO INSERT SOMETHING
	var e = exampleModal{
		Username: "admin",
	}
	res := db.Create(&e)
	// END OF INSERTING

	if res.Error != nil {
		fmt.Printf("ERROR: %s\n", err.Error())
		t.FailNow()
	}

}
