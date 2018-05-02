declare let require: any;

import { Injectable } from '@angular/core';
const contract = require('truffle-contract');
import { Subject } from 'rxjs/Rx';
const Web3 = require('web3');

declare let window: any;

@Injectable()
export class Web3Service {
  public web3: any;
  public currentProvider: any
  public startingBlock: any
  public userAccounts: string[]

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {

      console.log(Web3)

      this.currentProvider = window.web3.currentProvider;
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(this.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    }
    this.web3.eth.getAccounts().then(async accounts => {
      this.userAccounts = [...accounts]
    })

    this.web3.eth.getBlockNumber().then(async block => {
      this.startingBlock = block
    })
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);

    return contractAbstraction;

  }

}
