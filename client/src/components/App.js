import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

class App extends Component {
  state = { walletInfo: {} };

  componentDidMount() {
    fetch(`${document.location.origin}/api/wallet-info`)
      .then(response => response.json())
      .then(json => this.setState({ walletInfo: json }));
  }

  render() {
    const { address, balance } = this.state.walletInfo;

    return (
      <div className="App">
        <img className='logo' src={logo}></img>
        <br />
        <div>Bienvenido a la bulfón_blockchain...</div>
        <br />
        <div><Link to='/blocks'>Bloques</Link></div>
        <div><Link to='/conduct-transaction'>Realizar una transacción</Link></div>
        <div><Link to='/transaction-pool'>Registro de transacciones</Link></div>
        <br />
        <div className='WalletInfo'>
          <div>Dirección: {address}</div>
          <div>Balance: {balance}</div>
        </div>
      </div>
    );
  }
}

export default App;