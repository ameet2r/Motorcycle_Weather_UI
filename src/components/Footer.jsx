import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Footer() {
  return (
    <AppBar position="static" component="footer">
      <Toolbar>
        <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'center' }}>
          Weather retrieval by location only valid for the Continental U.S., Alaska, Hawaii, Puerto Rico & U.S. Virgin Islands, Guam & the Northern Mariana Islands, and American Samoa.
        </Typography>
      </Toolbar>
    </AppBar>
  );
}