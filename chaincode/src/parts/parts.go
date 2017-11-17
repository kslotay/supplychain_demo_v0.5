package main

import (
	"fmt"
	"strconv"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type SimpleChaincode struct {
}

type Part struct {
	ObjectType string        `json:"docType"` 
	Id       string          `json:"id"`      
	Color      string        `json:"color"`
	Weight       int         `json:"size"`    
	Owner      OwnerRelation `json:"owner"`
}

// Owners
type Owner struct {
	ObjectType string `json:"docType"`
	Id         string `json:"id"`
	Username   string `json:"username"`
	Company    string `json:"company"`
	Enabled    bool   `json:"enabled"`
}

type OwnerRelation struct {
	Id         string `json:"id"`
	Username   string `json:"username"`
	Company    string `json:"company"`     
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error %s", err)
	}
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Starting")
	funcName, args := stub.GetFunctionAndParameters()
	var number int
	var err error
	txId := stub.GetTxID()
	
	fmt.Println("Transaction ID:", txId)
	fmt.Println("  GetFunctionAndParameters() function:", funcName)
	fmt.Println("  GetFunctionAndParameters() args count:", len(args))
	fmt.Println("  GetFunctionAndParameters() args found:", args)

	if len(args) == 1 {

			number= strconv.Atoi(args[0])

			stub.PutState("selftest", []byte(strconv.Itoa(number)))
		}
	}

	alt := stub.GetStringArgs()
	fmt.Println("  GetStringArgs() args count:", len(alt))
	fmt.Println("  GetStringArgs() args found:", alt)

	err = stub.PutState("parts_ui", []byte("0.0.1"))
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("Ready for action")
	return shim.Success(nil)
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println(" ")
	fmt.Println("starting invoke, for - " + function)

	if function == "init" {                    
		return t.Init(stub)
	} else if function == "read" {             
		return read(stub, args)
	} else if function == "write" {            
		return write(stub, args)
	} else if function == "delete_part" {    
		return delete_part(stub, args)
	} else if function == "init_part" {      
		return init_part(stub, args)
	} else if function == "set_owner" {        
		return set_owner(stub, args)
	} else if function == "init_owner"{        
		return init_owner(stub, args)
	} else if function == "read_everything"{   
		return read_everything(stub)
	} else if function == "getHistory"{        
		return getHistory(stub, args)
	} else if function == "getPartsByRange"{ 
		return getPartsByRange(stub, args)
	} else if function == "disable_owner"{     
		return disable_owner(stub, args)
	}

	fmt.Println("Received unknown invoke function name - " + function)
	return shim.Error("Received unknown invoke function name - '" + function + "'")
}