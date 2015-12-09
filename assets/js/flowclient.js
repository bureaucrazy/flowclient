// ------------------- FUNCTIONS -------------------
// Alternate method.
// function Get(yourUrl){
//     var Httpreq = new XMLHttpRequest(); // a new request
//     Httpreq.open("GET",yourUrl,false);
//     Httpreq.send(null);
//     return Httpreq.responseText;
//   }
//
//   var jsonData = JSON.parse(Get('http://localhost:3000/api/v1/notifications'));
//
// var data = jsonData.notifications

var fetchJSON = function (path) {
  var JSONData = null;
  $.ajax({
    'async': false,
    'global': false,
    'url': "http://localhost:3000/api/v1/" + path,
    'dataType': "json",
    'error': function(){
      console.log(path + " data load failed.");
    },
    'success': function (data) {
      JSONData = data;
    }
  });
  return JSONData;
};

var GetStatus = function(status_id) {
  var id = status_id || 1;

  if (id === 1) {
    return 'OK';
  } else if (id === 2){
    return 'WRN';
  } else if (id === 3){
    return 'DGR';
  } else if (id === 4){
    return 'ACK';
  }
}

var CountAlerts = function(context){
  var warning = +context[2] || 0;
  var danger = +context[3] || 0;
  var count = warning + danger;
  return count;
}

// --------------------------------------


var SiteData = fetchJSON("sites").sites;
var SensorData = fetchJSON("sensors").sensors;
var NotificationData = fetchJSON("notifications").notifications;
var AllSensorStatus = fetchJSON("AllSensorStatus").status;
var AllSiteSensorScada = fetchJSON("GetAllSensorNameScadaValues");
// console.log(SiteData);
// console.log(SensorData);
// console.log(NotificationData);
// console.log(AllSensorStatus);
// console.log (AllSiteSensorScada);

// NotificationData = NotificationData.slice(0,13);


// ------------------- SYSTEM STATUS -------------------
var StatusBox = React.createClass({
  render: function() {
    return (
      <div className="statusBox small">
        <StatusList data={this.props.data} />
      </div>
    );
  }
});

var StatusList = React.createClass({
  render: function() {
    var statusNodes = this.props.data.map(function(status) {
      return (
        <Status key={status.id}>
          {status.value} {status.name}
        </Status>
      );
    });
    return (
      <div className="statusList">
        {statusNodes}
      </div>
    );
  }
});

var Status = React.createClass({
  render: function() {
    return (
      <div className="status well text-center">
        {this.props.children}
      </div>
    );
  }
});

ReactDOM.render(<StatusBox data={AllSensorStatus} />, document.getElementById('status'));
// --------------------------------------


// ------------------- NOTIFICATIONS -------------------
var NotificationBox = React.createClass({
  render: function() {
    return (
      <div className="notificationBox">
        <NotificationList data={this.props.data} />
      </div>
    );
  }
});

var NotificationList = React.createClass({
  render: function() {
    var notificationNodes = this.props.data.map(function(notification) {
      return (
        <Notification key={notification.id}>
          <h6>S{notification.sensor_id}. {notification.ts_data} [{GetStatus(notification.status)}]</h6>
        </Notification>
      );
    });
    return (
      <div className="notificationList">
        {notificationNodes}
      </div>
    );
  }
});

var Notification = React.createClass({
  render: function() {
    return (
      <div className="notification">
        {this.props.children}
      </div>
    );
  }
});

ReactDOM.render(<NotificationBox data={NotificationData} />, document.getElementById('notification'));
// --------------------------------------


// ------------------- LOCATIONS -------------------
$(function () {

    // Initiate the chart
    $('#location').highcharts('Map', {

        title: {
          text: ''
        },

        mapNavigation: {
          enabled: true,
          buttonOptions: {
            verticalAlign: 'bottom'
          }
        },

        exporting: {
          enabled: false
        },

        tooltip: {
          headerFormat: '',
          pointFormat: '<b>{point.name}</b><br>Lat: {point.lat}, Lon: {point.lon}<br>Status: {point.current_site_status}'
        },

        series: [{
          mapData: Highcharts.maps['countries/ca/ca-all-all'],
          name: 'Basemap',
          borderColor: '#A0A0A0',
          nullColor: 'rgba(200, 200, 200, 0.3)',
          showInLegend: false
        }, {
            name: 'Separators',
            type: 'mapline',
            data: Highcharts.geojson(Highcharts.maps['countries/ca/ca-all-all'], 'mapline'),
            color: '#707070',
            showInLegend: false,
            enableMouseTracking: false
        }, {
            // Specify points using lat/lon
            type: 'mappoint',
            name: 'Sites',
            color: Highcharts.getOptions().colors[1],
            data: SiteData
        }]
    });
    $('#location').highcharts().mapZoom(1.0, 50, 50);
});
// --------------------------------------


// ------------------- MY LOCATIONS -------------------
var SiteBox = React.createClass({
  render: function() {
    return (
      <div className="siteBox small">
        <SiteList data={this.props.data} />
      </div>
    );
  }
});

var SiteList = React.createClass({
  render: function() {
    var siteNodes = this.props.data.map(function(site) {

      var DisplayAck;
      if (site.current_site_status === 2 || site.current_site_status === 3) {
        DisplayAck = <a href="#" className="btn btn-default btn-xs" role="group">Ack</a>;
      }

      return (
        <Site key={site.id}>
          <td>{site.id}</td>
          <td>{site.name}</td>
          <td>{GetStatus(site.current_site_status)}</td>
          <td>{CountAlerts(site.current_site_status_categorized)}</td>
          <td>Sensor type goes here</td>
          <td><div id={"chart-" + site.id} className="chart"></div></td>
          <td>
            <a href="details.html" className="btn btn-default btn-xs" role="group">View</a>
            <a href="#" className="btn btn-default btn-xs" role="group">Status</a>
            {DisplayAck}
          </td>
        </Site>
      );
    });
    return (
      <div className="siteList">
        <table className="table table-hover table-responsive">
          <thead>
            <tr>
              <th>Site</th>
              <th>Location</th>
              <th>Status</th>
              <th>Alerts</th>
              <th>Type</th>
              <th>Graph</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {siteNodes}
          </tbody>
        </table>
      </div>
    );
  }
});

var Site = React.createClass({
  render: function() {
    return (
      <tr>
        {this.props.children}
      </tr>
    );
  }
});

ReactDOM.render(<SiteBox data={SiteData} />, document.getElementById('site'));

// +++++++++++++++++++ HIGH CHARTS +++++++++++++++++++
$(function () {
  $(document).ready(function() {
    for (var n = 0; n < SiteData.length; n++) {
      var chart = new Highcharts.Chart({
        chart: {
          renderTo: 'chart-' + (n + 1)
        },
        title: {
          text: ''
        },
        subtitle: {
          visible: false
        },
        xAxis: {
          visible: false
        },
        yAxis: {
          title: {
            text: ''
          },
          labels: {
            enabled: true
          }
        },
        tooltip: {
          valueSuffix: AllSiteSensorScada.sites[n].details.description
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        series: [AllSiteSensorScada.sites[n].details]
      });
    };
  });
});
// +++++++++++++++++++++++++++++++++++++++++++++
// --------------------------------------


// ------------------- MENU -------------------
var navConfig = [
  {
    href: '#',
    text: 'Home'
  },
  {
    text: 'Application',
    children: [
      {
        href: '#',
        text: 'Sub-menu 1'
      }    ]
  },
  {
    text: 'Analyze',
    children: [
      {
        href: '#',
        text: 'Sub-menu 1'
      }
    ]
  },
  {
    text: 'Alerts',
    children: [
      {
        href: '#',
        text: 'Sub-menu 1'
      }
    ]
  },
  {
    text: 'Settings',
    children: [
      {
        href: '#',
        text: 'Sub-menu 1'
      }
    ]
  },
  {
    text: '?',
    children: [
      {
        href: '#',
        text: 'Sub-menu 1'
      }
    ]
  },
  {
    href: '#',
    text: 'X'
  },
  {
    href: '#',
    text: 'Logout'
  }
];

var Navigation = React.createClass({
  getInitialState: function () {
    return {
      openDropdown: -1
    };
  },
  getDefaultProps: function () {
    return {
      config: []
    }
  },
  openDropdown: function (id) {
  // console.log('open!');
    this.setState({
      openDropdown: id
    });
  },
  closeDropdown: function () {
    this.setState({
      openDropdown: -1
    });
  },
  propTypes: {
    config: React.PropTypes.array
  },
  render: function () {
    var config = this.props.config;

    var items = config.map(function (item, index) {
      var children, dropdown;
      if (item.children) {
        children = item.children.map(function (child) {
          return (
            <li className="nav-dropdown-item">
              <a className="nav-dropdown-link" href={ child.href }>
                { child.text }
              </a>
            </li>
          );
        });

        var dropdownClass = 'nav-dropdown dropdown-menu';
        if (this.state.openDropdown === index) {
          dropdownClass += ' nav-dropdown-open';
        }

        // console.log(this.state.openDropdown, index);

        dropdown = (
          <ul className={ dropdownClass }>
            { children }
          </ul>
        );
      }
      return (
        <li className="nav-item" onMouseOut={ this.closeDropdown } onMouseOver={ this.openDropdown.bind(this, index) }>
          <a className="nav-link" href={ item.href }>
            { item.text }
          </a>

          { dropdown }
        </li>
      );
    }, this);

    return (
      <div className="nav navbar-nav navbar-right">
        { items }
      </div>
    );
  }
});

ReactDOM.render(<Navigation config={ navConfig } />, document.getElementById('menu'));
// --------------------------------------
