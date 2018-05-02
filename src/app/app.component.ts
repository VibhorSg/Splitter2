
declare let require: any;

import { Component, OnInit } from '@angular/core';
import { Web3Service } from './util/web3.service';
const splitter_artifacts = require('../../build/contracts/Splitter.json');
import { ContractService } from './contract.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private contractService: ContractService){
  }

  ngOnInit(){
    console.log('App component ngOnInit')
    this.contractService.initialiseSplitterContract()
    this.contractService.updateAccounts()
  }

}
