import React, { Component } from "react";
import { Button, Form, Input, Message } from "semantic-ui-react";
import Event from "../../../ethereum/Event";
import web3 from "../../../ethereum/web3";
import { Link, Router } from "../../../routes";
import Layout from "../../../components/Layout";

class EditEvent extends Component {
  state = {
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    numberofTickets: "",
    priceofTickets: "",
    Loading: false,
    errorMessage: "",
    isManager: false,
  };
  static async getInitialProps(props) {
    const event = Event(props.query.address);
    const summary = await event.methods.getEventInfo().call();

    return {
      address: props.query.address,
      Manager: summary[0],
      Name: summary[2],
      Description: summary[3],
      Location: summary[4],
      StartingDate: summary[5],
      EndingDate: summary[6],
      NumberofTickets: summary[7],
      NumberofsoldTickets: summary[8],
      PriceofTicket: summary[9],
      event: event,
    };
  }

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    this.setState({
      name: this.props.Name,
      description: this.props.Description,
      location: this.props.Location,
      numberofTickets: this.props.NumberofTickets,
      priceofTickets: web3.utils.fromWei(this.props.PriceofTicket, "ether"),
      isManager: this.props.Manager == accounts[0],
    });
  }

  onSubmit = async (event) => {
    const parse = (phrase) => {
      const parts = phrase.split("-");
      parts[1] = parseInt(parts[1]) - 1;
      return parts;
    };
    event.preventDefault();

    const {
      name,
      description,
      location,
      numberofTickets,
      priceofTickets,
    } = this.state;

    const startDate = parse(this.state.startDate);
    const endDate = parse(this.state.endDate);
    this.setState({ Loading: true, errorMessage: "" });
    try {
      if (!this.state.isManager)
        throw new Error("only the event manager can edit this event");
      if (new Date(this.state.startDate) <= new Date())
        throw new Error("Invalid Starting Date");
      if (new Date(this.state.endDate) < new Date(this.state.startDate))
        throw new Error("Invalid Ending Date");
      if (parseInt(this.state.numberofTickets) < parseInt(this.props.NumberofsoldTickets))
        throw new Error(
          "The new number of tickets is less than the number of solds  (" +
            this.state.numberofTickets +
            "<" +
            this.props.NumberofsoldTickets +
            ")"
        );
      const accounts = await web3.eth.getAccounts();
      const e = Event(this.props.address);
      await e.methods
        .editEvent(
          name,
          description,
          location,
          Date.UTC(startDate[0], startDate[1], startDate[2]) / 1000,
          Date.UTC(endDate[0], endDate[1], endDate[2]) / 1000,
          numberofTickets,
          web3.utils.toWei(priceofTickets, "ether")
        )
        .send({ from: accounts[0] });

      Router.replaceRoute(`/events/${this.props.address}`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ Loading: false });
  };

  render() {
    return (
      <Layout>
        <Link route={`/events/${this.props.address}`}>
          <a>Back</a>
        </Link>
        <h3>Edit Event</h3>
        {!this.state.isManager ? (
          <Message
            error
            content="only the event manager can edit this event"
          ></Message>
        ) : new Date(this.props.StartingDate * 1000) <= new Date() ? (
          <Message
            error
            content="You Can not edit this event because it has been already started"
          ></Message>
        ) : (
          <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
            <Form.Field required>
              <label>Name</label>
              <Input
                required={true}
                value={this.state.name}
                onChange={(event) =>
                  this.setState({ name: event.target.value })
                }
              />
            </Form.Field>
            <Form.Field required>
              <label>Description</label>
              <Input
                required={true}
                value={this.state.description}
                onChange={(event) =>
                  this.setState({ description: event.target.value })
                }
              />
            </Form.Field>
            <Form.Field required>
              <label>Location</label>
              <Input
                required={true}
                value={this.state.location}
                onChange={(event) =>
                  this.setState({ location: event.target.value })
                }
              />
            </Form.Field>
            <Form.Field
              required
              label="Starting Date"
              control="input"
              type="date"
              value={this.state.startDate}
              onChange={(event) =>
                this.setState({ startDate: event.target.value })
              }
              error={new Date(this.state.startDate) <= new Date()}
            />
            <Form.Field
              required
              label="Ending Date"
              control="input"
              type="date"
              value={this.state.endDate}
              onChange={(event) =>
                this.setState({ endDate: event.target.value })
              }
              error={
                new Date(this.state.endDate) < new Date(this.state.startDate)
              }
            />
            <Form.Field required>
              <label>Number of Tickets</label>
              <Input
                required={true}
                value={this.state.numberofTickets}
                onChange={(event) => {
                  this.setState({ numberofTickets: event.target.value });
                }}
              />
            </Form.Field>
            <Form.Field required>
              <label>Price of Ticket</label>
              <Input
                required={true}
                label={{ basic: true, content: "Ether" }}
                labelPosition="right"
                value={this.state.priceofTickets}
                onChange={(event) =>
                  this.setState({ priceofTickets: event.target.value })
                }
              />
            </Form.Field>
            <Message
              error
              header="Opps!"
              content={this.state.errorMessage}
            ></Message>
            <Button primary loading={this.state.Loading}>
              Submit
            </Button>
          </Form>
        )}
      </Layout>
    );
  }
}

export default EditEvent;
