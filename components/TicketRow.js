import React, { Component } from "react";
import { Table, Button, Input, Message } from "semantic-ui-react";
import web3 from "../ethereum/web3";
import { Router } from "../routes";
import { Link } from "../routes";
import axios from "axios";
class RequestRow extends Component {
  state = {
    price: "",
    loading: false,
    ErrorMessage: "",
    Ticketstatus: 1,
    rendering: 1,
  };

  async componentDidMount() {
    const { ticket } = this.props;
    //check the ticket status in the database
    const Ticketstatus = await this.checkDatabase(ticket[1]);

    //if the DBstatus state the ticket was used then let it override the current status
    this.setState({
      Ticketstatus: Ticketstatus == 0 ? Ticketstatus : ticket[2],
      rendering: 0,
    });
  }

  render() {
    const { Row, Cell } = Table;
    const { Name, eventaddress, ticket, SerialNumber, StartDate } = this.props;

    //this boolean to check if the user can resell the ticket
    var { Ticketstatus } = this.state;

    return (
      //disable the row if the status of the ticket was invalid
      <Row error={Ticketstatus == 0}>
        <Cell>
          <Link route={`/Events/${eventaddress}`}>
            <a style={{ marginTop: "30px", marginRight: "10px" }}>{Name}</a>
          </Link>
        </Cell>
        <Cell>{this.getstatus(Ticketstatus)}</Cell>
        <Cell>
          {
            //if the status of the ticket is InMarket then show the (Cancel Selling) button
            this.getstatus(Ticketstatus) == "InMarket" ? (
              <Button
                loading={this.state.loading}
                onClick={this.cancel}
                color="red"
              >
                Cancel Selling
              </Button>
            ) : //if the status of the ticket is valid then show the (Show) button
            this.getstatus(Ticketstatus) == "Valid" ? (
              <Link route={`/Tickets/Show/${SerialNumber}?Name=${Name}`}>
                <a>
                  <Button color="teal">Show Ticket</Button>
                </a>
              </Link>
            ) : //otherwise do not show any of the above buttons
            null
          }
        </Cell>
        {
          //if the status of the ticket is valid then show the (re-sell) button
          this.getstatus(Ticketstatus) == "Valid" ? (
            <Cell>
              <Input
                size="mini"
                action={{
                  loading: this.state.loading,
                  color: "blue",
                  content: "re-sell",
                  onClick: this.Trade,
                }}
                value={this.state.price}
                onChange={(event) =>
                  this.setState({ price: event.target.value })
                }
                //maxLength="2"
                icon="ethereum"
                iconPosition="left"
                placeholder="Price"
              />
            </Cell>
          ) : (
            <Cell></Cell>
          )
        }
        <Cell>
          <Message
            hidden={!this.state.ErrorMessage}
            error
            header={this.state.ErrorMessage}
          ></Message>
        </Cell>
      </Row>
    );
  }

  //this method for canceling the request for selling
  cancel = async () => {
    const { event, SerialNumber } = this.props;
    //set the loading status true and clear errormessage if there was any
    this.setState({ loading: true, ErrorMessage: "" });
    try {
      const accounts = await web3.eth.getAccounts();
      await event.methods.cancel(SerialNumber).send({ from: accounts[0] });
      Router.replaceRoute(`/`);
    } catch (err) {
      //if there was any error output it to the Error Message
      this.setState({ ErrorMessage: err.message });
    }
    //set the loading status to false
    this.setState({ loading: false });
  };

  //this method to request for selling
  Trade = async () => {
    const { event, SerialNumber } = this.props;
    //set the loading status to true and clear errormessage if there was any
    this.setState({ loading: true, ErrorMessage: "" });
    try {
      const accounts = await web3.eth.getAccounts();
      await event.methods
        .Trade(SerialNumber, web3.utils.toWei(this.state.price, "ether"))
        .send({ from: accounts[0] });
      Router.replaceRoute(`/`);
    } catch (err) {
      //if there was any error output it to the Error Message
      this.setState({ ErrorMessage: err.message });
    }
    //reset the status to loading to false
    this.setState({ loading: false, value: "" });
  };
  //this method to get hte status of the ticket
  getstatus = (code) => {
    if (this.state.rendering == 1) return "Loading";
    if (code == 0) return "Invalid";
    if (code == 1) return "Valid";
    if (code == 2) return "InMarket";
  };

  //this method to check the status of the ticket in the external database
  checkDatabase = async (ID) => {
    let res = 0;
    try {
      //request to the database will be made through axios call
      let result = await axios.get(
        `/api/checkticket?ID=${ID}&address=${this.props.eventaddress}`
      );
      res = result.data.id;
    } catch (error) {
      //if there was any error output it to the Error Message
      this.setState({ ErrorMessage: error.message });
    }
    //there returend value will be 0 for invalid and -1 for valid
    return res;
  };
}

export default RequestRow;
