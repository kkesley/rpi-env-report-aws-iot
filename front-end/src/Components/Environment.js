import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import GetEnvironment from '../Graphql/Queries/GetEnvironment'
import SubscribeEnvironment from '../Graphql/Subscription/SubscribeEnvironment'
import quotes from './quotes'
import { LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import moment from 'moment'


class Environment extends Component {
    constructor(props){
      super(props)
      this.state = {
        environments:[],
      }
    }
    componentWillMount(){
      this.props.environmentSubscription();
    }
    componentDidMount(){
      fetch("https://39l8mb1k1a.execute-api.ap-southeast-2.amazonaws.com/dev/latest")
      .then(res => res.json())
      .then(res => {
        console.log(res)
        this.setState({
          environments: res.Items.map(item => ({
            ...item,
            name: moment(item.created_at).startOf("hour").format("HH:mm")
          }))
        })
      })
      .catch(err => {console.log(err)})
    }
    getColor(temperature){
        if(temperature > 30){
            return "#b90b0b"
        }else if (temperature > 10){
            return "#eeff34"
        }else{
            return "#3557ff"
        }
    }
    getBackground(temperature){
        if(temperature > 30){
            return "url(./temp-hot.jpg)"
        }else if (temperature > 10){
            return "url(./temp-med.jpg)"
        }else{
            return "url(./temp-cold.jpg)"
        }
    }
    getQuote(temperature){
        var tempQuotes = []
        if(temperature > 30){
            tempQuotes = quotes.hot
        }else if (temperature > 10){
            tempQuotes = quotes.medium
        }else{
            tempQuotes = quotes.cold
        }
        return tempQuotes[Math.floor(Math.random()*tempQuotes.length)]
    }
    render(){
      if(!this.props.environment){
        return null
      }
      const color = this.getColor(this.props.environment.temperature)
      const quote = this.getQuote(this.props.environment.temperature)
      return (
        <div className="m-grid__item m-grid__item--fluid m-grid  m-error-3" style={{display:"flex",flexDirection:'column', backgroundImage: this.getBackground(this.props.environment.temperature)}}>
          <div className="m-error_container" style={{flex: '1 0 auto'}}>
            <span className="m-error_number">
              <h1 style={{color: color, textStrokeColor: color, WebkitTextStrokeColor: color}}>
              {Math.round(this.props.environment.temperature)} <sup style={{marginLeft:-30,fontSize: '6rem'}}>&deg;C</sup>
              </h1>
              
            </span>
            <div className="sub-info">
              <div className="m-error_description" style={{ textAlign:"center", display:'inline'}}>
                <span style={{color:color}}>Updated at: {moment(this.props.environment.created_at).format("DD-MM-YYYY HH:mm:ss")}</span>
              </div>
            </div>
            <div className="sub-info">
              {
                this.props.environment.humidity ?
                  <div className="m-error_description" style={{ textAlign:"center", display:'inline'}}>
                  <h2 style={{color:color, textStrokeColor: color, WebkitTextStrokeColor: color, display:"inline"}}>Humidity: {this.props.environment.humidity.toFixed(2)}%</h2>
                </div>:null
              }
              {
                this.props.environment.pressure ?
                <div className="m-error_description" style={{marginLeft:10, display:'inline'}}>
                  <h2 style={{color:color, textStrokeColor: color, WebkitTextStrokeColor: color, display:"inline"}}>Pressure: {this.props.environment.pressure.toFixed(2)} mBar</h2>
                </div>:null
              }
            </div>
            <div className="m-error_description" style={{textAlign:"center"}}>
                <strong>
                <blockquote style={{textAlign:"center"}}>
                {quote.text}
                </blockquote>
                <cite>– {quote.cite}</cite>
                </strong>
            </div>
            
          </div>

          <div className="forecast" style={{ width:'100%', backgroundColor:"#FFFFFF", flexShrink:0}}>
            
            <div style={{height: 200, width:"40%", marginLeft: 20, backgroundColor:"#FFFFFF", padding: 20, display:"inline-block"}}>
              <h3 style={{marginLeft: 20}}>Temperature History</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={this.state.environments}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{height: 200, width:"40%", marginRight: 20, backgroundColor:"#FFFFFF", padding: 20, display:"inline-block", float:'right'}}>
              <h3 style={{marginLeft: 20}}>Humidity History</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={this.state.environments}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line type="monotone" dataKey="humidity" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )
    }
  }
  
export default compose(
    graphql(GetEnvironment, {
        options: {
            fetchPolicy: 'cache-and-network',
            variables: {
              groupingKey: "now",
              timestamp: 0
            },
        },
        props: (props) => ({
            environment: props.data.getEnvironment,
            environmentSubscription: params => {
              props.data.subscribeToMore({
                  variables: {
                    groupingKey: "now",
                    timestamp: 0
                  },
                  document: SubscribeEnvironment,
                  updateQuery: (prev, { subscriptionData: { data : { onCreateEnvironment } } }) => ({
                    ...prev,
                    getEnvironment: {...onCreateEnvironment }
                  })
              });
          },
        })
    }),
    )(Environment);