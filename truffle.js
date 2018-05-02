module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    private: {
      host: "localhost",
      port: 8545,
      network_id: "4224", // Private network id
      gas: 4700000
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: "3", // Ropsten network id
      gas: 4700000
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "4", // Ropsten network id
      gas: 47000000
    }
  }
};
