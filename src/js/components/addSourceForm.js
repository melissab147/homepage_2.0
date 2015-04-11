var React = require('react');
var Input = require('react-bootstrap').Input;
var socket = require('./socket');

var AddSourceForm = React.createClass({
    getInitialState: function() {
        socket.on('source:invalid', this.handleError);
        return {};
    },
    handleError: function(error) {
        alert(error.error);
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var title = this.refs.title.getDOMNode().value.trim();
        var url = this.refs.url.getDOMNode().value.trim();
        if(!title || !url) {
            return;
        }
        socket.emit('sources:new', {title: title, url: url});
        title = "";
        url = "";
    },
    render: function() {
        return (
            <form className="add-source-form" onSubmit={this.handleSubmit}>
                <Input type="text" placeholder="Title" ref="title" />
                <Input type="text" placeholder="URL" ref="url" />
                <Input type="submit" value="Add source" />
            </form>
        );
    }
})

module.exports=AddSourceForm;
