import React from 'react';

const Optionsfield = ({ options, property, changeState }) => {
  return (
    <div className="options-field">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => changeState(index)}
          className={option.name === property ? 'active' : ''}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
};

export default Optionsfield;
