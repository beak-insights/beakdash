import { Widget } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Copy, Database, LayoutTemplate } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WidgetsListProps {
  widgets: Widget[];
  onEdit: (widget: Widget) => void;
  onDelete: (widgetId: number) => void;
  onSaveAsTemplate: (widget: Widget) => void;
  onAddToDashboard: (widget: Widget) => void;
}

export default function WidgetsList({
  widgets,
  onEdit,
  onDelete,
  onSaveAsTemplate,
  onAddToDashboard,
}: WidgetsListProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dashboard</TableHead>
            <TableHead>Dataset</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {widgets.map((widget) => (
            <TableRow key={widget.id}>
              <TableCell className="font-medium">
                {widget.name}
                {widget.isTemplate && (
                  <Badge variant="outline" className="ml-2">Template</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{widget.type}</Badge>
              </TableCell>
              <TableCell>
                {widget.dashboardId ? (
                  "Dashboard #" + widget.dashboardId
                ) : (
                  <span className="text-muted-foreground italic">None</span>
                )}
              </TableCell>
              <TableCell>
                {widget.datasetId ? (
                  <span className="flex items-center">
                    <Database className="h-3 w-3 mr-1" />
                    Dataset #{widget.datasetId}
                  </span>
                ) : widget.customQuery ? (
                  <span className="flex items-center">
                    <Database className="h-3 w-3 mr-1" />
                    Custom Query
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">None</span>
                )}
              </TableCell>
              <TableCell>
                {widget.updatedAt ? formatDate(widget.updatedAt, { 
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : "-"}
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <div className="flex items-center justify-end space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(widget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    
                    {!widget.isTemplate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSaveAsTemplate(widget)}
                          >
                            <LayoutTemplate className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save as Template</TooltipContent>
                      </Tooltip>
                    )}
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAddToDashboard(widget)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add to Dashboard</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(widget.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}