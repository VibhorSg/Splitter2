export class EventSplitFunds{
    BlockNo: number;
    Sender: string;
    Recipient1: string;
    Recipient2: string;
    Amount: number;
  }

  export class EventWidrawFunds{
    BlockNo: number;
    Recipient: string;
    Amount: number;
  }