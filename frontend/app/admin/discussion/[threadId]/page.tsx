"use client";
import React from "react";
import ThreadDetailContent from "../../../../components/ThreadDetailContent";

export default function AdminThreadDetailPage(props: any) {
  return <ThreadDetailContent userType="Admin" {...props} />;
}