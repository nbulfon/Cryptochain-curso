import React from 'react';

const Transaction = ({ transaction }) => {
  const { input, outputMap } = transaction;
  const recipients = Object.keys(outputMap);

  return (
    <div className='Transaction'>
      <div>De: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}</div>
      {
        recipients.map(recipient => (
          <div key={recipient}>
            Para: {`${recipient.substring(0, 20)}...`} | Enviado {outputMap[recipient]}
          </div>
        ))
      }
    </div>
  );
}

export default Transaction;