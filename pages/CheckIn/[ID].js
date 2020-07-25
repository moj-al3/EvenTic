import React, { Component } from "react";
import {
  Button,
  Image,
  Input,
  Grid,
  Segment,
  Label,
  Message,
} from "semantic-ui-react";
import QrcodeDecoder from "qrcode-decoder";
import Layout from "../../components/Layout";
import factory from "../../ethereum/factory";
import Event from "../../ethereum/Event";
import { Router } from "../../routes";
import axios from "axios";
class CheckIn extends Component {
  static async getInitialProps(props) {
    try {
      const address = await factory.methods
        .getcodeEventaddress(props.query.ID)
        .call();
      const event = Event(address);
      const Name = await event.methods.Name().call();

      return {
        address: address,
        event: event,
        Name: Name,
        error: false,
      };
    } catch (err) {
      console.log(err);
    }
    return { error: true };
  }
  state = {
    err: "",
    loading: false,
    show: false,
    SerialNumber: "",
    qr: null,
    status: "",
  };

  async componentDidMount() {
    if (this.props.error) Router.replaceRoute(`/Error`);
    const qr = new QrcodeDecoder();
    var VideoConstraints = {
      audio: false,
      video: {
        width: 300,
        height: 350,
        facingMode: { exact: "environment" },
      },
    };
    qr.videoConstraints = VideoConstraints;
    this.setState({ qr: qr });
  }

  swap = () => {
    this.setState({ show: this.state.show ? false : true });
  };

  cancel = () => {
    this.state.qr.stop();
    this.swap();
  };

  scan = async () => {
    this.swap();
    try {
      const video = await document.getElementsByTagName("video");
      var code = await this.state.qr.decodeFromCamera(video[0]);
      this.setState({ SerialNumber: code.data });
    } catch (e) {
      this.setState({
        err:
          "this device does not meet the minimum requirements for this feature",
      });
    }
    this.swap();
    this.checkin();
  };

  checkin = async () => {
    this.setState({ loading: true, err: "" });
    try {
      const event = Event(this.props.address);
      let ID = await event.methods.check_in(this.state.SerialNumber).call();
      this.setState({ status: ID });
      if (ID != "0") {
        ID = await this.checkDatabase(ID);
        this.setState({ status: ID });
      }
      
    } catch (e) {
      this.setState({ err: e.message });
      console.log(this.state.err);
    }
    this.setState({ loading: false });
  };

  checkDatabase = async (ID) => {
    try {
      let result = await axios.get(
        `/api/checkInticket?ID=${ID}&address=${this.props.address}`
      );
      return result.data.id;
    } catch (error) {
      this.setState({ err: error.message});
    }
    return 0;
  };

  render() {
    return (
      <Layout>
        {!!this.state.err ? (
          <Message error content={this.state.err}></Message>
        ) : null}
        <h1>{this.props.Name}</h1>

        {this.state.show ? (
          <Grid>
            <Grid.Row centered>
              <video autoPlay playsInline></video>
            </Grid.Row>
            <Grid.Row centered>
              <Grid.Column>
                <Button size="large" onClick={this.cancel} fluid color="red">
                  Cancel Scanning
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        ) : (
          <Grid>
            {!this.state.status ? null : (
              <Grid.Row>
                <Grid.Column>
                  <Segment
                    style={{ textAlign: "center" }}
                    inverted
                    color={
                      this.state.status == "0"
                        ? "red"
                        : this.state.status == "-1"
                        ? "green"
                        : "grey"
                    }
                  >
                    {this.state.status == "0"
                      ? "Invalid Ticket"
                      : this.state.status == "-1"
                      ? "Valid Ticket"
                      : "Checking The local DataBase....."}
                  </Segment>
                </Grid.Column>
              </Grid.Row>
            )}
            <Grid.Row centered>
              <Segment onClick={this.scan} padded>
                <Label attached="bottom" size="massive">
                  Click To Scan
                </Label>
                <Image
                  src="https://images-na.ssl-images-amazon.com/images/I/21RzQRzKpRL.png"
                  size="medium"
                  wrapped
                />
              </Segment>
            </Grid.Row>
            <Grid.Row centered>
              <Grid.Column>
                <Input
                  value={this.state.SerialNumber}
                  onChange={(event) =>
                    this.setState({
                      SerialNumber: event.target.value,
                      status: "",
                      err: "",
                    })
                  }
                  type="tel"
                  placeholder="SerialNumber"
                  fluid
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row centered>
              <Button
                size="large"
                loading={this.state.loading}
                onClick={this.checkin}
                primary
              >
                Submit
              </Button>
            </Grid.Row>
          </Grid>
        )}
      </Layout>
    );
  }
}

export default CheckIn;
/*




*/
