import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FieldValueSelectorProps {
  label: string;
  id: string;
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  columns: string[];
  allowNumeric?: boolean;
  allowCustom?: boolean;
  placeholder?: string;
  showNone?: boolean;
}

const FieldValueSelector: React.FC<FieldValueSelectorProps> = ({
  label,
  id,
  value,
  onChange,
  columns,
  allowNumeric = true,
  allowCustom = true,
  placeholder = "Select field",
  showNone = true
}) => {
  const [mode, setMode] = useState<'field' | 'numeric' | 'custom'>('field');
  const [numericValue, setNumericValue] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');

  // Determine current mode based on value
  React.useEffect(() => {
    if (value === undefined || value === '') {
      setMode('field');
    } else if (typeof value === 'number' || !isNaN(Number(value))) {
      setMode('numeric');
      setNumericValue(String(value));
    } else if (!columns.includes(String(value))) {
      setMode('custom');
      setCustomValue(String(value));
    } else {
      setMode('field');
    }
  }, [value, columns]);

  const handleNumericChange = (val: string) => {
    setNumericValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange(num);
    } else {
      onChange(undefined);
    }
  };

  const handleCustomChange = (val: string) => {
    setCustomValue(val);
    onChange(val || undefined);
  };

  const options = [];
  if (true) options.push({ value: 'field', label: 'Select Field' });
  if (allowNumeric) options.push({ value: 'numeric', label: 'Enter Number' });
  if (allowCustom) options.push({ value: 'custom', label: 'Custom Value' });

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="block">
        {label}
      </Label>
      
      {/* Radio buttons for mode selection */}
      <RadioGroup 
        value={mode} 
        onValueChange={(v) => setMode(v as 'field' | 'numeric' | 'custom')}
        className="flex flex-row space-x-4"
      >
        {options.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
            <Label htmlFor={`${id}-${option.value}`} className="text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {/* Input based on selected mode */}
      <div className="mt-3">
        {mode === 'field' && (
          <Select
            value={typeof value === 'string' && columns.includes(value) ? value : ""}
            onValueChange={(v) => onChange(v === "none" ? undefined : v)}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {showNone && <SelectItem value="none">None</SelectItem>}
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {mode === 'numeric' && allowNumeric && (
          <Input
            id={`${id}-numeric`}
            type="number"
            value={numericValue}
            onChange={(e) => handleNumericChange(e.target.value)}
            placeholder="Enter a number"
            className="w-full"
          />
        )}
        
        {mode === 'custom' && allowCustom && (
          <Input
            id={`${id}-custom`}
            type="text"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Enter custom value"
            className="w-full"
          />
        )}
      </div>
      
      {/* Show current value */}
      {value !== undefined && (
        <div className="text-sm text-gray-600">
          Current: {typeof value === 'number' ? `${value} (number)` : `"${value}"`}
        </div>
      )}
    </div>
  );
};

// Advanced version with validation and type hints
interface AdvancedFieldSelectorProps extends FieldValueSelectorProps {
  expectedType?: 'number' | 'string' | 'both';
  validation?: (value: any) => string | null;
  helpText?: string;
}

const AdvancedFieldSelector: React.FC<AdvancedFieldSelectorProps> = ({
  expectedType = 'both',
  validation,
  helpText,
  ...props
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (value: string | number | undefined) => {
    // Validate value
    if (validation) {
      const validationError = validation(value);
      setError(validationError);
      if (validationError) return;
    }
    
    // Type validation
    if (expectedType === 'number' && typeof value === 'string' && isNaN(Number(value))) {
      setError('Value must be a number');
      return;
    }
    
    props.onChange(value);
  };
  
  return (
    <div>
      <FieldValueSelector
        {...props}
        onChange={handleChange}
        allowNumeric={expectedType !== 'string'}
        allowCustom={expectedType !== 'number'}
      />
      {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
      {helpText && <div className="text-sm text-gray-500 mt-1">{helpText}</div>}
    </div>
  );
};

// Compact version with inline radio buttons
const CompactFieldSelector: React.FC<FieldValueSelectorProps> = ({
  label,
  id,
  value,
  onChange,
  columns,
  allowNumeric = true,
  allowCustom = true,
  placeholder = "Select field",
  showNone = true
}) => {
  const [mode, setMode] = useState<'field' | 'numeric' | 'custom'>('field');

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="block">
        {label}
      </Label>
      
      <div className="flex items-center space-x-4">
        <RadioGroup 
          value={mode} 
          onValueChange={(v) => setMode(v as 'field' | 'numeric' | 'custom')}
          className="flex flex-row space-x-3"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="field" id={`${id}-field`} />
            <Label htmlFor={`${id}-field`} className="text-xs">Field</Label>
          </div>
          {allowNumeric && (
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="numeric" id={`${id}-numeric`} />
              <Label htmlFor={`${id}-numeric`} className="text-xs">Number</Label>
            </div>
          )}
          {allowCustom && (
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="custom" id={`${id}-custom`} />
              <Label htmlFor={`${id}-custom`} className="text-xs">Custom</Label>
            </div>
          )}
        </RadioGroup>
      </div>
      
      {/* Input based on selected mode */}
      <div>
        {mode === 'field' && (
          <Select
            value={typeof value === 'string' && columns.includes(value) ? value : ""}
            onValueChange={(v) => onChange(v === "none" ? undefined : v)}
          >
            <SelectTrigger id={id} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {showNone && <SelectItem value="none">None</SelectItem>}
              {columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {mode === 'numeric' && allowNumeric && (
          <Input
            id={`${id}-numeric`}
            type="number"
            value={typeof value === 'number' ? value : ''}
            onChange={(e) => {
              const num = parseFloat(e.target.value);
              onChange(!isNaN(num) ? num : undefined);
            }}
            placeholder="Enter number"
            className="w-full"
          />
        )}
        
        {mode === 'custom' && allowCustom && (
          <Input
            id={`${id}-custom`}
            type="text"
            value={typeof value === 'string' && !columns.includes(value) ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="Enter custom value"
            className="w-full"
          />
        )}
      </div>
    </div>
  );
};

export { 
  FieldValueSelector, 
  AdvancedFieldSelector, 
  CompactFieldSelector 
};


// For Size Field (scatter charts) - allows field or numeric value
/*
<FieldValueSelector
  label="Size Field"
  id="sizeField"
  value={config.sizeField}
  onChange={(value) => handleChange("sizeField", value)}
  columns={columns.all}
  allowNumeric={true}      // Can enter fixed size like 10
  allowCustom={false}      // No custom text allowed
  placeholder="Select size field"
  showNone={true}
/>

// For Color Field - allows field or custom color name
<FieldValueSelector
  label="Color Field"
  id="colorField"
  value={config.colorField}
  onChange={(value) => handleChange("colorField", value)}
  columns={columns.all}
  allowNumeric={false}     // Colors aren't numeric
  allowCustom={true}       // Can enter "red", "blue", etc.
  placeholder="Select color field"
/>

// With Advanced Validation
<AdvancedFieldSelector
  label="Border Width"
  id="borderWidth"
  value={config.borderWidth}
  onChange={(value) => handleChange("borderWidth", value)}
  columns={columns.numeric}
  expectedType="number"
  allowNumeric={true}
  validation={(value) => {
    if (typeof value === 'number' && value < 0) {
      return "Border width must be positive";
    }
    return null;
  }}
  helpText="Enter a number or select a field"
/>
*/