const SHA256 = require("crypto-js/sha256");

class Block{
    constructor(index, timestamp, data, previousHash=''){
        this.content = {};
        this.content.index = index;
        this.content.timestamp = timestamp;
        this.content.data = data;
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
    }

    createGenesisBlock(){
        let genesis = new Block(0, "01/01/2023", "Genesis Block", "0");
        console.log("Mining Genesis Block...");
        genesis.mineBlock(this.difficulty);
        this.chain.push(genesis);
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    addBlock(newBlock){
        newBlock.content.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
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

function testaConsistenciaBlockchain(){
    
    let myNewCoin = new Blockchain();
    
    console.log("Mining Block 1...");
    myNewCoin.addBlock( new Block(1, "02/02/2023", {ammount: 5} ));

    console.log("Mining Block 2...");
    myNewCoin.addBlock( new Block(2, "03/02/2023", {ammount: 10} ));

    console.log("Mining Block 3...");
    myNewCoin.addBlock( new Block(3, "04/02/2023", {ammount: 7} ));
    
    
    console.log(JSON.stringify(myNewCoin.chain, null, 4));
    console.log("A Blockchain é válida? " + myNewCoin.isChainValid());
    
    myNewCoin.chain[1].content.data = {amount: 50};
    myNewCoin.chain[1].hash = myNewCoin.chain[1].calculateHash();
    
    console.log("A Blockchain é válida? " + myNewCoin.isChainValid());
    console.log(JSON.stringify(myNewCoin.chain, null, 4));
}

testaConsistenciaBlockchain();