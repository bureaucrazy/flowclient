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
var ListPerSite = fetchJSON("GetListPerSite/1");
// console.log(SiteData);
// console.log(SensorData);
// console.log(NotificationData);
// console.log(AllSensorStatus);
// console.log (AllSiteSensorScada);

// NotificationData = NotificationData.slice(0,13);


// ------------------- SITE INFO -------------------
var SiteInfoBox = React.createClass({
  render: function() {
    return (
      <div className="site-infoBox">
        <SiteInfoList data={this.props.data} />
      </div>
    );
  }
});

var SiteInfoList = React.createClass({
  render: function() {
    var infoNodes = this.props.data[0].sensors.map(function(info) {
      return (
        <SiteInfo key={info.id}>
          <h6>
            {info.name} sensor: {info.scadas[0].value} {info.description} on 
            {info.scadas[0].ts_data} [{GetStatus(info.current_sensor_status)}]
          </h6>
        </SiteInfo>
      );
    });
    return (
      <div className="site-infoList">
        {infoNodes}
      </div>
    );
  }
});

var SiteInfo = React.createClass({
  render: function() {
    return (
      <div className="site-info">
        {this.props.children}
      </div>
    );
  }
});

ReactDOM.render(<SiteInfoBox data={SiteData} />, document.getElementById('site-info'));
// --------------------------------------


// ------------------- SITE NOTIFICATION -------------------
var NotificationBox = React.createClass({
  render: function() {
    return (
      <div className="site-notificationBox">
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
          <h6>Sensor {notification.sensor_id}. {notification.ts_data} [{GetStatus(notification.status)}]</h6>
        </Notification>
      );
    });
    return (
      <div className="site-notificationList">
        {notificationNodes}
      </div>
    );
  }
});

var Notification = React.createClass({
  render: function() {
    return (
      <div className="site-notification">
        {this.props.children}
      </div>
    );
  }
});

ReactDOM.render(<NotificationBox data={NotificationData} />, document.getElementById('site-notification'));
// --------------------------------------


// ------------------- SITE LOCATION -------------------
$(function () {

    // Initiate the chart
    $('#site-location').highcharts('Map', {

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
    $('#site-location').highcharts().mapZoom(1.0, 50, 50);
});
// --------------------------------------


// ------------------- SENSORS CHART -------------------
var SiteBox = React.createClass({
  render: function() {
    return (
      <div className="site-sensorBox small">
        <SiteList data={this.props.data} />
      </div>
    );
  }
});

var SiteList = React.createClass({
  render: function() {
    var siteNodes = this.props.data.map(function(site) {
      return (
        <Site key={site.id}>
          <div id={"site-sensor-chart-" + site.id} className="site-sensor-chart"></div>
        </Site>
      );
    });
    return (
      <div className="site-sensorList">
        {siteNodes}
      </div>
    );
  }
});

var Site = React.createClass({
  render: function() {
    return (
      <div className="site-sensor">
        {this.props.children}
      </div>
    );
  }
});

ReactDOM.render(<SiteBox data={SiteData} />, document.getElementById('site-sensor'));

// +++++++++++++++++++ HIGH CHARTS +++++++++++++++++++
$(function () {
  $(document).ready(function() {
    for (var n = 0; n < SiteData[1].sensors.length; n++) {
      var chart = new Highcharts.Chart({
        chart: {
          renderTo: 'site-sensor-chart-' + (n + 1)
        },
        title: {
          text: ''
        },
        subtitle: {
          text: SensorData[n].name + ' sensor on site ' + SensorData[n].site_id,
          visible: true
        },
        xAxis: {
          title: {
            text: 'Time'
          },
          visible: true
        },
        yAxis: {
          title: {
            text: SensorData[n].description
          },
          labels: {
            enabled: true
          }
        },
        tooltip: {
          valueSuffix: ' ' + SensorData[n].description
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
