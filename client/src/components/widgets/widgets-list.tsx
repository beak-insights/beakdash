import React from "react";
import { Widget } from "@shared/schema";
import WidgetCard from "./widget-card";

interface WidgetsListProps {
  widgets: Widget[];
  onEdit: (widget: Widget) => void;
  onDelete: (widgetId: number) => void;
  onSaveAsTemplate: (widget: Widget) => void;
  onAddToDashboard: (widget: Widget) => void;
  isTemplate?: boolean;
}

export default function WidgetsList({
  widgets,
  onEdit,
  onDelete,
  onSaveAsTemplate,
  onAddToDashboard,
  isTemplate = false,
}: WidgetsListProps) {
  if (!widgets || widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-medium mb-2">No widgets found</h3>
        <p className="text-muted-foreground mb-4">
          {isTemplate 
            ? "No template widgets available. Save widgets as templates to reuse them."
            : "No widgets available for this dashboard. Create a new widget to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {widgets.map((widget) => (
        <WidgetCard
          key={widget.id}
          widget={widget}
          onEdit={() => onEdit(widget)}
          onDelete={() => onDelete(widget.id)}
          onSaveAsTemplate={() => onSaveAsTemplate(widget)}
          onAddToDashboard={() => onAddToDashboard(widget)}
          isTemplate={isTemplate}
          showControls={true}
        />
      ))}
    </div>
  );
}