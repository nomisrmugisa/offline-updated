import React from 'react';
import './FormFooter.css';

const FormFooter: React.FC = () => {
  return (
    <div className="footer">
      <div className="f1">
        <span><h6>Inserting</h6></span>
      </div>
      <div className="f2">
        <div className="mergedBtn1">
          <button className="mgBtn">Cancel</button>
          <button className="mgBtn" style={{ display: 'none' }}>Save</button>
        </div>
        <div className="mergedBtn2">
          <button className="mgBtn">Approve ?</button>
          <button className="mgBtn">Print</button>
          <button className="mgBtn">Setting</button>
        </div>
      </div>
    </div>
  );
};

export default FormFooter;