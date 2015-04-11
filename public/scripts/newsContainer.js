var socket = io();
var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;
var ResponsiveReactGridLayout = ReactGridLayout.Responsive;

var NewsItem = React.createClass({
    getInitialState: function() {
        return {description: []};
    },
    expandArticle: function() {
        if(this.state.description.length > 0) {
            this.setState({description: []}); 
        } else {
            this.setState({description: this.props.data.description})
        }
        console.log(this.props.data)
    },
    render: function() {
        return (
            <div className="feed-item">
                <a href={this.props.link}>{this.props.title}</a>
            </div>
        )
    }
});

var NewsContainer = React.createClass({
    updateItems: function(item) {
        if(item.sourceID == this.props.sourceID) {
            var newData = this.state.data;
            newData.push(item.data);
            this.setState(newData);
        }
    },
    deleteSource: function() {
       socket.emit('sources:remove', {sourceID: this.props.sourceID}) 
    },
    getInitialState: function() {
        socket.on('stream:item', this.updateItems);
        return {data: []};
    },
    render: function() {
        var slice = this.state.data.slice(0, this.props.numItems);
        var items = slice.map(function(item) {
            return (
                <NewsItem link={item.link} title={item.title} data={item} />
            )
        })
        return (
            <div className= "news-container">
                <div className= "delete-button icon-cross">
                    <a href="#" onClick={this.deleteSource}></a>
                </div>
                <h3 className="container-title">
                    {this.props.title}
                </h3>
                {items}
            </div>
        );
    }

});

var SideBar = React.createClass({
    getInitialState: function() {
        return {sourceForm: false}
    },
    toggleHidden: function() {
        var formBlob = new Blob(["blahblah","hhhhhhhhh"], {type:'application/json'});
        var file = React.findDOMNode(this.refs.file)
        file.href = window.URL.createObjectURL(formBlob)
        // if(this.state.sourceForm) {
        //     this.setState({sourceForm: false})
        // } else
        //     this.setState({sourceForm: true}) 
    },
    render: function() {
        return (
            <div>
                <button onClick={this.toggleHidden}>Hide</button>
                <a href="#" ref="file" download>download</a>
                {this.state.sourceForm ? <AddSourceForm url={this.props.url} /> : null }
            </div>
        )
    }
});

var AddSourceForm = React.createClass({
    getInitialState: function() {
        socket.on('source:invalid', this.handleError)
        return {}
    },
    handleError: function(error) {
        alert(error.error)
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
            <form className="add-source-form two columns" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Title" ref="title" />
                <input type="text" placeholder="URL" ref="url" />
                <input type="submit" value="Add source" />
            </form>
        );
    }
})

var DisplayCase = React.createClass({
    render: function() {
        var containers = this.props.data.map(function(container) {
            return (
                <NewsContainer key={container.id} url={container.url} title={container.title} sourceID={container.sourceID} numItems={10} />
            );
        });

        var chunks = [];
        var i,j,chunk = 4;
        for(i = 0, j = containers.length; i<j; i += chunk) {
            var chunkArr = containers.slice(i, i+chunk);
            chunks.push(chunkArr);
        }

        var rows = chunks.map(function(chunk) {
            return(
                <div className="row">
                    {chunk}
                </div>
            );
        }) 

        return (
            <div className="display-case">
                <BasicLayout data={this.props.data}/>
            </div>
        );
    }
});

var NavBar = React.createClass({ 
    render: function() {
        return (                
            <Navbar brand='React-Bootstrap'>
                <Nav>
                  <NavItem eventKey={1} href='#'>Link</NavItem>
                  <NavItem eventKey={2} href='#'>Link</NavItem>
                  <DropdownButton eventKey={3} title='Dropdown'>
                    <MenuItem eventKey='1'>Action</MenuItem>
                    <MenuItem eventKey='2'>Another action</MenuItem>
                    <MenuItem eventKey='3'>Something else here</MenuItem>
                    <MenuItem divider />
                    <MenuItem eventKey='4'>Separated link</MenuItem>
                  </DropdownButton>
                </Nav>
            </Navbar>  
        );
    }
});


var NewsStand = React.createClass({
    loadNewsSources: function() {
        socket.emit('sources:retrieve')
    },
    updateSourceState: function(data) {
        this.setState({data: data});
    },
    getInitialState: function() {
        socket.on('update:sources', this.loadNewsSources);
        socket.on('sources:found', this.updateSourceState);
        return {data: []};
    },
    componentDidMount: function() {
        this.loadNewsSources();
    },
    render: function() {
        return (
            <div className="news-stand">
                <NavBar url={this.props.url} />
                <DisplayCase url={this.props.url} data={this.state.data} />
                <SideBar url={this.props.url} />
                
            </div>
        );
    }
    
});

var BasicLayout = React.createClass({
  propTypes: {
    onLayoutChange: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      className: "layout",
      rowHeight: 30,
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}
    };
  },

  getInitialState() {
    return {
      layouts: {lg: this.generateLayout()},
      currentBreakpoint: 'lg'
    };
  },

  generateDOM() {
    var counter = 0
    var containers = this.props.data.map(function(container) {
        counter += 1
            return (
                <div key={counter}>
                    <NewsContainer key={container.id} url={container.url} title={container.title} sourceID={container.sourceID} numItems={10} />
                </div>
            );
        });
    return containers

    // return _.map(this.state.layouts.lg, function(l, i) {
    //   return (
    //     <div key={i} className={l.static ? 'static' : ''}>
    //       {l.static ?
    //         <span className="text" title="This item is static and cannot be removed or resized.">Static - {i}</span>
    //         : <span className="text">{i}</span>
    //       }
    //     </div>);
    // });
  },

  generateLayout() {
    var p = this.props;
    return _.map(_.range(0, 25), function(item, i) {
      var y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
      return {x: _.random(0, 5) * 2 % 12, y: Math.floor(i / 6) * y, w: 2, h: y, i: i, static: Math.random() < 0.05};
    });
  },

  onBreakpointChange(breakpoint) {
    this.setState({
      currentBreakpoint: breakpoint
    });
  },

  onLayoutChange(layout) {
    // this.props.onLayoutChange(layout);
  },

  onNewLayout() {
    this.setState({
      layouts: {lg: this.generateLayout()}
    });
  },

  render() {
    return (
      <div>
        <div>Current Breakpoint: {this.state.currentBreakpoint} ({this.props.cols[this.state.currentBreakpoint]} columns)</div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <ResponsiveReactGridLayout
            layouts={this.state.layouts}
            onBreakpointChange={this.onBreakpointChange}
            onLayoutChange={this.onLayoutChange}
            useCSSTransforms={true}
            {...this.props}>
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
});

React.render(
    <NewsStand url='http://localhost:3000/sources' />,
    document.getElementById('content')
)
