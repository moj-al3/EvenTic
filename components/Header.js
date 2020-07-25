import React from "react";
import { Menu } from "semantic-ui-react";
import { Link } from "../routes";
export default (props) => {
  return (
    <Menu
      style={{
        marginTop: "10px",
      }}
    >
      <Menu.Item>
        <Link route="/">EventTic</Link>
      </Menu.Item>
      <Menu.Item position="right">
        <Link route="/Tickets">My Tickets</Link>
      </Menu.Item>
    </Menu>
  );
};
