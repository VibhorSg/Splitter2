declare let require: any;

import { Web3Service } from './util/web3.service';
import { Injectable } from '@angular/core';
const splitter_artifacts = require('../../build/contracts/Splitter.json');

@Injectable()
export class ContractService {

    public splitter: any
    private splitterTruffleAbstract: any
    public userAccounts: string[]

    constructor(private web3Service: Web3Service) {
    }

    async initialiseSplitterContract() {
        console.log('Contract service initialise ')
        this.web3Service.artifactsToContract(splitter_artifacts)
            .then((splitterAbstraction) => {
                this.splitterTruffleAbstract = splitterAbstraction;
                this.deploySplitterContract()
            });

    }

    async deploySplitterContract() {
        this.splitterTruffleAbstract.deployed().then(async instance => {
            this.splitter = instance
        })
    }

    async updateAccounts() {
        if (!this.web3Service.web3) {
            const delay = new Promise(resolve => setTimeout(resolve, 100));
            await delay;
            this.web3Service.web3.eth.getAccounts().then(async accounts => {
                this.userAccounts = [...accounts]
            })
        }
        else {
            this.web3Service.web3.eth.getAccounts().then(async accounts => {
                this.userAccounts = [...accounts]
            })
        }
    }


}