import React from "react";
import { Widget } from "@schema";
import WidgetCard from "@/components/widgets/widget-card";

interface WidgetsListProps {
  widgets: Widget[];
  onEdit: (widget: Widget) => void;
  onDelete: (widgetId: number) => void;
  onSaveAsTemplate: (widget: Widget) => void;
  onAddToDashboard: (widget: Widget) => void;
  onShareWidget?: (widget: Widget) => void;
  onOpenCopilot?: (widget: Widget) => void;
  isTemplate?: boolean;
}

export default function WidgetsList({
  widgets,
  onEdit,
  onDelete,
  onSaveAsTemplate,
  onAddToDashboard,
  onShareWidget,
  onOpenCopilot,
  isTemplate = false,
}: WidgetsListProps) {
  if (!widgets.length) {
    return (
      <div className="p-8 text-center bg-muted/40 rounded-md">
        <p className="text-muted-foreground mb-2">
          {isTemplate
            ? "No widget templates found. Save widgets as templates to reuse them across dashboards."
            : "No widgets found. Create a widget to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget) => (
        <WidgetCard
          key={widget.id}
          widget={widget}
          onEdit={() => onEdit(widget)}
          onDelete={() => onDelete(widget.id)}
          onSaveAsTemplate={() => onSaveAsTemplate(widget)}
          onAddToDashboard={() => onAddToDashboard(widget)}
          onShareWidget={onShareWidget ? () => onShareWidget(widget) : undefined}
          onOpenCopilot={onOpenCopilot ? () => onOpenCopilot(widget) : undefined}
          showControls={true}
          isTemplate={isTemplate}
        />
      ))}
    </div>
  );
}