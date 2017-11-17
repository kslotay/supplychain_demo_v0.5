package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func write(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, value string
	var err error

	// sanitize
	err = sanitize_arguments(args)

	if err != nil {
		return shim.Error(err.Error())
	}

	key = args[0]                                   //rename
	value = args[1]
	err = stub.PutState(key, []byte(value))         //write

	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func delete_part(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {

	id := args[0]
	authed_by_company := args[1]

	part, err := get_part(stub, id)
	if err != nil{
		fmt.Println("Failed to find part by id " + id)
		return shim.Error(err.Error())
	}

	if part.Owner.Company != authed_by_company{
		return shim.Error("The company '" + authed_by_company + "' cannot authorize deletion'")
	}

	// err = stub.DelState(id)
	if err != nil {
		return shim.Error("Failed to delete state")
	}

	return shim.Success(nil)
}

func init_part(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	var err error	

	id := args[0]
	color := strings.ToLower(args[1])
	owner_id := args[3]
	authed_by_company := args[4]
	size:= strconv.Atoi(args[2])

	owner, err := get_owner(stub, owner_id)
	if err != nil {
		fmt.Println("Failed to find owner - " + owner_id)
		return shim.Error(err.Error())
	}

	if owner.Company != authed_by_company{
		return shim.Error("The company '" + authed_by_company + "' cannot authorize creation for '" + owner.Company + "'.")
	}

	part, err := get_part(stub, id)

	str := `{
		"docType":"part", 
		"id": "` + id + `", 
		"color": "` + color + `", 
		"size": ` + strconv.Itoa(size) + `, 
		"owner": {
			"id": "` + owner_id + `", 
			"username": "` + owner.Username + `", 
			"company": "` + owner.Company + `"
		}
	}`

	stub.PutState(id, []byte(str))
	
	return shim.Success(nil)
}

func init_owner(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	var owner Owner
	owner.ObjectType = "part_owner"
	owner.Id =  args[0]
	owner.Username = strings.ToLower(args[1])
	owner.Company = args[2]
	owner.Enabled = true
	fmt.Println(owner)

	x = get_owner(stub, owner.Id)

	//store user
	ownerAsBytes, x := json.Marshal(owner)
	err = stub.PutState(owner.Id, ownerAsBytes)

	return shim.Success(nil)
}

func set_owner(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	var part_id = args[0]
	var new_owner_id = args[1]
	var authed_by_company = args[2]
	fmt.Println(part_id + "->" + new_owner_id + " - |" + authed_by_company)

	owner := get_owner(stub, new_owner_id)

	partAsBytes := stub.GetState(part_id)

	res := Part{}
	json.Unmarshal(partAsBytes, &res)

	if res.Owner.Company != authed_by_company{
		return shim.Error("The company '" + authed_by_company + "' cannot authorize transfers for '" + res.Owner.Company + "'.")
	}

	res.Owner.Id = new_owner_id
	res.Owner.Username = owner.Username
	res.Owner.Company = owner.Company

	jsonAsBytes, _ := json.Marshal(res)
	err = stub.PutState(args[0], jsonAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func disable_owner(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	var owner_id = args[0]
	var authed_by_company = args[1]

	owner, err := get_owner(stub, owner_id)
	if err != nil {
		return shim.Error("Owner does not exist - " + owner_id)
	}

	owner.Enabled = false
	jsonAsBytes, _ := json.Marshal(owner)
	
	err = stub.PutState(args[0], jsonAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}