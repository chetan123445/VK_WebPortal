"use client";
import React from "react";
import { ThreadDetailContent } from "../../../student/discussion/[threadId]/page";

export default function AdminThreadDetailPage(props) {
  // Optionally, you can add admin-specific props or wrappers here
  return <ThreadDetailContent userType="Admin" {...props} />;
}