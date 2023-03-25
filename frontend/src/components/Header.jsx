import React from 'react'
import Logo from '../moralis-logo.svg';
import Eth from '../eth.svg';
import { Link } from 'react-router-dom';


function Header({address, isConnected, connect, disconnect}) {

  return (
    <header>
      <div className="leftH">
        
        <Link to="/" className="link">
          <div className="headerItem">AnySwap</div>
        </Link>
      </div>

        <div className="rightH">
         
          <button className="connectButton"
            onClick={() => {
              if(isConnected) disconnect()
              else connect()
            }}
          >
            {isConnected 
            ? 'Disconnect'
            : 'Connect'}
          </button>
        </div>
      </header> 
  )
}

export default Header