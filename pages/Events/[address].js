import React, { Component } from "react";

import Layout from "../../components/Layout";
import Event from "../../ethereum/Event";
import { Card, Grid, Button, Icon, Message } from "semantic-ui-react";
import web3 from "../../ethereum/web3";
import { Link, Router } from "../../routes";
import Loader from "../../components/Loader";

class CampaignShow extends Component {
  state = {
    Buymessage: "",
    loading: false,
    er: false,
    wallet: false,
    eventStatus: false,
    offers: <Loader />,
    isManager: false,
  };
  static async getInitialProps(props) {
    const event = Event(props.query.address);
    const summary = await event.methods.getEventInfo().call();
    //Load Tickets
    const Tickets = await Promise.all(
      Array(parseInt(summary[8]))
        .fill()
        .map(async (element, index) => {
          return await event.methods.tickets(index + 1).call();
        })
    );

    return {
      address: props.query.address,
      Manager: summary[0],
      ID: summary[1],
      Name: summary[2],
      Description: summary[3],
      Location: summary[4],
      StartingDate: summary[5],
      EndingDate: summary[6],
      NumberofTickets: summary[7],
      NumberofsoldTickets: summary[8],
      PriceofTicket: summary[9],
      event: event,
      Tickets: Tickets,
    };
  }

  async componentDidMount() {
    this.renderOffers();
    const accounts = await web3.eth.getAccounts();

    const { StartingDate, EndingDate } = this.props;
    this.setState({
      wallet:
        typeof window !== "undefined" && typeof window.web3 !== "undefined",
      isManager: this.props.Manager == accounts[0],
      eventStatus: new Date() <= new Date(EndingDate * 1000),
    });
  }

  async renderOffers() {
    const items = this.props.Tickets.map((ticket) => {
      return {
        style: { display: ticket[2] == 2 ? "" : "none" },
        color: "grey",
        key: ticket[1],
        header: (
          <p>
            Price:
            {" " + web3.utils.fromWei(ticket[3], "ether")} Ether
          </p>
        ),
        extra: (
          <div>
            <Button
              loading={this.state.loading}
              color="green"
              onClick={this.Buyfromseller.bind(this, ticket)}
              fluid
            >
              Buy
            </Button>
          </div>
        ),
        description: <p>Seller: {ticket[0].substring(0, 10) + "....."} </p>,
      };
    });

    this.setState({ offers: <Card.Group items={items} /> });
  }

  renderCards() {
    const { Location, StartingDate, EndingDate, PriceofTicket } = this.props;

    const items = [
      {
        header: (
          <b>
            <Icon name="calendar alternate" circular />
            Date
          </b>
        ),
        description: this.parse(StartingDate) + "-" + this.parse(EndingDate),
        style: { overflowWrap: "break-word" },
      },
      {
        header: (
          <b>
            <Icon name="map marker" circular color="blue" />
            Location
          </b>
        ),

        description: Location,
        style: { overflowWrap: "break-word" },
      },
      {
        header: (
          <b>
            <Icon name="ethereum" circular color="black" />
            Price
          </b>
        ),

        description: <p>{web3.utils.fromWei(PriceofTicket, "ether")} Ether</p>,
        style: { overflowWrap: "break-word" },
      },
    ];
    return <Card.Group centered items={items} />;
  }

  render() {
    const { Row, Column } = Grid;
    var {
      eventStatus,
      wallet,
      isManager,
      loading,
      Buymessage,
      er,
      offers,
    } = this.state;
    const {
      StartingDate,
      Description,
      NumberofTickets,
      NumberofsoldTickets,
      address,
      ID,
      Name,
    } = this.props;

    return (
      <Layout>
        {wallet && !(new Date(StartingDate * 1000) <= new Date()) ? (
          <Column width={14}>
            <Link route={`/events/Edit/${address}`}>
              <Button floated="right">Edit</Button>
            </Link>
          </Column>
        ) : null}

        {isManager && eventStatus ? (
          <Column>
            <Link route={`/CheckIn/${ID}`}>
              <Button primary>Check-In</Button>
            </Link>
          </Column>
        ) : null}

        {!wallet ? (
          <Message error header="You must have a wallet to buy a ticket!!" />
        ) : !eventStatus ? (
          <Message error header="This event already finished" />
        ) : null}

        <h3>{Name}</h3>
        <div>
          <p
            style={{
              textAlign: "center",
              fontSize: "25px",
            }}
          >
            {Description}
          </p>
        </div>
        <Grid>
          <Row></Row>
          <Row centered>
            <Column>{this.renderCards()}</Column>
          </Row>
          <Row centered>
            <Message
              hidden={parseInt(NumberofTickets) > parseInt(NumberofsoldTickets)}
              error
              header="Sorry Tickets are out of stocks"
            ></Message>
            <Message
              hidden={!Buymessage}
              error={er}
              color={er ? "red" : "green"}
              content={Buymessage}
            ></Message>
          </Row>
          <Row centered>
            {wallet && eventStatus ? (
              <Column width={1}>
                <Button
                  primary
                  loading={loading}
                  disabled={
                    parseInt(NumberofTickets) <= parseInt(NumberofsoldTickets)
                  }
                  onClick={this.Buy}
                >
                  Buy
                </Button>
              </Column>
            ) : null}
          </Row>
        </Grid>
        {wallet && eventStatus ? (
          <Grid>
            <h3>Other Offers</h3>
            <Row>
              <Column>{offers}</Column>
            </Row>
          </Grid>
        ) : null}
      </Layout>
    );
  }
  //Method to parse the data and format it
  parse = (S) => {
    var date = new Date(S * 1000);
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    date = dd + "/" + mm + "/" + yyyy;
    return date;
  };

  //method to buy ticket from the event owner
  Buy = async () => {
    const { PriceofTicket } = this.props;
    const event = Event(this.props.address);
    this.setState({ loading: true, Buymessage: "" });
    try {
      const accounts = await web3.eth.getAccounts();
      await event.methods.Buy().send({
        from: accounts[0],
        value: PriceofTicket,
      });
      this.setState({
        Buymessage: "Ticket have been purchased successfully",
        er: false,
      });
      Router.replaceRoute(`/`);
    } catch (err) {
      this.setState({
        Buymessage: err.message,
        er: true,
      });
    }
    this.setState({ loading: false });
  };

  //method to buy ticket from other sellers
  Buyfromseller = async (ticket) => {
    const PriceofTicket = ticket[3];
    const event = Event(this.props.address);
    this.setState({ loading: true, Buymessage: "" });
    try {
      const accounts = await web3.eth.getAccounts();
      await event.methods.Buy(ticket[4]).send({
        from: accounts[0],
        value: PriceofTicket,
      });
      this.setState({
        Buymessage: "Ticket have been purchased successfully",
        er: false,
      });
      Router.replaceRoute(`/`);
    } catch (err) {
      this.setState({
        Buymessage: err.message,
        er: true,
      });
    }
    this.setState({ loading: false });
  };
}

export default CampaignShow;
