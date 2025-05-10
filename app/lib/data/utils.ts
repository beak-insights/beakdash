type NormalizeConfig = {
  xField: string;
  yField: string;
  colorField: string;
};


/* 
  Must normalize dataset so that each xFields has all 
  possible colorField values, even if the count is 0 
*/
function normalizeData(data: any[], config: NormalizeConfig): any[] {
  if (!data?.length || !config?.xField || !config?.yField || !config?.colorField) {
    return data;
  }

  const xValues = [...new Set(data.map(d => d[config.xField]))];
  const colorValues = [...new Set(data.map(d => d[config.colorField]))];

  const normalized: any[] = [];

  for (const xVal of xValues) {
    for (const colorVal of colorValues) {
      const match = data.find(
        d => d[config.xField] === xVal && d[config.colorField] === colorVal
      );

      normalized.push({
        [config.xField]: xVal,
        [config.colorField]: colorVal,
        [config.yField]: match ? match[config.yField] : 0,
      });
    }
  }

  return normalized;
}

export { 
  normalizeData,
  type NormalizeConfig,
};