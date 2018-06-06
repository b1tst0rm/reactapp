import React, { Component } from 'react';
import axios from 'axios'; // axios: browser replacement for
                           // async requests to remote APIs.
import { sortBy} from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '10'; // HPP = Hits Per Page, or how many resultss are returned
                          // per API request.

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, 'title'),
    AUTHOR: list => sortBy(list, 'author'),
    COMMENTS: list => sortBy(list, 'num_comments').reverse(),
    POINTS: list => sortBy(list, 'points').reverse(),
};

// Higher-order function that manages state for updates with searching
const updateSearchTopStoriesState = (hits, page) => (prevState) => {
    const { searchKey, results } = prevState;

    const oldHits = results && results[searchKey]
        ? results[searchKey].hits
        : [];

    const updatedHits = [
        ...oldHits,
        ...hits
    ];

    return {
        results: {
            ...results,
            [searchKey]: { hits: updatedHits, page }
        },
        isLoading: false
    };
}

class App extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            results: null,
            searchKey: '',
            searchTerm: DEFAULT_QUERY,
            error: null,
            isLoading: false,
        };

        this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
        this.setSearchTopStories = this.setSearchTopStories.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
        this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    }

    needsToSearchTopStories(searchTerm) {
        // is the term already in our cache (false)?
        // or must we fetch new data (true)?
        return !this.state.results[searchTerm];
    }

    setSearchTopStories(result) {
        const { hits, page } = result;
        this.setState(updateSearchTopStoriesState(hits, page));
    }

    fetchSearchTopStories(searchTerm, page = 0) {
        this.setState({ isLoading: true });
        // below demonstrates ES6 string concatentation
        axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}\
            &${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
            .then(result => this._isMounted && this.setSearchTopStories(result.data))
            .catch(error => this._isMounted && this.setState({ error }));
    }

    componentDidMount() {
        this._isMounted = true;

        const { searchTerm } = this.state;
        this.setState({ searchKey: searchTerm });
        this.fetchSearchTopStories(searchTerm);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onDismiss(id) {
        const { searchKey, results } = this.state;
        const { hits, page } = results[searchKey];

        const isNotId = item => item.objectID !== id;
        const updatedHits = hits.filter(isNotId);

        this.setState({
            results: {
                ...results,
                [searchKey]: { hits: updatedHits, page }
            }
        });
    }

    onSearchChange(event) {
        this.setState({ searchTerm: event.target.value });
    }

    onSearchSubmit(event) {
        const { searchTerm } = this.state;
        this.setState({ searchKey: searchTerm });

        if (this.needsToSearchTopStories(searchTerm)) {
            this.fetchSearchTopStories(searchTerm);
        }

        event.preventDefault();
    }

    render() {
        // destructuring local state object using ES6
        const {
            searchTerm,
            results,
            searchKey,
            error,
            isLoading,
        } = this.state;

        const page = (
            results &&
            results[searchKey] && // if this is true, our search data is in cache
            results[searchKey].page
        ) || 0;

        const list = (
            results &&
            results[searchKey] &&
            results[searchKey].hits
        ) || [];

        return (
            <div className="page">
                <div className="interactions">
                    <Search
                        value={searchTerm}
                        onChange={this.onSearchChange}
                        onSubmit={this.onSearchSubmit}
                    >
                        Search
                    </Search>
                </div>
                { error
                    ? <div className="interactions">
                        <p style={{color:"red"}}>An error has occured with your request.</p>
                    </div>
                    : <div>
                        <Table
                            list={list}
                            onDismiss={this.onDismiss}
                        />
                        <div className="interactions">
                            <ButtonWithLoading
                                isLoading={isLoading}
                                onClick={() => this.fetchSearchTopStories(searchKey, page + 1 )}>
                                More
                            </ButtonWithLoading>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

class Search extends Component {
    componentDidMount() {
        if(this.input) {
            this.input.focus();
        }
    }

    render() {
        const {
            value,
            onChange,
            onSubmit,
            children
        } = this.props;

        return (
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    value={value} // make the HTML <input> a React
                                  // controlled component
                    onChange={onChange}
                    ref={(node) => { this.input = node; }}
                />
                <button type="submit">
                    {children}
                </button>
            </form>
        );
    }
}

// Table is an ES6 class component (stateful)
class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sortKey: 'NONE',
            isSortReverse: false,
        };

        this.onSort = this.onSort.bind(this);
    }

    onSort(sortKey) {
        const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
        this.setState({ sortKey, isSortReverse });
    }

    render() {
        const {
            list,
            onDismiss,
        } = this.props;

        const {
            sortKey,
            isSortReverse,
        } = this.state;

        const sortedList = SORTS[sortKey](list);
        const reverseSortedList = isSortReverse
            ? sortedList.reverse()
            : sortedList;

        return (
            <div className="table">
                <div className="table-header">
                    <span style={{ width: '40%' }}>
                        <Sort
                            sortKey={'TITLE'}
                            onSort={this.onSort}
                            activeSortKey={sortKey}
                        >
                            Title
                        </Sort>
                    </span>
                    <span style={{ width: '30%' }}>
                        <Sort
                            sortKey={'AUTHOR'}
                            onSort={this.onSort}
                            activeSortKey={sortKey}
                        >
                            Author
                        </Sort>
                    </span>
                    <span style={{ width: '10%' }}>
                        <Sort
                            sortKey={'COMMENTS'}
                            onSort={this.onSort}
                            activeSortKey={sortKey}
                        >
                            Comments
                        </Sort>
                    </span>
                    <span style={{ width: '10%' }}>
                        <Sort
                            sortKey={'POINTS'}
                            onSort={this.onSort}
                            activeSortKey={sortKey}
                        >
                            Points
                        </Sort>
                    </span>
                    <span style={{ width: '10%' }}>
                        Archive
                    </span>
                </div>

                {reverseSortedList.map(item => // demonstrates ES6 condensed arrow function
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
                                Delete
                            </Button>
                        </span>
                    </div>
                )}
            </div>
        );
    }
}

Table.propTypes = {
    list: PropTypes.arrayOf(
        PropTypes.shape({
            objectID: PropTypes.string.isRequired,
            author: PropTypes.string,
            url: PropTypes.string,
            num_comments: PropTypes.number,
            points: PropTypes.number,
        })
    ).isRequired,
    onDismiss: PropTypes.func.isRequired,
};

const Button = ({ onClick, className, children }) =>
    <button
        onClick={onClick}
        className={className}
        type="button"
    >
        {children}
    </button>

Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};

Button.defaultProps = {
    className: '',
};

const Loading = () =>
    <div>Loading...</div>

// Below is an example of a Higher-Order Component, or HOC.
// A HOC accepts input (usually a component) and outputs a component.
// The ({ isLoading, ...rest }) clause sends all props EXCEPT for isLoading
// as the input component does NOT care about this value. We only use isLoading
// for the conditional statement (? :).
const withLoading = (Component) => ({ isLoading, ...rest }) => isLoading
    ? <Loading />
    : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button);

const Sort = ({
    sortKey,
    activeSortKey,
    onSort,
    children
}) => {
    const sortClass = classNames(
        'button-inline',
        { 'button-active': sortKey === activeSortKey }
    );

    return (
        <Button
            onClick={() => onSort(sortKey)}
            className={sortClass}
        >
            {children}
        </Button>
    )
}

export default App;

// Exporting components for unit testing with Jest
export {
    Button,
    Search,
    Table,
}
