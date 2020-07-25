//import the connection provider of the user(metamask)
import web3 from "./web3";
//import the compiled data of the Visitors contract
import Visitors from "./build/Visitor.json";
import Addresses from "./adresses.json";
const instance = new web3.eth.Contract(
  JSON.parse(Visitors.interface),
  Addresses.Visitor
);


export default instance;
