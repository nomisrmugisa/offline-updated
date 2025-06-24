import React, { useEffect, useRef } from 'react';
import * as ECT from '@whoicd/icd11ect';
import { ISelectedEntity } from '../types/ICDSelectedEntity.ts';
import { useServiceConfig } from '../hooks/useServiceConfig';
import '@whoicd/icd11ect/style.css';

interface CauseOfDeathRowProps {
  index: number;
  label?: string;
  rowLetter?: string;
  labelHtml?: React.ReactNode;
  showLabel?: boolean;
  causeValue: string;
  codeValue: string;
  // freeTextValue: string;
  timeUnitValue: string;
  timeQtyValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNestedChange: (field: string, subField: string, value: string) => void;
}

const CauseOfDeathRow: React.FC<CauseOfDeathRowProps> = ({
  index,
  rowLetter,
  label,
  labelHtml,
  showLabel = true,
  causeValue,
  codeValue,
  // freeTextValue,
  timeUnitValue,
  timeQtyValue,
  onChange,
  onNestedChange,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { config } = useServiceConfig();

  useEffect(() => {
    const apiUrl = `http://${config.serverIp}:8382`;
    console.log('=== ICD-API Configuration ===');
    console.log('Device config:', config);
    console.log('Server IP:', config.serverIp);
    console.log('Is tablet mode:', config.isTabletMode);
    console.log('ICD-API URL being used:', apiUrl);
    console.log('============================');
    
    const settings = {
      apiServerUrl: apiUrl, 
      // apiServerUrl: 'https://icd11restapi-developer-test.azurewebsites.net', 
      autoBind: false,
    };

    const callbacks = {
      selectedEntityFunction: (selectedEntity: ISelectedEntity) => {
        const { iNo, code, title } = selectedEntity;

        const causeEvent = {
          target: {
            name: `causeOfDeath${iNo}`,
            value: title
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(causeEvent);

        const codeEvent = {
          target: {
            name: `code${iNo}`,
            value: code
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(codeEvent);

        // Optional: update underlying cause
        const stateEvent = {
          target: {
            name: 'State_Underlying_Cause',
            value: title
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(stateEvent);

        const stateCodeEvent = {
          target: {
            name: 'State_Underlying_Cause_Code',
            value: code
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(stateCodeEvent);

        ECT.Handler.clear(iNo);
      },
    };

    ECT.Handler.configure(settings, callbacks);
    ECT.Handler.bind(`${index}`);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        inputRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)
      ) {
        ECT.Handler.clear(`${index}`);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      ECT.Handler.clear(`${index}`);
    };
  }, [config.serverIp, index]);

  return (
    <>
      <tr>
        {showLabel ? (label ? <th>{label}</th> : labelHtml ? labelHtml : <></>) : <></>}
        <th>{rowLetter}</th>
        <td>
          <input
            ref={inputRef}
            type="text"
            className="form-control ctw-input"
            autoComplete="off"
            name={`causeOfDeath${index}`}
            value={causeValue}
            onChange={onChange}
            data-ctw-ino={`${index}`}
            onClick={() => ECT.Handler.show(`icd-${index}`)}
          />
        </td>
        <td>
          <input
            type="text"
            className="form-control"
            name={`code${index}`}
            value={codeValue}
            onChange={onChange}
          />
        </td>
        {/* <td>
          <input
            type="text"
            className="form-control"
            name={`causeOfDeathFreeText${index}`}
            value={freeTextValue}
            onChange={onChange}
          />
        </td> */}
        <td>
          <select
            className="form-select"
            name={`timeUnit${index}`}
            value={timeUnitValue}
            onChange={(e) =>
              onNestedChange(`Time_Interval_From_Onset_To_Death${index}`, `Time_Interval_Unit${index}`, e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="Years">Years</option>
            <option value="Months">Months</option>
            <option value="Weeks">Weeks</option>
            <option value="Days">Days</option>
            <option value="Hours">Hours</option>
          </select>
        </td>
        <td>
          <input
            type="text"
            className="form-control"
            name={`timeQty${index}`}
            value={timeQtyValue}
            onChange={(e) =>
              onNestedChange(`Time_Interval_From_Onset_To_Death${index}`, `Time_Interval_Qtty${index}`, e.target.value)
            }
          />
        </td>
      </tr>
      <div
        ref={dropdownRef}
        className="ctw-window"
        data-ctw-ino={`${index}`}
        style={{ maxWidth: '1200px' }}
      ></div>
    </>
  );
};

export default CauseOfDeathRow;