'use client';

import { AppstoreOutlined } from '@ant-design/icons';
import { Widget } from '@/lib/db/schema';
import ChartWidget from '@/components/widgets/chart/chart';
import { WidgetHeader } from "@/components/widgets/widget-header";
import TableWidget from '@/components/widgets/chart/table-widget';

interface WidgetVisualProps {
  widget: Widget;
  dimensions?: {
    width: number;
    height: number;
  };
  isResizing?: boolean;
}

export const WidgetVisual = ({ 
  widget, 
  dimensions = { width: 0, height: 0 },
  isResizing = false
}: WidgetVisualProps) => {
  const { type, data, config } = widget;
  return (
    <div className="h-full w-full" >
      <div className="px-4 py-2">
        <WidgetHeader name={widget.name} description={widget.description || undefined} />
      </div>
      <div 
        className="mt-2 px-4 py-2 flex-1 prose max-w-none w-full overflow-hidden"
      >
        {type === 'text' ? (
          <div className="text-lg font-medium leading-relaxed overflow-auto h-full">
            {config?.textContent?.split('\n').map((line: string, i: number) => (
              <p key={i} className="break-words">{line || <br />}</p>
            )) || (
              <p className="text-muted-foreground">No content available</p>
            )}
          </div>
        ) : type === 'chart' ? (
          <div className="h-full overflow-hidden">
            <ChartWidget widget={widget} dimensions={dimensions} />
          </div>
        ) : type === 'table' ? (
          <div className="h-full overflow-auto">
            <TableWidget data={data || []} config={{}} />
          </div>
        ) : (
          <>
            <AppstoreOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
            <p>Unsupported widget type: {type}</p>
          </>
        )}
      </div>
    </div>
  );
}