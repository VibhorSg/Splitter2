declare let require: any;

import { Component, OnInit, ViewChild } from '@angular/core';
import { Web3Service } from './util/web3.service';
import { Router } from '@angular/router';
import { ContractService } from './contract.service'
import { MatTableDataSource, MatPaginator } from '@angular/material'
import { EventSplitFunds, EventWidrawFunds } from './models/logs'

@Component({
    selector: 'recipient',
    templateUrl: './recipient.component.html',
    styleUrls: ['./recipient.component.css']
})

export class RecipientComponent {

    private recipientAccount: string
    private recipientBalance: string
    private eventSplitFunds: any
    private eventWidrawFunds: any
    private eventWidrawalFunds: any
    private oneEther: number
    public dataSource: MatTableDataSource<EventSplitFunds>
    public widrawDataSource: MatTableDataSource<EventWidrawFunds>
    public eventLog: EventSplitFunds[] = []
    public withdrawalLog: EventWidrawFunds[] = []
    public displayedColumns = ['BlockNo', 'Sender', 'Amount']
    public withdrawalColumns = ['BlockNo', 'Recipient', 'Amount']

    constructor(private web3Service: Web3Service, private contractService: ContractService) {
        this.oneEther = 1000000000000000000 //This can be shiftyed to service
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

    recipientChanged() {
        console.log('recipient changed')
        this.web3Service.web3.eth.getBalance(this.recipientAccount).then(async balance => {
            this.recipientBalance = (Number(balance) / this.oneEther).toString()
            this.eventLog = []
            this.dataSource.data = []
            this.withdrawalLog = []
            this.widrawDataSource.data = []
            this.dataSource.paginator._changePageSize(this.dataSource.paginator.pageSize)
            this.widrawDataSource.paginator._changePageSize(this.widrawDataSource.paginator.pageSize)
            this.addWatcherSplitFunds()
        })
    }

    withdrawAmount()
    {
        let currentGasPrice: any
        this.web3Service.web3.eth.getGasPrice().then(async gasPrice => {
          currentGasPrice = gasPrice
          console.log('current gas price ' + currentGasPrice)
          this.web3Service.web3.eth.estimateGas({ from: this.recipientAccount }).then(async transactionGas => {
            console.log('current gas ' + transactionGas)
            console.log('Is gas calculation is correct?')
            this.contractService.splitter.withdrawFunds({ from: this.recipientAccount, gas: 500000 })
          })
    
        })
    }

    async addWatcherWidrawFunds() {
        console.log('Add widrawal funds ')
        this.eventWidrawalFunds = this.contractService.splitter.LogWidrawFunds({recipient: this.recipientAccount}, { fromBlock: this.web3Service.startingBlock, toBlock: 'latest' }).watch(async (error, event) => {
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

    async addWatcherSplitFunds() {
        this.eventSplitFunds = this.contractService.splitter.LogSplitFunds({}, { fromBlock: this.web3Service.startingBlock, toBlock: 'latest' }).watch(async (error, event) => {
            if (!error) {
                console.log('Receive LogSplitFunds')
                console.log(JSON.stringify(event))
                console.log(event.blockNumber)

                if ((this.recipientAccount.toUpperCase() == event.args.recipient1.toUpperCase()) || (this.recipientAccount.toUpperCase() == event.args.recipient2.toUpperCase())) {
                    console.log('Valid recipient')
                    var obj = { BlockNo: event.blockNumber, Sender: event.args.sender, Amount: event.args.amount / (2 * this.oneEther) }
                    this.addWatcherWidrawFunds()
                    this.updateDataTable(obj)
                }
                else
                {
                    //Display dialog no logs
                }
            }
            else {
                console.log(error)
            }

        })
    }

    updateWithdrawalTable(obj) {
        this.widrawDataSource.data = [...this.widrawDataSource.data, obj]
        this.widrawDataSource.paginator._changePageSize(this.widrawDataSource.paginator.pageSize)
        this.widrawDataSource.paginator.lastPage()
    }

    updateDataTable(obj) {
        this.dataSource.data = [...this.dataSource.data, obj];
        this.dataSource.paginator._changePageSize(this.dataSource.paginator.pageSize)
        this.dataSource.paginator.lastPage()
    }

    getCurrentAccount()
    {
      this.contractService.updateAccounts()
    }
}