//import the connection provider of the user(metamask)
import web3 from "./web3.js";
//import the compiled data of the EvenTic contract
import EvenTic from "./build/EventTic.json";
import Addresses from "./adresses.json";

const instance = new web3.eth.Contract(
  JSON.parse(EvenTic.interface),
  Addresses.EventTic
);

export default instance;
