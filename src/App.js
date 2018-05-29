import React, { Component } from 'react';
import './App.css';
    
class App extends Component {
    render() {	
        const testVar = " Dan";
        return (
            <div className="App">
                <h2>Welcome{testVar}</h2>
            </div>
        );
    }
}

export default App;
