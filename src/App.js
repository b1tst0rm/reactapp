import React, { Component } from 'react';
import './App.css';

const list = [
    {
        title: 'React',
        url: 'https://facebook.github.io/react/',
        author: 'Jordan Walke',
        num_comments: 3,
        points: 4,
        objectID: 0,
    },
    {
        title: 'Redux',
        url: 'https://github.com/reactjs/redux/',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1,
    },
];
    
class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            list, // when property name in object is same as variable name
                  // we do not need to include both variable and state property names
                  // "list," is the same as "list: list,"
        };

        this.onDismiss = this.onDismiss.bind(this);
    }

    onDismiss(id) {
        function isNotId(item) {
            return item.objectID !== id;
        };

        const updatedList = this.state.list.filter(isNotId);

        this.setState({ list: updatedList });
    }

    render() {	
        return (
            <div className="App">       
                {this.state.list.map(item => // demonstrates ES6 condensed arrow function
                    <div key={item.objectID}>
                        <span>
                            <a href={item.url}>{item.title}</a>
                        </span>
                        <span>{item.author}</span>
                        <span>{item.num_comments}</span>
                        <span>{item.points}</span>
                        <span>
                            <button
                                onClick={() => this.onDismiss(item.objectID)}
                                type="button"
                            >
                                DISMISS
                            </button>
                        </span>
                    </div>
                )}
            </div>
        );
    }
}

export default App;
