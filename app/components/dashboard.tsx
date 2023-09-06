"use client";

import React, { useState } from "react";
import Input from "./input";

function dashboard() {
  const [landingPageUrl, setLandingPageUrl] = useState("");

  return (
    <Input
      label="Your landing page:"
      placeholder="trigger.dev"
      onChange={setLandingPageUrl}
      type="url"
      required
      clearable
    />
  );
}

export default dashboard;
