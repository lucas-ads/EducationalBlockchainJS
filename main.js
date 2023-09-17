const SHA256 = require("crypto-js/sha256");

class Block{
    constructor(index, timestamp, data, previousHash=''){
        this.content = {};
        this.content.index = index;
        this.content.timestamp = timestamp;
        this.content.data = data;
        this.content.previousHash = previousHash;
        
        this.hash = '';
    }

    calculateHash(){
        return SHA256(JSON.stringify(this.content)).toString();
    }
}

class Blockchain{
    constructor(){
        this.chain = [];
        this.createGenesisBlock();
    }

    createGenesisBlock(){
        let genesis = new Block(0, "01/01/2023", "Genesis Block", "0");
        genesis.hash = genesis.calculateHash();
        this.chain.push(genesis);
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    addBlock(newBlock){
        newBlock.content.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
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
    
    myNewCoin.addBlock( new Block(1, "02/02/2023", {ammount: 5} ));
    myNewCoin.addBlock( new Block(2, "03/02/2023", {ammount: 10} ));
    myNewCoin.addBlock( new Block(3, "04/02/2023", {ammount: 7} ));
    
    
    console.log(JSON.stringify(myNewCoin.chain, null, 4));
    console.log("A Blockchain é válida? " + myNewCoin.isChainValid());
    
    myNewCoin.chain[1].content.data = {amount: 50};
    myNewCoin.chain[1].hash = myNewCoin.chain[1].calculateHash();
    
    console.log("A Blockchain é válida? " + myNewCoin.isChainValid());
    console.log(JSON.stringify(myNewCoin.chain, null, 4));
}

testaConsistenciaBlockchain();