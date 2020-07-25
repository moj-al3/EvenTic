import React, { Component } from "react";
import factory from "../ethereum/factory";
import { Card, Button, Icon } from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link } from "../routes";
import Event from "../ethereum/Event";
import web3 from "../ethereum/web3";
import Loader from "../components/Loader";
class EventIndex extends Component {
  state = {
    events: <Loader />, //show loading while the events are loading
    wallet: false, //tell if the user have a wallet app
    fluid: false, //tell if we need to make fluid Cards or not (small screens)
  };

  static async getInitialProps() {
    //get all adresses of the events
    const addresses = await factory.methods.getdeployedEvents().call();
    //get all events' details
    const events = await Promise.all(
      //make the array size smaller by 1 because we will skip the first event for invalid pointers
      Array(parseInt(addresses.length - 1))
        .fill()
        .map((element, index) => {
          const event = Event(addresses[index + 1]);
          return event.methods.getEventInfo().call();
        })
    );
    return { events: events, addresses: addresses };
  }

  renderEvents() {
    const items = this.props.events.map((event, index) => {
      return (
        //ٌRoute the Card to the Event
        <Link route={`/Events/${this.props.addresses[index + 1]}`}>
          <Card color="red" key={event[1]} fluid={this.state.fluid}>
            <Card.Content>
              <Card.Header color="red">{event[2]}</Card.Header>
              <Card.Meta>
                {this.parse(event[5]) + " - " + this.parse(event[6])}
              </Card.Meta>
              <Card.Description>
                <div>
                  <p>{event[3]}</p>
                </div>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <div style={{ marginBottom: "5px", color: "green" }}>
                <Icon name="ethereum" circular color="black" />
                {web3.utils.fromWei(event[9], "ether")} Ether
              </div>
              <div style={{ marginBottom: "5px", color: "black" }}>
                <Icon name="map marker" circular color="blue" />
                {event[4]}
              </div>
            </Card.Content>
          </Card>
        </Link>
      );
    });

    this.setState({ events: <Card.Group>{items}</Card.Group> });
  }

  async componentDidMount() {
    const fluid = await (window.innerWidth <= 767);
    this.setState({
      wallet:
        typeof window !== "undefined" && typeof window.web3 !== "undefined",
      fluid: fluid,
    });

    this.renderEvents();
  }

  render() {
    return (
      <Layout>
        <div>
          <h3>Upcomming Events</h3>
          {this.state.wallet ? (
            <Link route={`/New`}>
              <Button floated="right" icon="add circle" primary>
                Create New Event
              </Button>
            </Link>
          ) : null}
          {this.state.events}
        </div>
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
}

export default EventIndex;
