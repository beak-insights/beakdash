/**
 * This script creates test widgets for the dashboard
 */

import { db } from '../app/lib/db';
import { widgets, dashboardWidgets } from '../app/lib/db/schema';

async function createTestWidgets() {
  try {
    console.log('Creating test widgets...');

    // Dashboard ID to add widgets to
    const dashboardId = 5; // Change this to match your dashboard ID

    // Sample data for different chart types
    const sampleBarData = [
      { name: 'Jan', value: 400 },
      { name: 'Feb', value: 300 },
      { name: 'Mar', value: 600 },
      { name: 'Apr', value: 800 },
      { name: 'May', value: 500 }
    ];

    const sampleLineData = [
      { date: 'Jan', value: 400 },
      { date: 'Feb', value: 300 },
      { date: 'Mar', value: 600 },
      { date: 'Apr', value: 800 },
      { date: 'May', value: 500 }
    ];

    const samplePieData = [
      { name: 'Group A', value: 400 },
      { name: 'Group B', value: 300 },
      { name: 'Group C', value: 300 },
      { name: 'Group D', value: 200 }
    ];

    const sampleAreaData = [
      { date: 'Jan', value: 400 },
      { date: 'Feb', value: 300 },
      { date: 'Mar', value: 600 },
      { date: 'Apr', value: 800 },
      { date: 'May', value: 500 }
    ];

    // Create bar chart widget
    const [barWidget] = await db.insert(widgets).values({
      name: 'Monthly Sales (Bar Chart)',
      type: 'chart',
      spaceId: 1, // Change this to match your space ID
      config: {
        chartType: 'bar',
        xAxis: 'name',
        yAxis: 'value',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        isStacked: false,
        colors: ['#3f51b5', '#2196f3', '#03a9f4'],
        xAxisLabel: 'Month',
        yAxisLabel: 'Sales ($)',
        chartTitle: 'Monthly Sales Performance'
      },
      customQuery: 'SELECT * FROM sales WHERE year = 2025',
    }).returning();

    console.log('Created bar chart widget:', barWidget.id);

    // Create line chart widget
    const [lineWidget] = await db.insert(widgets).values({
      name: 'Revenue Trend (Line Chart)',
      type: 'chart',
      spaceId: 1, // Change this to match your space ID
      config: {
        chartType: 'line',
        xAxis: 'date',
        yAxis: 'value',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#4caf50', '#8bc34a', '#cddc39'],
        xAxisLabel: 'Month',
        yAxisLabel: 'Revenue ($)',
        chartTitle: 'Monthly Revenue Trend'
      },
      customQuery: 'SELECT * FROM revenue WHERE year = 2025',
    }).returning();

    console.log('Created line chart widget:', lineWidget.id);

    // Create area chart widget
    const [areaWidget] = await db.insert(widgets).values({
      name: 'Traffic Growth (Area Chart)',
      type: 'chart',
      spaceId: 1, // Change this to match your space ID
      config: {
        chartType: 'area',
        xAxis: 'date',
        yAxis: 'value',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        isStacked: true,
        colors: ['#009688', '#00bcd4', '#03a9f4'],
        xAxisLabel: 'Month',
        yAxisLabel: 'Visitors',
        chartTitle: 'Website Traffic Growth'
      },
      customQuery: 'SELECT * FROM traffic WHERE year = 2025',
    }).returning();

    console.log('Created area chart widget:', areaWidget.id);

    // Create pie chart widget
    const [pieWidget] = await db.insert(widgets).values({
      name: 'Revenue Distribution (Pie Chart)',
      type: 'chart',
      spaceId: 1, // Change this to match your space ID
      config: {
        chartType: 'pie',
        xAxis: 'name',
        yAxis: 'value',
        showLegend: true,
        showTooltip: true,
        showLabel: true,
        colors: ['#ff5722', '#ff9800', '#ffc107', '#ffeb3b'],
        chartTitle: 'Revenue Distribution by Category'
      },
      customQuery: 'SELECT * FROM revenue_distribution WHERE year = 2025',
    }).returning();

    console.log('Created pie chart widget:', pieWidget.id);

    // Create text widget
    const [textWidget] = await db.insert(widgets).values({
      name: 'Dashboard Summary',
      type: 'text',
      spaceId: 1, // Change this to match your space ID
      config: {
        textContent: `# Dashboard Overview\n\nThis dashboard provides key metrics for business performance in 2025.\n\n## Key Highlights\n\n- Revenue is up 15% from last quarter\n- Customer growth rate increased to 8.5%\n- New product line launched successfully`,
        textAlign: 'left',
        fontSize: 'medium',
        fontWeight: 'normal',
      }
    }).returning();

    console.log('Created text widget:', textWidget.id);

    // Add widgets to dashboard with positions
    await db.insert(dashboardWidgets).values([
      {
        dashboardId,
        widgetId: barWidget.id,
        position: { x: 0, y: 0, w: 6, h: 4 }
      },
      {
        dashboardId,
        widgetId: lineWidget.id,
        position: { x: 6, y: 0, w: 6, h: 4 }
      },
      {
        dashboardId,
        widgetId: pieWidget.id,
        position: { x: 0, y: 4, w: 4, h: 4 }
      },
      {
        dashboardId,
        widgetId: areaWidget.id,
        position: { x: 4, y: 4, w: 8, h: 4 }
      },
      {
        dashboardId,
        widgetId: textWidget.id,
        position: { x: 0, y: 8, w: 12, h: 2 }
      }
    ]);

    console.log('Added widgets to dashboard:', dashboardId);
    console.log('Test widgets created successfully!');
  } catch (error) {
    console.error('Error creating test widgets:', error);
  } finally {
    process.exit(0);
  }
}

createTestWidgets();