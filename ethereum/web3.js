import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
  //Case we are in the browser

  //request for permision of using webmask
  window.ethereum.enable();
  //use the provider of the web3 that the metamask is using
  web3 = new Web3(window.web3.currentProvider);
} else {
  //Case we are on the server or we do not have
  const provider = new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/1e6c2fea7017446ab49b9b96c14ff9c3"
  );
  web3 = new Web3(provider);
}

export default web3;
