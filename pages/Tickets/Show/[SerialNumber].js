import React, { Component } from "react";
import QRCode from "react-qr-code";
import Layout from "../../../components/Layout";
import { Grid, Segment, Label } from "semantic-ui-react";
class showTicket extends Component {
  static async getInitialProps(props) {
    //get valus from the Link Url
    return {
      SerialNumber: props.query.SerialNumber,
      Name: props.query.Name,
    };
  }

  render() {
    const { SerialNumber, Name } = this.props;
    return (
      <Layout>
        <Grid>
          <Grid.Row centered>
            <h2>{Name}</h2>
          </Grid.Row>
          <Grid.Row centered>
            <Segment padded>
              <Label attached="bottom" size="big">
                {SerialNumber}
              </Label>
              <QRCode value={SerialNumber} />
            </Segment>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default showTicket;
