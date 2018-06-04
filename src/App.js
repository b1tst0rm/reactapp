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
            <div className="App">
                <Search
                    value={searchTerm}
                    onChange={this.onSearchChange}
                />
                <Table
                    list={list}
                    pattern={searchTerm}
                    onDismiss={this.onDismiss}
                />
            </div>
        );
    }
}

class Search extends Component {
    render() {
        const { value, onChange} = this.props;
        return (
            <form>
                <input
                    type="text"
                    value={value} // make the HTML <input> a React
                                  // controlled component
                    onChange={onChange}
                />
            </form>
        );
    }
}

class Table extends Component {
    render() {
        const {list, pattern, onDismiss} = this.props;

        return (
            <div>
                {list.filter(isSearched(pattern)).map(item => // demonstrates ES6 condensed arrow function
                    <div key={item.objectID}>
                        <span>
                            <a href={item.url}>{item.title}</a>
                        </span>
                        <span>{item.author}</span>
                        <span>{item.num_comments}</span>
                        <span>{item.points}</span>
                        <span>
                            <button
                                // The onDismiss method is wrapped in a "higher order function"
                                // so that the method doesn't immediately execute when the
                                // browser loads the page, rather it waits for the button
                                // to be pressed as intended
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
