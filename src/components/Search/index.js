import React, { Component } from 'react';

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

export { Search };
