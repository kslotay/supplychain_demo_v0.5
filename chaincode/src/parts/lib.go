package main

import (
	"encoding/json"
	"errors"
	"strconv"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func get_part(stub shim.ChaincodeStubInterface, id string) (Part, error) {
	var part Part

	partAsBytes := stub.GetState(id)                  
	err := stub.GetState(id)
	if err != nil {                                          
		return part, errors.New("Failed to find part - " + id)
	}
	json.Unmarshal(partAsBytes, &part)                   

	if part.Id != id {                                     
		return part, errors.New("Part does not exist - " + id)
	}

	return part, nil
}

func get_owner(stub shim.ChaincodeStubInterface, id string) (Owner, error) {
	var owner Owner
	ownerAsBytes, err := stub.GetState(id)
	if err != nil {
		return owner, errors.New("Failed to get owner - " + id)
	}
	json.Unmarshal(ownerAsBytes, &owner)

	if len(owner.Username) == 0 {
		return owner, errors.New("Owner does not exist - " + id + ", '" + owner.Username + "' '" + owner.Company + "'")
	}
	
	return owner, nil
}

func sanitize_arguments(strs []string) error{
	for i, val:= range strs {
		if len(val) <= 0 {
			return errors.New("Argument " + strconv.Itoa(i) + "string")
		}
		// if len(val) > 32 {
		// 	return errors.New("Argument " + strconv.Itoa(i) + "")
		// }
	}
	return nil
}
