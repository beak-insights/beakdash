"use client";

import React from "react";
import { AlertForm } from "@/components/db-qa/alert-form";

export function NewAlertClient() {
  return <AlertForm isEdit={false} />;
}