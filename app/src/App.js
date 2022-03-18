import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { TextField, Button, Paper, Box, Typography } from '@mui/material';
import './App.css';
const CryptoJS = require('crypto-js');

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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '8%',
      }}
    >
      <Paper>
        <form onSubmit={messageSubmit}>
          <Typography variant='subtitle2'>Messanger</Typography>
          <Box
            sx={{
              height: '350px',
              maxWidth: '500px',
              border: '1px solid black',
              borderRadius: '5px',
              padding: '10px',
            }}
          >
            {renderChat()}
          </Box>
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <TextField
              sx={{ marginTop: '10px' }}
              name='msg'
              value={message}
              label='Message'
              id='outlined-multiline-static'
              onChange={(e) => onTextChange(e)}
            />
            <button style={{ margin: '20px 10px', width: '100px' }}>
              send
            </button>
          </Box>
        </form>
      </Paper>
    </Box>
  ) : (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '8%',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '400px',
          height: '70vh',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography sx={{ padding: '20px', margin: '0px' }}>
          Enter userName and password
        </Typography>
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
      </Paper>
    </Box>
  );
}

export default App;
