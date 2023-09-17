const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

var configs = {
    showNonce: true,
    showNonceInterval: 50000, 
    showDifficulty: true,
    showAverageTime: true,
    autoAdjustDifficulty: true
};

class Transaction{
    constructor(fromAddress, toAddress, ammount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.ammount = ammount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.ammount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash=''){
        this.content = {};
        this.content.timestamp = timestamp;
        this.content.transactions = transactions;
        this.content.nonce = 0;
        this.content.previousHash = previousHash;
        
        this.hash = '';
    }

    calculateHash(){
        return SHA256(JSON.stringify(this.content)).toString();
    }

    mineBlock(difficulty){
        let startTime = new Date().getTime();
        
        this.content.difficultyMining = difficulty;
        do{
            this.content.nonce++;
            this.hash = this.calculateHash();

            if(configs.showNonce && this.content.nonce % configs.showNonceInterval == 0){
                console.log("Current nonce: " + this.content.nonce);
            }
        }while(this.hash.substring(0, difficulty) != Array(difficulty+1).join("0"));

        let endTime = new Date().getTime();

        console.log("Block mined: " + this.hash + " in " + ((endTime-startTime)/1000) + " seconds.");
    }

    hasValidTransactions(){
        for(const tx of this.content.transactions){
            if(!tx.isValid)
                return false;
        }

        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [];
        this.timeBetweenBlocks=2000;
        this.difficulty=4;
        this.createGenesisBlock();

        this.pedingTransacions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        let genesis = new Block(Date.now(), "Genesis Block", "0");
        console.log("Mining Genesis Block...");
        genesis.mineBlock(this.difficulty);
        this.chain.push(genesis);
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    adjustDifficulty(){
        let length = this.chain.length;
        if(length>=4){

            let averageTime = Date.now() - this.chain[length-1].content.timestamp;
            let difficulty = this.chain[length-1].content.difficultyMining;

            for(let i = length-1; i > length-4; i--){
                averageTime += (this.chain[i].content.timestamp - this.chain[i-1].content.timestamp);
                difficulty += this.chain[i-1].content.difficultyMining;
            }

            if(difficulty/4 != this.difficulty)
                return;
            
            averageTime = averageTime/4;
            
            if(configs.showAverageTime)
                console.log("\nMédia de tempo entre os 4 últimos blocos: " + averageTime);

            if(averageTime > this.timeBetweenBlocks * 1.33){
                this.difficulty--;
            }else if(averageTime < this.timeBetweenBlocks * 0.75){
                this.difficulty++;
            }
        }

    }

    minePendingTransactions(miningRewardAddress){
        const rewardTX = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pedingTransacions.push(rewardTX);


        let block = new Block(Date.now(), this.pedingTransacions, this.getLatestBlock().hash); 
        block.mineBlock(this.difficulty);

        this.chain.push(block);

        this.pedingTransacions = [];

        if(configs.autoAdjustDifficulty)
            this.adjustDifficulty();
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error("Cannot add invalid transaction to chain.")
        }

        this.pedingTransacions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;
        
        for(const block of this.chain){
            for(const transaction of block.content.transactions){
                if(transaction.fromAddress === address){
                    balance -= transaction.ammount;
                }

                if(transaction.toAddress === address){
                    balance += transaction.ammount;
                }
            }
        }

        return balance;
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){

            if(!this.chain[i].hasValidTransactions()){
                return false;
            }

            if(this.chain[i].content.previousHash != this.chain[i-1].calculateHash()){
                return false;
            }

            if(this.chain[i].hash != this.chain[i].calculateHash()){
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;