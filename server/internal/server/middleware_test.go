package server

import "testing"

func TestInvalidBearerToken(t *testing.T) {
	req := "Bearer"
	_, err := getBearerToken(req)
	if err == nil {
		t.FailNow()
	}

}
func TestValidBearerToken(t *testing.T) {
	req := "Bearer mysecretpassword"
	token, err := getBearerToken(req)
	if err != nil {
		t.FailNow()
	}
	if token != "mysecretpassword" {
		t.FailNow()
	}

}
