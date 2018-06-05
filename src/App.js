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

// a higher-order function defined outside of the App component to filter from
// search queries
const isSearched = searchTerm => item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            list, // when property name in object is same as variable name
                  // we do not need to include both variable and state property names
                  // "list," is the same as "list: list,"

            searchTerm: '', // search box should be initialized as empty
        };

        this.onDismiss = this.onDismiss.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
    }

    onDismiss(id) {
        function isNotId(item) {
            return item.objectID !== id;
        };

        const updatedList = this.state.list.filter(isNotId);

        this.setState({ list: updatedList });
    }

    onSearchChange(event) {
        this.setState({ searchTerm: event.target.value });
    }

    render() {
        const { searchTerm, list } = this.state; // destructuring local state object using ES6
        return (
            <div className="page">
                <div className="interactions">
                    <Search
                        value={searchTerm}
                        onChange={this.onSearchChange}
                    >
                        Search:
                    </Search>
                    <Table
                        list={list}
                        pattern={searchTerm}
                        onDismiss={this.onDismiss}
                    />
                </div>
            </div>
        );
    }
}

const Search = ({ value, onChange, children }) =>
    <form>
        {children} <input
            type="text"
            value={value} // make the HTML <input> a React
                          // controlled component
            onChange={onChange}
        />
    </form>

const Table = ({ list, pattern, onDismiss }) =>
    <div className="table">
        {list.filter(isSearched(pattern)).map(item => // demonstrates ES6 condensed arrow function
            <div key={item.objectID} className="table-row">
                <span style={{ width : '40%'}}>
                    <a href={item.url}>{item.title}</a>
                </span>
                <span style={{ width: '30%' }}>{item.author}</span>
                <span style={{ width: '10%' }}>{item.num_comments}</span>
                <span style={{ width: '10%' }}>{item.points}</span>
                <span style={{ width: '10%' }}>
                    <Button
                        onClick={() => onDismiss(item.objectID)}
                        className="button-inline"
                    >
                        DISMISS
                    </Button>
                </span>
            </div>
        )}
    </div>

const Button = ({ onClick, className, children }) =>
    <button
        onClick={onClick}
        className={className}
        type="button"
    >
        {children}
    </button>


export default App;
