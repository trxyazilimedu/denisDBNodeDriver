# DenisDB Connection

## Installation
```bash
npm install denisdb
```

## Usage

### Importing
```javascript
import DDBConnect from "denisdb";
```

### Basic TCP Connection
```javascript
const client = new DDBConnect({ type: 'tcp', port: 5142 });

try {
    // Explicitly connect first
    await client.connect();

    // START COMMAND
    await client.send("AUTH CREATE");

    // Listen for data
    client.listen((receivedData) => {
        console.log(receivedData);
    });

    // CLOSE CONNECTION
    // client.close();
} catch (error) {
    console.error('Connection error:', error);
}
```

### Connection Options
- `type`: Connection type ('tcp' or 'udp', default: 'tcp')
- `port`: Server port (default: 5142)
- `host`: Server host (default: 'localhost')

### Methods
- `connect()`: Establish connection
- `send(data)`: Send data to server
- `listen(callback)`: Receive data from server
- `close()`: Close connection