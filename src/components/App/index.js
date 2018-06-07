import React, { Component } from 'react';
import axios from 'axios'; // axios: browser replacement for
                           // async requests to remote APIs.
import './index.css';

import {
    DEFAULT_QUERY,
    DEFAULT_HPP,
    PATH_BASE,
    PATH_SEARCH,
    PARAM_SEARCH,
    PARAM_PAGE,
    PARAM_HPP,
} from '../../constants' // when index.js naming convention is used, filename can be omitted

import { Button } from '../Button';
import { Table } from '../Table';
import { Search } from '../Search';


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

export default App;
