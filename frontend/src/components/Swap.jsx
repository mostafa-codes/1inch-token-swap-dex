import React, { useEffect, useState } from 'react'
import {Input, Popover, Radio, Modal, message} from 'antd';
import {ArrowDownOutlined, DownOutlined, SettingOutlined} from '@ant-design/icons'
import tokenList from '../tokenList.json';
import axios from 'axios';
import { useSendTransaction, useWaitForTransaction } from 'wagmi';

function Swap({isConnected, address}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null
  })

  const {data, sendTransaction } = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value)
    }
  })

  const {isLoading, isSuccess, isError} = useWaitForTransaction({hash: data?.hash})

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address)
  }, []);

  useEffect(() => {
    if(txDetails.to && isConnected  ) {
      sendTransaction();
    }
  }, [txDetails])

  useEffect(() => {
    console.log(isLoading);
    messageApi.destroy();
    if(isLoading) {
      messageApi.open({
        type: 'loading',
        content: 'Transaction Is Pending...',
        duration: 0,
      })
    }
  }, [isLoading]) 

  useEffect(() => {
    console.log(isError);
    messageApi.destroy();
    if(isError) {
      messageApi.open({
        type: 'Error',
        content: 'Transaction Failed',
        duration: 0,
      })
    }
  }, [isError]) 

  useEffect(() => {
    console.log(isSuccess);
    messageApi.destroy();
    if(isSuccess) {
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5
      })
    } else if(txDetails.to) {
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.5,
      })
    }
  }, [isSuccess])

  const fetchDexSwap = async () => {
    const allowance = await axios
      .get(`https://api.1inch.io/v5.0/1/approve/allowance`, {
        params: {
          tokenAddress: tokenOne.address,
          walletAddress: address
        }
      })
    if(allowance.data.allowance === '0') {
      const approve = await axios
        .get(`https://api.1inch.io/v5.0/1/approve/transaction`, {
          params: {
            tokenAddress: tokenOne.address
          }
        });
      
      setTxDetails(approve.data);
      console.log('not approved');
      return 
    }
    const amount = tokenOneAmount.padEnd(tokenOne.decimals+tokenOneAmount.length, '0')
    const tx = await axios.get(
      `https://api.1inch.io/v5.0/1/swap`, {
        params: {
          fromTokenAddress: tokenOne.address,
          toTokenAddress: tokenTwo.address,
          amount: amount,
          fromTokenAddress: address,
          slippage,
        }
      })
    let decimals = Number(`1E${tokenTwo.decimals}`);
    setTokenTwoAmount((Number(tx.data.tokenAmount)/decimals).toFixed(2));
    setTxDetails(tx.data.tx)
  }

  const fetchPrices = async (one, two) => {
    const res = await axios.get('http://localhost:3001/tokenPrice', {
      params: {addressOne: one, addressTwo: two}
    })
    setPrices(res.data)
  }
  

  const openModal = (asset) => {
    setChangeToken(asset);
    setIsOpen(true);
  }

  const modifyToken = i => {
    
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);

    if(changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address)
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address)
    }
    setIsOpen(false);
  }
  

  const handleSlippageChange = (e) => {
    setSlippage(e.target.value)
  }

  const changeAmount = (e) => {
    let value = e.target.value
    setTokenOneAmount(value);
    if(value && prices) {
      setTokenTwoAmount((value*prices.ratio).toFixed(2));
    } else {
      setTokenTwoAmount(null)
    }
  }

  const switchTokens = e => {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  const settings = (
    <>
      {contextHolder}
      <div className='slippage-options'>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  )

  return (
    <>
    <Modal 
      open={isOpen}
      footer={null}
      onCancel={() => setIsOpen(false)}
      title="select token"
    >
      <div className="modal-content">
        {tokenList.map((e, i) => {
          return (
            <div className="tokenChoice"
              key={i}
              onClick={() => modifyToken(i)}
            >
              <img src={e.img} width="40" />
              <div className="tokenChoiceNames">
                <div className="tokenName">{e.name}</div>
                <div className="tokenTicker">{e.ticker}</div>
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
    <div className="tradeBox">
      <div className="tradeBoxHeader">
        <h4>Swap</h4>
      </div>
      <div className="inputs">
        <Input placeholder='0'
          disabled={!prices} 
          value={tokenOneAmount} onChange={changeAmount} />
        <Input placeholder="0" value={tokenTwoAmount} disabled={true} />

        <div className="switchButton" onClick={switchTokens}>
          <ArrowDownOutlined className='switchArrow' />
        </div>


        {/* choosing asset to swap*/}
        <div className="assetOne" onClick={() => openModal(1)}>
          <img src={tokenOne.img} className="assetLogo" />
          {tokenOne.ticker}
          <DownOutlined />
        </div>
        <div className="assetTwo" onClick={() => openModal(2)}>
        <img src={tokenTwo.img} className="assetLogo" />
          {tokenTwo.ticker}
          <DownOutlined />
        </div>
      </div>

      <div className='slippage'>
        <h4>Slippage Tolerance</h4>
        {settings}
      </div>

      <div className="swapButton" onClick={fetchDexSwap} disabled={!tokenOneAmount || !isConnected}>
        Swap
      </div>
    </div>
    </>
  )
}

export default Swap