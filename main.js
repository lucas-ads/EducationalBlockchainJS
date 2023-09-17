const SHA256 = require("crypto-js/sha256");

class Transaction{
    constructor(fromAddress, toAddress, ammount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.ammount = ammount;
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
        
        do{
            this.content.nonce++;
            this.hash = this.calculateHash();
        }while(this.hash.substring(0, difficulty) != Array(difficulty+1).join("0"));

        let endTime = new Date().getTime();

        console.log("Block mined: " + this.hash + " in " + ((endTime-startTime)/1000) + " seconds.");
    }
}

class Blockchain{
    constructor(){
        this.chain = [];
        this.difficulty=2;
        this.createGenesisBlock();

        this.pedingTransacions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        let genesis = new Block("01/01/2023", "Genesis Block", "0");
        console.log("Mining Genesis Block...");
        genesis.mineBlock(this.difficulty);
        this.chain.push(genesis);
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pedingTransacions, this.getLatestBlock().hash); 
        block.mineBlock(this.difficulty);

        this.chain.push(block);

        this.pedingTransacions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction){
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

function testaBlockchainComTransacoes(){
    let myNewCoin = new Blockchain();

    myNewCoin.createTransaction(new Transaction('address1', 'address2', 100));
    myNewCoin.createTransaction(new Transaction('address2', 'address1', 50));

    console.log("\n Starting the miner...");
    myNewCoin.minePendingTransactions('xaviers-address');

    console.log("\n Balance of xavier is ", myNewCoin.getBalanceOfAddress('xaviers-address'));
    console.log("\n Balance of address1 is ", myNewCoin.getBalanceOfAddress('address1'));
    console.log("\n Balance of address2 is ", myNewCoin.getBalanceOfAddress('address2'));

    console.log("\n Starting the miner again...");
    myNewCoin.minePendingTransactions('xaviers-address');

    console.log("\n Balance of xavier is ", myNewCoin.getBalanceOfAddress('xaviers-address'));

    console.log(JSON.stringify(myNewCoin.chain, null, 4));
}

testaBlockchainComTransacoes();

//#######################################################

function testaConsistenciaBlockchain(){
    
    let myNewCoin = new Blockchain();
    
    console.log("Mining Block 1...");
    myNewCoin.addBlock( new Block("02/02/2023", {ammount: 5} ));

    console.log("Mining Block 2...");
    myNewCoin.addBlock( new Block("03/02/2023", {ammount: 10} ));

    console.log("Mining Block 3...");
    myNewCoin.addBlock( new Block("04/02/2023", {ammount: 7} ));
    
    
    console.log(JSON.stringify(myNewCoin.chain, null, 4));
    console.log("A Blockchain é válida? " + myNewCoin.isChainValid());
    
    myNewCoin.chain[1].content.data = {amount: 50};
    myNewCoin.chain[1].hash = myNewCoin.chain[1].calculateHash();
    
    console.log("A Blockchain é válida? " + myNewCoin.isChainValid());
    console.log(JSON.stringify(myNewCoin.chain, null, 4));
}

//testaConsistenciaBlockchain();