declare let require: any;

import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Web3Service } from './util/web3.service';
import { Router } from '@angular/router';
const splitter_artifacts = require('../../build/contracts/Splitter.json');
import { ContractService } from './contract.service'

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatPaginator } from '@angular/material'
import { MatTableDataSource } from '@angular/material'
import { EventSplitFunds, EventWidrawFunds } from './models/logs'

@Component({
  selector: 'sender',
  templateUrl: './sender.component.html',
  styleUrls: ['./sender.component.css']
})

export class SenderComponent {

  private oneEther: number
  private senderAccount: string
  private senderBalance: string
  private amountToSend: string
  private receiver1Account: string
  private receiver1Balance: string
  private receiver2Account: string
  private receiver2Balance: string
  public logMessage: string
  private splitterTruffleAbstract: any
  private eventSplitFunds: any
  private eventWidrawalFunds: any
  private eventsAll: any
  public name: string
  public animal: string
  private currentGasPrice: any
  public displayedColumns = ['BlockNo', 'Sender', 'Recipient1', 'Recipient2', 'Amount']
  public withdrawalColumns = ['BlockNo', 'Recipient', 'Amount']
  public dataSource: MatTableDataSource<EventSplitFunds>
  public widrawDataSource: MatTableDataSource<EventWidrawFunds>
  public eventLog: EventSplitFunds[] = []
  public withdrawalLog: EventWidrawFunds[] = []
  private userAccounts: string[]
  private active: boolean

  constructor(private web3Service: Web3Service, private route: Router, private contractService: ContractService, public dialog: MatDialog) {
    this.oneEther = 1000000000000000000
    this.active = false
  }

  @ViewChild(MatPaginator) paginator: MatPaginator

  @ViewChild(MatPaginator) withdrawPaginator: MatPaginator

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.widrawDataSource.paginator = this.withdrawPaginator
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<EventSplitFunds>(this.eventLog)
    this.widrawDataSource = new MatTableDataSource<EventWidrawFunds>(this.withdrawalLog)
  }

  async split() {
    return this.web3Service.web3.eth.getGasPrice()
      .then(async gasPrice => {
        this.currentGasPrice = gasPrice
        console.log('currentGasPrice = ' + gasPrice)
        return this.web3Service.web3.eth.estimateGas({ from: this.senderAccount })
      })
      .then(async transactionGas => {
        console.log('current transaction gas ' + transactionGas)
        let amt = (Number(this.amountToSend) * this.oneEther).toString()
        //return this.contractService.splitter.splitFunds(this.receiver1Account, this.receiver2Account, { from: this.senderAccount, gas: 500000, gasPrice: this.currentGasPrice, value: amt })
        return this.contractService.splitter.splitFunds(this.receiver1Account, this.receiver2Account, { from: this.senderAccount, gas: 500000, value: amt })
      })
      .then(async (txObject) => {
        console.log(txObject.receipt.transactionHash)
      })
  }

  async addWatcherWidrawFunds() {
    console.log('Add widrawal funds ')
    this.eventWidrawalFunds = this.contractService.splitter.LogWidrawFunds({}, { fromBlock: this.web3Service.startingBlock, toBlock: 'latest' }).watch(async (error, event) => {
        if (!error)
        {
            console.log('Received widrawFunds')
            console.log(JSON.stringify(event))
            var obj = { BlockNo: event.blockNumber, Recipient: event.args.recipient, Amount: event.args.amount / this.oneEther }
            this.updateWithdrawalTable(obj)
        }
        else
          console.log(error)
      })
  }

  updateWithdrawalTable(obj) {
    this.widrawDataSource.data = [...this.widrawDataSource.data, obj]
    this.widrawDataSource.paginator._changePageSize(this.widrawDataSource.paginator.pageSize)
    this.widrawDataSource.paginator.lastPage()
}

  getCurrentAccount()
  {
    this.contractService.updateAccounts()
  }

  updateDataTable(obj) {
    this.dataSource.data = [...this.dataSource.data, obj];
    this.dataSource.paginator._changePageSize(this.dataSource.paginator.pageSize)
    this.dataSource.paginator.lastPage()
    this.widrawDataSource.paginator._changePageSize(this.widrawDataSource.paginator.pageSize)
    this.widrawDataSource.paginator.lastPage()
  }

  updateSenderBalance() {
    this.web3Service.web3.eth.getBalance(this.senderAccount).then(async balance => {
      this.senderBalance = (Number(balance) / this.oneEther).toString()
    })
  }

  senderChanged() {
    if(!this.active)
    {
      this.addWatcherWidrawFunds()
      this.active = true
    }
    console.log('sender changed')
    this.web3Service.web3.eth.getBalance(this.senderAccount).then(async balance => {
      this.senderBalance = (Number(balance) / this.oneEther).toString()
      this.eventLog = []
      this.dataSource.data = []
      this.dataSource.paginator._changePageSize(this.dataSource.paginator.pageSize)      
      this.addWatcherSplitFunds()

    })
  }

  async addWatcherSplitFunds() {
    this.eventSplitFunds = this.contractService.splitter.LogSplitFunds({ sender: this.senderAccount }, { fromBlock: this.web3Service.startingBlock, toBlock: 'latest' }).watch(async (error, event) => {
      if (!error) {
        console.log('Receive LogSplitFunds')
        console.log(JSON.stringify(event))
        console.log(event.blockNumber)
        var obj = { BlockNo: event.blockNumber, Sender: event.args.sender, Recipient1: event.args.recipient1, Recipient2: event.args.recipient2, Amount: event.args.amount/this.oneEther }
        this.updateSenderBalance()
        await this.updateDataTable(obj)
      }
      else {
        console.log(error)
      }

    })
  }

  getReceiver1Balance() {
    this.web3Service.web3.eth.getBalance(this.receiver1Account).then(async balance => {
      this.receiver1Balance = (Number(balance) / this.oneEther).toString()
    })
  }

  getReceiver2Balance() {
    this.web3Service.web3.eth.getBalance(this.receiver2Account).then(async balance => {
      this.receiver2Balance = (Number(balance) / this.oneEther).toString()
    })
  }

}


