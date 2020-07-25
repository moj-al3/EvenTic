//import the connection provider of the user(metamask)
import web3 from "./web3";
//import the compiled data of the Event contract
import Event from "./build/Event.json";

export default (address) => {
  return new web3.eth.Contract(JSON.parse(Event.interface), address);
};
