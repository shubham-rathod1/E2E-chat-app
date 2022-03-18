import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { TextField, Button } from '@mui/material';
import './App.css';
const CryptoJS = require('crypto-js');

// const socket = io.connect('http://localhost:3000');

function App() {
  const [state, setState] = useState({ msg: '', name: '', secret: '' });
  const [message, setMessage] = useState('');
  const [render, setRender] = useState(false);
  const [chat, setChat] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect('http://localhost:2244');
    socketRef.current.on('msg', ({ name, msg, secret }) => {
      // decrypt here
      const bytes = CryptoJS.AES.decrypt(msg, secret);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      setChat([...chat, { name, msg: decryptedData }]);
    });
    return () => socketRef.current.disconnect();
  }, [chat]);

  const onTextChange = (e) => {
    // encrypt msg here
    if (e.target.name === 'name') {
      // setMessage({ ...state, name: e.target.value });
      setState({ ...state, name: e.target.value });
    } else if (e.target.name === 'secret') {
      setState({ ...state, secret: e.target.value });
    } else {
      const val = e.target.value;
      const ciphertext = CryptoJS.AES.encrypt(val, state.secret).toString();
      setMessage(val);
      setState({ ...state, msg: ciphertext });
    }
  };

  const messageSubmit = (e) => {
    e.preventDefault();
    const { name, msg, secret } = state;
    // console.log(name, msg, secret);
    socketRef.current.emit('msg', { name, msg, secret });
    setState({ ...state, msg: '' });
    setMessage('');
  };

  const renderChat = () => {
    return chat.map(({ name, msg }, i) => (
      <div key={i}>
        <h3>
          {name}: <span>{msg}</span>
        </h3>
      </div>
    ));
  };

  const handleSubmit = () => {
    if (state.secret && state.name) {
      setRender(true);
    }
  };
  return render ? (
    <div className='card'>
      <form onSubmit={messageSubmit}>
        <h1>Messanger</h1>
        <div>
          <h1>Chat Log</h1>
          {renderChat()}
        </div>
        <div style={{ display: 'flex', alignItems: 'bottom' }}>
          <TextField
            name='msg'
            value={message}
            label='Message'
            id='outlined-multiline-static'
            onChange={(e) => onTextChange(e)}
          />
          <button>send</button>
        </div>
      </form>
    </div>
  ) : (
    <div
      className='card'
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className='name-field'>
        <TextField
          name='name'
          value={state.name}
          label='Name'
          onChange={(e) => onTextChange(e)}
        />
      </div>
      <div>
        <TextField
          name='secret'
          value={state.secret}
          label='Secret'
          onChange={(e) => onTextChange(e)}
        />
      </div>
      <Button
        sx={{ justifyContent: 'center', marginTop: '20px' }}
        variant='outlined'
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </div>
  );
}

export default App;
