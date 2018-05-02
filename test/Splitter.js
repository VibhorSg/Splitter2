const Splitter = artifacts.require("./Splitter.sol")
Promise = require('bluebird')
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract('Splitter', async accounts => {

    const account0 = accounts[0]
    const sender = accounts[1]
    const recipient1 = accounts[2]
    const recipient2 = accounts[3]
    const failAccount = accounts[5] //This account is use to test fail transactions
    const oneEther = 1000000000000000000

    let splitterInstance

    beforeEach('Initialise splitter contract instance', async () => {
        Splitter.deployed({ from: account0 }).then(async (instance) => {
            this.splitterInstance = instance
        })
    })

    describe('Contract creation and initialise success test cases', async () => {
        it('Should set the correct owner', async () => {
            return this.splitterInstance.owner()
                .then(owner => {
                    assert.strictEqual(owner, account0, 'accounts[0] should be owner')
                })
        })
    })//Contract creation and initialise success test cases

    describe('Split functionality success test cases', async () => {

        it('Sender account should debit with current amount', async () => {
            let amountToSplitInWei = 2 * Number(oneEther)
            let senderBalBeforeSplit
            let txCost
            let txGasUsed
            return web3.eth.getBalancePromise(sender)
                .then(balance => {
                    senderBalBeforeSplit = balance.toNumber()
                    return this.splitterInstance.splitFunds(recipient1, recipient2, { from: sender, value: amountToSplitInWei })
                })
                .then(function (txObject) {
                    txGasUsed = txObject.receipt.gasUsed
                    return web3.eth.getTransactionPromise(txObject.receipt.transactionHash)
                })
                .then(txObject => {
                    txCost = txGasUsed * txObject.gasPrice.toNumber()
                    return web3.eth.getBalancePromise(sender)
                })
                .then(balance => {
                    assert.strictEqual(balance.toNumber(), senderBalBeforeSplit - amountToSplitInWei - txCost, 'Sender amount should detect properly')
                })
        })

        it('Should generate event log', async () => {
            let amountToSplitInWei = 2 * Number(oneEther)
            return this.splitterInstance.splitFunds(recipient1, recipient2, { from: sender, value: amountToSplitInWei })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                    assert.equal(txObject.logs[0].event, 'LogSplitFunds', 'event should be LogSplitFunds')
                    assert.equal(txObject.logs[0].args.sender, sender, 'sender should matched')
                    assert.equal(txObject.logs[0].args.recipient1, recipient1, 'recipient1 should matched')
                    assert.equal(txObject.logs[0].args.recipient2, recipient2, 'recipient2 should matched')
                    assert.equal(txObject.logs[0].args.amount, amountToSplitInWei, 'amount should matched')
                })
        })

    })//Split functionality success test cases


    describe('WithdrawFunds functionality success test cases', async () => {

        it('Recipient1 account should credit with currect amount ', async () => {
            let amountToSplitInWei = 4 * Number(oneEther)
            let recipient1BalanceBeforeCreadit
            let txCost
            let txGasUsed
            return web3.eth.getBalancePromise(recipient1)
                .then(balance => {
                    recipient1BalanceBeforeCreadit = balance.toNumber()
                    return this.splitterInstance.splitFunds(recipient1, recipient2, { from: sender, value: amountToSplitInWei })
                })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                    assert.equal(txObject.logs[0].event, 'LogSplitFunds', 'event should be LogSplitFunds')
                    assert.equal(txObject.logs[0].args.sender, sender, 'sender should matched')
                    assert.equal(txObject.logs[0].args.recipient1, recipient1, 'recipient1 should matched')
                    assert.equal(txObject.logs[0].args.recipient2, recipient2, 'recipient2 should matched')
                    assert.equal(txObject.logs[0].args.amount, amountToSplitInWei, 'amount should matched')
                    return
                })
                .then(async () => {
                    return this.splitterInstance.withdrawFunds({ from: recipient1 })
                })
                .then(function (txObject) {
                    txGasUsed = txObject.receipt.gasUsed
                    return web3.eth.getTransactionPromise(txObject.receipt.transactionHash)
                })
                .then(txObject => {
                    txCost = txGasUsed * txObject.gasPrice.toNumber()
                    return web3.eth.getBalancePromise(recipient1)
                })
                .then(balance => {
                    assert.strictEqual(balance.toNumber(), recipient1BalanceBeforeCreadit - txCost + amountToSplitInWei / 2, 'Recipient amount should credit correctly')
                })
        })

        it('Recipient2 account should credit with currect amount ', async () => {
            let amountToSplitInWei = 4 * Number(oneEther)
            let recipient1BalanceBeforeCreadit
            let txCost
            let txGasUsed
            return web3.eth.getBalancePromise(recipient2)
                .then(balance => {
                    recipient1BalanceBeforeCreadit = balance.toNumber()
                    return this.splitterInstance.splitFunds(recipient1, recipient2, { from: sender, value: amountToSplitInWei })
                })
                .then(async (txObject) => {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                    assert.equal(txObject.logs[0].event, 'LogSplitFunds', 'event should be LogSplitFunds')
                    assert.equal(txObject.logs[0].args.sender, sender, 'sender should matched')
                    assert.equal(txObject.logs[0].args.recipient1, recipient1, 'recipient1 should matched')
                    assert.equal(txObject.logs[0].args.recipient2, recipient2, 'recipient2 should matched')
                    assert.equal(txObject.logs[0].args.amount, amountToSplitInWei, 'amount should matched')
                    return this.splitterInstance.withdrawFunds({ from: recipient2 })
                })
                .then(function (txObject) {
                    txGasUsed = txObject.receipt.gasUsed
                    return web3.eth.getTransactionPromise(txObject.receipt.transactionHash)
                })
                .then(txObject => {
                    txCost = txGasUsed * txObject.gasPrice.toNumber()
                    return web3.eth.getBalancePromise(recipient2)
                })
                .then(balance => {
                    assert.strictEqual(balance.toNumber(), recipient1BalanceBeforeCreadit - txCost + amountToSplitInWei / 2, 'Recipient amount should credit correctly')
                })
        })

    })//WithdrawFunds functionality success test cases


    describe('Contract creation and initialise fail test cases', async () => {
        it('Should revert for creation with value', async () => {
            try {
                const ValueInstance = await Splitter.new({ value: 10 });
                assert.isUndefined(ValueInstance, 'Instance should be undefined. Should throw error');
            } catch (err) {
                assert.include(err.message, 'revert', 'Contract created with value');
            }
        })
    })//Contract creation and initialise fail test cases

    describe('WithdrawFunds functionality fail test cases', async () => {

        it('Should revert when recipient address same as sender', async () => {

            const recipient7 = accounts[7]
            const recipient8 = accounts[8]
            const recipient9 = accounts[8]
            let amountToSplitInWei = 4 * Number(oneEther)
            let recipient1BalanceBeforeCreadit
            let txCost
            let txGasUsed
            return web3.eth.getBalancePromise(recipient7)
                .then(balance => {
                    recipient1BalanceBeforeCreadit = balance.toNumber()
                    return this.splitterInstance.splitFunds(recipient7, recipient8, { from: failAccount, value: amountToSplitInWei })
                })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                    assert.equal(txObject.logs[0].event, 'LogSplitFunds', 'event should be LogSplitFunds')
                    return
                })
                .then(async () => {
                    return this.splitterInstance.withdrawFunds({ from: failAccount })
                })
                .then(function (txObject) {
                    console.log(txObject)
                })
        })

        it('Should revert when recipient1 address invalid', async () => {

            const recipient7 = accounts[7]
            const recipient8 = accounts[8]
            let amountToSplitInWei = 4 * Number(oneEther)
            let recipient1BalanceBeforeCreadit
            let txCost
            let txGasUsed
            return web3.eth.getBalancePromise(recipient7)
                .then(balance => {
                    recipient1BalanceBeforeCreadit = balance.toNumber()
                    return this.splitterInstance.splitFunds(recipient7, recipient8, { from: failAccount, value: amountToSplitInWei })
                })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                    assert.equal(txObject.logs[0].event, 'LogSplitFunds', 'event should be LogSplitFunds')
                    return
                })
                .then(async () => {
                    return this.splitterInstance.withdrawFunds({ from: recipient9 })
                })
                .then(function (txObject) {
                    console.log(txObject)
                })
        })


    })//WithdrawFunds functionality fail test cases

    describe('Split functionality fail test cases', async () => {

        it('Should revert when split amount is 0', async () => {
            let amountToSplitInWei = 0
            return this.splitterInstance.splitFunds(recipient1, recipient2, { from: failAccount, value: amountToSplitInWei })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                })
        })

        it('Should revert when sender and recipient1 account same', async () => {
            let amountToSplitInWei = 2 * Number(oneEther)
            return this.splitterInstance.splitFunds(failAccount, recipient2, { from: failAccount, value: amountToSplitInWei })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                })
        })

        it('Should revert when sender and recipient2 account same', async () => {
            let amountToSplitInWei = 2 * Number(oneEther)
            return this.splitterInstance.splitFunds(recipient1, failAccount, { from: failAccount, value: amountToSplitInWei })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                })
        })

        it('Should revert when recipient1 and recipient2 account same', async () => {
            let amountToSplitInWei = 2 * Number(oneEther)
            return this.splitterInstance.splitFunds(recipient1, recipient1, { from: failAccount, value: amountToSplitInWei })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                })
        })

        it('Should revert when recipient1 account is 0x00', async () => {
            let amountToSplitInWei = 2 * Number(oneEther)
            return this.splitterInstance.splitFunds('0x00', recipient2, { from: failAccount, value: amountToSplitInWei })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                })
        })

        it('Should revert when recipient2 account is 0x00', async () => {
            let amountToSplitInWei = 2 * Number(oneEther)
            return this.splitterInstance.splitFunds(recipient1, '0x00', { from: failAccount, value: amountToSplitInWei })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                })
        })

        it('Should revert when contract pause by owner', async () => {
            let amountToSplitInWei = 2 * Number(oneEther)
            return this.splitterInstance.pause({ from: account0 })
                .then(async (txObject) => {
                    return this.splitterInstance.splitFunds(recipient1, recipient2, { from: failAccount, value: amountToSplitInWei })
                })
                .then(function (txObject) {
                    assert.equal(txObject.logs.length, 1, 'one event should have been triggered')
                })
        })
    })//Split functionality fail test cases

})

