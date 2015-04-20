var React = require('react');
var socket = require('./socket');
var NavBar = require('./navBar');
var DisplayCase = require('./displayCase');
var SideBar = require('./sideBar');
var TopBar = require('./topBar');

var NewsStand = React.createClass({
    loadNewsSources: function() {
        socket.emit('sources:retrieve');
    },
    updateSourceState: function(data) {
        this.setState({data: data});
    },
    setLoggedIn: function(data) {
        console.log("HEARD LOG IN")
        this.setState({loggedIn: true});
        this.setState({username: data.username});
    },
    setLoggedOut: function() {
        this.setState({loggedIn: false});
        this.setState({username: ""});
        socket.emit('client:log-out');
    },
    getInitialState: function() {
        socket.on('server:log-in', this.setLoggedIn);
        socket.on('server:log-out', this.setLoggedOut);
        socket.on('update:sources', this.loadNewsSources);
        socket.on('sources:found', this.updateSourceState);
        return {data: [], loggedIn: false, username: ""};
    },
    componentDidMount: function() {
        this.loadNewsSources();
    },
    render: function() {
        return (
            <div className="news-stand col-xs-12">
                <SideBar url={this.props.url} loggedIn={this.state.loggedIn} logOutHandler={this.setLoggedOut} />                
                <TopBar loggedIn={this.state.loggedIn} />
                <DisplayCase url={this.props.url} data={this.state.data} />
            </div>
        );
    }
});

module.exports=NewsStand;

