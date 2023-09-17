const{Blockchain, Transaction} = require('./main');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('5e7548d24e2140fd4a86b2cf10599843d26cdc1d6cbb8f8c2b9721bdab1820a2');
const myWalletAddres = myKey.getPublic('hex');

const otherKey = ec.genKeyPair();
const otherWalletAddres = otherKey.getPublic('hex');

function testaMineracaoContinuaComTransacao(timeBetweenBlocks){
    let myNewCoin = new Blockchain();
    myNewCoin.timeBetweenBlocks = timeBetweenBlocks;

    const tx1 = new Transaction(myWalletAddres, otherWalletAddres, 10);
    tx1.signTransaction(myKey);
    myNewCoin.addTransaction(tx1);

    while(1){
        console.log("Current difficulty: " + myNewCoin.difficulty);
        
        myNewCoin.minePendingTransactions(myWalletAddres);
        console.log("\n My balance is ", myNewCoin.getBalanceOfAddress(myWalletAddres));
        console.log("Is chain valid? " + myNewCoin.isChainValid());
        console.log(JSON.stringify(myNewCoin.getLatestBlock(), null, 4));
        console.log();
    }
}

testaMineracaoContinuaComTransacao(10000);


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