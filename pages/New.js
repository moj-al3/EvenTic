import React, { Component } from "react";
import { Button, Form, Input, Message } from "semantic-ui-react";
import factory from "../ethereum/factory";
import web3 from "../ethereum/web3";
import { Link, Router } from "../routes";
import Layout from "../components/Layout";

class Index extends Component {
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
  };

  onSubmit = async (x) => {
    const parse = (phrase) => {
      const parts = phrase.split("-");
      parts[1] = parseInt(parts[1]) - 1;
      return parts;
    };

    //factory
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
      if (new Date(this.state.startDate) <= new Date())
        throw "Invalid Starting Date";
      if (new Date(this.state.endDate) < new Date(this.state.startDate))
        throw "Invalid Ending Date";

      const accounts = await web3.eth.getAccounts();
      await factory.methods
        .createEvent(
          name,
          description,
          location,
          Date.UTC(startDate[0], startDate[1], startDate[2]) / 1000,
          Date.UTC(endDate[0], endDate[1], endDate[2]) / 1000,
          numberofTickets,
          web3.utils.toWei(priceofTickets, "ether")
        )
        .send({ from: accounts[0] });

      Router.replaceRoute(`/`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ Loading: false, value: "" });
  };

  render() {
    return (
      <Layout>
        <Link route={`/`}>
          <a>Back</a>
        </Link>
        <h3>Create an Event</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field required>
            <label>Name</label>
            <Input
              required={true}
              value={this.state.name}
              onChange={(event) => this.setState({ name: event.target.value })}
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
            onChange={(event) => this.setState({ endDate: event.target.value })}
            error={
              new Date(this.state.endDate) < new Date(this.state.startDate)
            }
          />
          <Form.Field required>
            <label>Number of Tickets</label>
            <Input
              required={true}
              value={this.state.numberofTickets}
              onChange={(event) =>
                this.setState({ numberofTickets: event.target.value })
              }
              error={{
                content: "Please enter a valid email address",
                pointing: "below",
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
            Create!
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default Index;
