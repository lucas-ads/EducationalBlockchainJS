const SHA256 = require("crypto-js/sha256");

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
        let block = new Block(Date.now(), this.pedingTransacions, this.getLatestBlock().hash); 
        block.mineBlock(this.difficulty);

        this.chain.push(block);

        this.pedingTransacions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];

        if(configs.autoAdjustDifficulty)
            this.adjustDifficulty();
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

function testaMineracaoContinua(timeBetweenBlocks){
    let myNewCoin = new Blockchain();
    myNewCoin.timeBetweenBlocks = timeBetweenBlocks;

    while(1){
        if(configs.showDifficulty)
            console.log("Current difficulty: " + myNewCoin.difficulty);
        myNewCoin.minePendingTransactions('xaviers-address');
        console.log();
    }
}

testaMineracaoContinua(10000);


//######################################################

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
//testaBlockchainComTransacoes();

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