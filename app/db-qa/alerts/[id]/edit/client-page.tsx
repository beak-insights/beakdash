"use client";

import React from "react";
import { AlertForm } from "@/components/db-qa/alert-form";

interface EditAlertClientProps {
  id: string;
}

export function EditAlertClient({ id }: EditAlertClientProps) {
  return <AlertForm alertId={id} isEdit={true} />;
}