
declare let require: any;

import { Component, OnInit } from '@angular/core';
import { Web3Service } from './util/web3.service';
const splitter_artifacts = require('../../build/contracts/Splitter.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private oneEther: number
  private senderAccount: string
  private senderBalance: string
  private amountToSend: string
  private receiver1Account: string
  private receiver1Balance: string
  private receiver2Account: string
  private receiver2Balance: string
  private logMessage: string
  private splitterTruffleAbstract: any
  public splitter: any
  private eventSplitFunds: any

  constructor(private web3Service: Web3Service) { this.oneEther = 1000000000000000000 }

  ngOnInit() {
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

  split() {

    let currentGasPrice: any
    this.web3Service.web3.eth.getGasPrice().then( async gasPrice =>{
      currentGasPrice = gasPrice
      console.log('current gas price ' + currentGasPrice)
      this.web3Service.web3.eth.estimateGas({from: this.senderAccount}).then( async transactionGas =>{
        console.log('current gas ' + transactionGas)
        let amt = (Number(this.amountToSend) * this.oneEther).toString()
        console.log('How to calculate gas for split function?')
        this.splitter.splitFunds(this.receiver1Account, this.receiver2Account, { from: this.senderAccount, gas: 1721975, gasPrice: currentGasPrice, value: amt })
      })

    })
  }

  async recipientWidrawFunds(recipient: string) {
    let currentGasPrice: any
    this.web3Service.web3.eth.getGasPrice().then( async gasPrice =>{
      currentGasPrice = gasPrice
      console.log('current gas price ' + currentGasPrice)
      this.web3Service.web3.eth.estimateGas({from: recipient}).then( async transactionGas =>{
        console.log('current gas ' + transactionGas)
        console.log('Is gas calculation is correct?')
        this.splitter.withdrawFunds({ from: recipient, gas: transactionGas, gasPrice: currentGasPrice })
      })

    })
  }


  updateSenderBalance() {
    this.web3Service.web3.eth.getBalance(this.senderAccount).then(async balance => {
      this.senderBalance = (Number(balance) / this.oneEther).toString()
    })
  }

  senderChanged() {
    this.web3Service.web3.eth.getBalance(this.senderAccount).then(async balance => {
      this.senderBalance = (Number(balance) / this.oneEther).toString()
    })

    if (this.eventSplitFunds === undefined) {

      this.web3Service.web3.eth.getBlockNumber().then(async (currentblock) => {
        this.addWatcherSplitFunds(currentblock)
        this.addWatcherWidrawFunds(currentblock)
      })
    }
  }

  addWatcherSplitFunds(currentBlock: number) {
    this.eventSplitFunds = this.splitter.LogSplitFunds({}, { fromBlock: currentBlock, toBlock: 'latest' }).watch(async (error, event) => {
      if (!error) {
        this.recipientWidrawFunds(event.args.recipient1)
        this.recipientWidrawFunds(event.args.recipient2)
        this.updateSenderBalance()
      }
      else {
        console.log(error)
      }

    })
  }

  addWatcherWidrawFunds(currentBlock: number) {
    this.splitter.LogWidrawFunds({}, { fromBlock: currentBlock, toBlock: 'latest' }).watch(async (error, event) => {
      if (this.receiver1Account && this.receiver1Account.toUpperCase() == event.args.recipient.toUpperCase()) {
        if (!error)
          this.receiver1Changed()
        else
          console.log(error)
      }
      else if (this.receiver2Account && this.receiver2Account.toUpperCase() == event.args.recipient.toUpperCase()) {
        if (!error)
          this.receiver2Changed()
        else
          console.log(error)
      }
    })

  }

  receiver1Changed() {
    this.web3Service.web3.eth.getBalance(this.receiver1Account).then(async balance => {
      this.receiver1Balance = (Number(balance) / this.oneEther).toString()
    })
  }

  receiver2Changed() {
    this.web3Service.web3.eth.getBalance(this.receiver2Account).then(async balance => {
      this.receiver2Balance = (Number(balance) / this.oneEther).toString()
    })
  }

}
