import React from "react";
import Header from "./Header";
import Head from "next/head";
import { Container } from "semantic-ui-react";
export default (props) => {
  return (
    <Container >
      <Head>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"></meta>
        <style>{"*{font-family:Times New Roman;}"}</style>
      </Head>
      <Header />
      {props.children}

      <footer>
        <hr
          style={{
            marginTop: "25px",
          }}
        ></hr>
        <div
          style={{
            textAlign: "center",
            fontSize:"20px"
          }}
        >
          EventTic@2020
        </div>
      </footer>
    </Container>
  );
};
