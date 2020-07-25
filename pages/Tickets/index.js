import React, { Component } from "react";
import visitors from "../../ethereum/visitors";
import { Table, Message } from "semantic-ui-react";
import Layout from "../../components/Layout";
import Event from "../../ethereum/Event";
import web3 from "../../ethereum/web3";
import TicketRow from "../../components/TicketRow";
import Loader from "../../components/Loader";
import { Link } from "../../routes";
class TicketIndex extends Component {
  state = {
    rows: "",
    wallet: false, //tell if the user have a wallet app
    rendering: 1, //tell if rows are still rendering
  };

  async componentDidMount() {
    //check if there is any wallet app
    this.setState({
      wallet:
        typeof window !== "undefined" && typeof window.web3 !== "undefined",
    });

    const SerialNumbers = await this.getSerialNumbers();
    
    const rows = await Promise.all(
      Array(parseInt(SerialNumbers.length))
        .fill()
        .map(async (element, index) => {
          
           //skip the first ticket(0) because it is only for invalid pointers
          if(index==0)return;
          
          const eventaddress = await visitors.methods
            .getTicketEvent(SerialNumbers[index])
            .call();
            if(eventaddress=="0x0000000000000000000000000000000000000000")return;  
          const event = Event(eventaddress);
          const ticket = await event.methods
            .getTicketInfo(SerialNumbers[index])
            .call();
          return (
            <TicketRow
              key={ticket[1]}
              Name={await event.methods.Name().call()}
              event={event}
              ticket={ticket}
              eventaddress={eventaddress}
              SerialNumber={SerialNumbers[index]}
              StartDate={await event.methods.StartDate().call()}
            />
          );
        })
    );
    //return the rows and set rendering status to 0
    this.setState({ rows, rendering: 0 });
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;
    return (
      <Layout>
        <div>
          <h3>My Tickets</h3>
          {this.state.wallet ? (
            this.state.rendering ? (
              <Loader />
            ) : (
              <Table striped>
                <Header>
                  <Row>
                    <HeaderCell>Event Name</HeaderCell>
                    <HeaderCell>Status</HeaderCell>
                    <HeaderCell></HeaderCell>
                    <HeaderCell></HeaderCell>
                    <HeaderCell></HeaderCell>
                  </Row>
                </Header>
                <Body>{this.state.rows}</Body>
              </Table>
            )
          ) : (
            <Message
              error
              header="You must have a wallet account to check your tickets!!"
              content={<Link route={`/getWallet`}><a>Learn More</a></Link>}
            ></Message>
          )}
        </div>
      </Layout>
    );
  }

  getSerialNumbers = async () => {
    const accounts = await web3.eth.getAccounts();
    return await visitors.methods.getTickets().call({ from: accounts[0] });
  };
}

export default TicketIndex;
