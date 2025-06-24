import React from "react";

interface OtherConditionsRowProps {
  mainLabel?: string;
  subLabel: string;
  showMainLabel?: boolean;
  rowSpan?: number;
  causeValue?: string;
  codeValue?: string;
  extraValue1?: string;
  extraValue2?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OtherConditionsRow: React.FC<OtherConditionsRowProps> = ({
  mainLabel,
  subLabel,
  showMainLabel = false,
  rowSpan = 1,
  causeValue = "",
  codeValue = "",
  onChange,
}) => {
  return (
    <tr>
      {showMainLabel ? <th rowSpan={rowSpan} colSpan={1}>{mainLabel}</th> : null}
      <th colSpan={2}>{subLabel}</th>
      <td colSpan={2}>
        <input type="text" className="form-control" name={`cause${subLabel}`} value={causeValue} onChange={onChange} />
      </td>
      <td colSpan={2}>
        <input type="text" className="form-control" name={`code${subLabel}`} value={codeValue} onChange={onChange} />
      </td>
    </tr>
  );
};

export default OtherConditionsRow;
