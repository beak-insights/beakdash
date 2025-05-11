'use client';

import { AppstoreOutlined } from '@ant-design/icons';
import { Widget } from '@/lib/db/schema';
import ChartWidget from '@/components/widgets/chart/renders';
import { WidgetHeader } from "@/components/widgets/widget-header";
import TableWidget from '@/components/widgets/chart/table-widget';


export const WidgetVisual = ({ widget }: { widget: Widget }) => {
  const { type, data, config } = widget;
  return (
    <div className="h-full p-4 overflow-auto w-full">
      <WidgetHeader name={widget.name} description={widget.description} />
      <div className="mt-2 prose max-w-none w-full h-full">
        {type === 'text' ? (
          <div className="text-lg font-medium leading-relaxed">
            {config?.textContent?.split('\n').map((line: string, i: number) => (
              <p key={i} className="break-words">{line || <br />}</p>
            )) || (
              <p className="text-muted-foreground">No content available</p>
            )}
          </div>
        ) : type === 'chart' ? (
          <ChartWidget widget={widget} />
        ) : type === 'table' ? (
          <TableWidget data={data} config={config} />
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