'use strict';
const shim = require('fabric-shim');

var Chaincode = class {

    // Initialize the chaincode
    async Init(stub) {
        console.info('========= Inscription dun nouveau patient =========');
        let ret = stub.getFunctionAndParameters();
        console.info(ret);
        return shim.success();
    }

    async Invoke(stub) {
        console.info('Transaction ID: ' + stub.getTxID());
        let ret = stub.getFunctionAndParameters();
        console.info(ret);
        let method = this[ret.fcn];
        if (!method) {
            console.error('no method of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }

        console.info('Calling method : ' + ret.fcn + "\n");
        try {
            let payload = await method(stub, ret.params, this);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    //Ajouter un nouveau patient
    async addPatient(stub, args, thisClass) {
        let publicKey = args[0];
        let Patient = args[1]; 
   
        const buffer = Buffer.from(JSON.stringify(Patient));
        await stub.putState(publicKey, buffer);
    }

    async query(stub, args, thisClass) {

        let jsonResp = {};

        let publicKey = args[0];
        let patientAsBytes = await stub.getState(publicKey);
        if (!patientAsBytes.toString()){
            console.info('Failed to get patient');
            jsonResp.Error = 'Failed to get patient';
            throw new Error(JSON.stringify(jsonResp));    
        }
        return patientAsBytes;
    }

    async invoke(stub, args, thisClass) {

        let jsonResp = {};
        

        let publicKey = args[0];
        let patient = args[1];

        let patientAsBytes = await stub.getState(publicKey);
        if (!patientAsBytes.toString()){
            console.info('Failed to get patient');
            jsonResp.Error = 'Failed to get patient';
            throw new Error(JSON.stringify(jsonResp));    
        }
        let patientJSONBytes = Buffer.from(JSON.stringify(patient));
        await stub.putState(publicKey, patientJSONBytes);
    }
};

shim.start(new Chaincode());