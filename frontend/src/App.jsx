import "./App.css";
import Header from './components/Header';
import {Routes, Route} from 'react-router-dom';
import Tokens from "./components/Tokens";
import Swap from "./components/Swap";
import {useConnect, useAccount, useDisconnect} from 'wagmi';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';

function App() {
  const {address, isConnected} = useAccount();
  const {connect} = useConnect({
    connector: new MetaMaskConnector
  })
  const {disconnect} = useDisconnect()

  return <div className="App">
      <Header 
        connect={connect} 
        disconnect={disconnect}
        isConnected={isConnected} address={address} />
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={<Swap  isConnected={isConnected} address={address} />}></Route>
          <Route path="/tokens" element={<Tokens />}></Route>
        </Routes>
      </div>
  </div>;
}

export default App;
