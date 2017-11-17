package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error

	key = args[0]
	valAsbytes, err := stub.GetState(key)
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsbytes)
}

func read_everything(stub shim.ChaincodeStubInterface) pb.Response {
	type Everything struct {
		Owners   []Owner   `json:"owners"`
		Parts  []Part  `json:"parts"`
	}
	var everything Everything

	resultsIterator:= stub.GetStateByRange("m0", "m9999999999999999999")
	defer resultsIterator.Close()
	
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on part id - ", queryKeyAsStr)
		var part Part
		json.Unmarshal(queryValAsBytes, &part)
		everything.Parts = append(everything.Parts, part)
	}

	ownersIterator:= stub.GetStateByRange("o0", "o9999999999999999999")
	defer ownersIterator.Close()

	for ownersIterator.HasNext() {
		aKeyValue, err := ownersIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on owner id - ", queryKeyAsStr)
		var owner Owner
		json.Unmarshal(queryValAsBytes, &owner)

		if owner.Enabled {
			everything.Owners = append(everything.Owners, owner)
		}
	}

	everythingAsBytes, _ := json.Marshal(everything)
	return shim.Success(everythingAsBytes)
}

func getHistory(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	type AuditHistory struct {
		TxId    string   `json:"txId"`
		Value   Part   `json:"value"`
	}
	var history []AuditHistory;
	var part Part

	partId := args[0]

	resultsIterator := stub.GetHistoryForKey(partId)
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		var tx AuditHistory
		tx.TxId = historyData.TxId
		json.Unmarshal(historyData.Value, &part)
		if historyData.Value == nil {
			var emptyPart Part
			tx.Value = emptyPart
		} else {
			json.Unmarshal(historyData.Value, &part)
			tx.Value = part
		}
		history = append(history, tx)
	}

	historyAsBytes, _ := json.Marshal(history)
	return shim.Success(historyAsBytes)
}

func getPartsByRange(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	startKey := args[0]
	endKey := args[1]

	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryResultKey := aKeyValue.Key
		queryResultValue := aKeyValue.Value

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResultKey)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")

		buffer.WriteString(string(queryResultValue))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getPartsByRange queryResult:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}
