module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    //truffle migrate --network deveployment
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"//匹配所有的network id
    },
    //truffle migrate --network live
    live: {
      host: "127.0.0.1", //
      port: 7101,
      network_id: "*",   //本地以太坊私有链
      // optional config values:
      // gas
      // gasPrice
      // from - default address to use for any transaction Truffle makes during migrations
      // provider - web3 provider instance Truffle should use to talk to the Ethereum network.
      //          - function that returns a web3 provider instance (see below.)
      //          - if specified, host and port are ignored.
    }
  }
};
