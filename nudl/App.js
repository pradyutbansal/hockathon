import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  Button,
  AsyncStorage
} from 'react-native';
import {StackNavigator} from 'react-navigation';
import { Location, Permissions, MapView } from 'expo';

//Screens
class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'Login'
  };
  constructor() {
    super();
    this.state = {
      username: null,
      password: null
    }
  }
  componentDidMount(){
    AsyncStorage.getItem('user')
    .then((response) => {
      const resp = JSON.parse(response)
      this.setState({username:resp.username, password:resp.password})
    })
    .catch((err)=> console.log('we darn ducked up', err))
  }
  press() {
    let self = this;
    fetch('https://hohoho-backend.herokuapp.com/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username: self.state.username, password: self.state.password})
    }).then((response) => {
      console.log(response)
      return response.json()
    }).then((responseJson) => {
      console.log('in the inner circle', responseJson);
      /* do something with responseJson and go back to the Login view but
      * make sure to check for responseJson.success! */
      if (responseJson.success) {
        console.log('login successful');
        AsyncStorage.setItem('user', JSON.stringify({
          username:self.state.username,
          password:self.state.password
        }))
        this.props.navigation.navigate('User');

      }
    }).catch((err) => {
      /* do something if there was an error with fetching */
      console.log('error', err)
    });

  }
  register() {
    this.props.navigation.navigate('Register');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.textBig}>Login to HoHoHo!</Text>
        <TextInput style={styles.inputfield} placeholder="Enter your username" onChangeText={(text) => this.setState({username: text})}/>
        <TextInput style={styles.inputfield} secureTextEntry={true} placeholder="Enter your password" onChangeText={(text) => this.setState({password: text})}/>
        <TouchableOpacity
          onPress={() => {
            this.press()
          }}
          style={[styles.button, styles.buttonGreen]}>
          <Text style={styles.buttonLabel}>Tap to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={() => {
          this.register()
        }}>
        <Text style={styles.buttonLabel}>Tap to Register</Text>
      </TouchableOpacity>
    </View>
  )}}

  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

  class UserScreen extends React.Component {

    static navigationOptions = ({navigation}) => ({
      title: 'Users',
      headerRight: <Button
        title='Messages'
        onPress={()=> {navigation.state.params.onRightPress()}}
      />
    });
    constructor(){
      super();
      this.state = {
        dataSource: ds.cloneWithRows([])
      };
    };

    messages() {
      this.props.navigation.navigate('Messages');
    }
    componentDidMount(){
      this.props.navigation.setParams({
        onRightPress: this.messages.bind(this)
      });
      fetch('https://hohoho-backend.herokuapp.com/users',{
        method:'GET',
        headers: {
          "Content-Type": "application/json"
        }
      }).then((response) => {
        return response.json()
      }).then((responseJson) => {
        // console.log('innder circle', responseJson)
        /* do something with responseJson and go back to the Login view but
        * make sure to check for responseJson.success! */
        if (responseJson.success) {
          console.log('users acquired');
          this.setState({
            dataSource: ds.cloneWithRows(responseJson.users)
          })
        }
      })
      .catch((err) => {
        console.log('error', err)
      });
    }

    touchUser(rowData){
      fetch('https://hohoho-backend.herokuapp.com/messages',{
        method:'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body:JSON.stringify({
          to:rowData._id
        })
      })
      .then((response) => {
        return response.json()
      }).then((responseJson) => {
        // console.log('innder circle', responseJson)
        /* do something with responseJson and go back to the Login view but
        * make sure to check for responseJson.success! */
        if (responseJson.success) {
          Alert.alert(
            'Success',
            'Hohoho was successfully sent',
            [{text: 'YAY!'}] // Button
          )
        }
      }).catch((err) => {
        console.log('error', err)
      });
    }
    sendLocation = async(user) => {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        //handle failure
        console.log('Unable to find your location')
      }
      let location = await Location.getCurrentPositionAsync({enableHighAccuracy:true});

      fetch('https://hohoho-backend.herokuapp.com/messages',{
        method:'POST',
        headers: {
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          to: user._id,
          location:{
            latitude:location.coords.latitude,
            longitude:location.coords.longitude
          }
        })
      })
      .then((response) => {
        return response.json()
      }).then((responseJson) => {
        // console.log('innder circle', responseJson)
        /* do something with responseJson and go back to the Login view but
        * make sure to check for responseJson.success! */
        if (responseJson.success) {
          Alert.alert(
            'Success',
            'location was successfully sent',
            [{text: 'YAY!'}] // Button
          )
        }
      }).catch((err) => {
        console.log('error', err)
      });
    }
    render() {
      console.log('users dataSource', this.state.dataSource);
      return(
        <View>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) => <TouchableOpacity
              onPress={this.touchUser.bind(this, rowData)}
              onLongPress={this.sendLocation.bind(this, rowData)}
              delayLongPress={500}
              ><Text style={styles.userfield}>{rowData.username}</Text></TouchableOpacity>}
            />
          </View>
        )
      }
    }
    // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    class MessagesScreen extends React.Component {
      static navigationOptions = {
        title: 'Messages'
      };

      constructor() {
        super();
        this.state = {
          dataSource: ds.cloneWithRows([])
        }
      }
      componentDidMount(){
        fetch('https://hohoho-backend.herokuapp.com/messages',{
          method:'GET',
          headers: {
            "Content-Type": "application/json"
          }
        }).then((response) => {
          return response.json()
        }).then((responseJson) => {
          // console.log('innder circle', responseJson)
          /* do something with responseJson and go back to the Login view but
          * make sure to check for responseJson.success! */
          if (responseJson.success) {
            // console.log('messages acquired');
            // console.log(responseJson.messages)
            this.setState({
              dataSource: ds.cloneWithRows(responseJson.messages)
            })
            console.log(this.state)
          }
        })
        .catch((err) => {
          console.log('error', err)
        });
      }
      render() {
        console.log('MESSAGES',this.state.dataSource)
        return (
          <View style={styles.container}>
            <ListView
              dataSource={this.state.dataSource}
              renderRow={(aMessages) =>
                <View style={styles.message}>
                  <Text>From:{aMessages.from.username}</Text>
                  <Text>  To:{aMessages.to.username}</Text>
                  <Text>  Message:{aMessages.body}</Text>
                  <Text>  When:{aMessages.timestamp}</Text>
                  {(aMessages.location && aMessages.location.longitude && aMessages.location.latitude) ?
                    <MapView
                      style={styles.map}
                      showsUserLocation={true}
                      scrollEnabled={false}
                      region={{
                        longitude: aMessages.location.longitude,
                        latitude: aMessages.location.latitude,
                        longitudeDelta: 1,
                        latitudeDelta: 1
                      }}
                    /> : <Text style={{justifyContent:'center', marginTop:1}}>Sorry no location to display :(</Text>}
                    </View>
                  }
                />
              </View>
            )
          }
        }
        class RegisterScreen extends React.Component {
          static navigationOptions = {
            title: 'Register'
          };
          constructor(){
            super();
            this.state = {
              username: null,
              password: null
            };
          }
          post() {
            console.log('reached')
            let self = this;
            fetch('https://hohoho-backend.herokuapp.com/register', {
              method: 'POST',
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({username: self.state.username, password: self.state.password})
            }).then((response) => {
              return response.json()
            }).then((responseJson) => {
              console.log('innder circle', responseJson)
              /* do something with responseJson and go back to the Login view but
              * make sure to check for responseJson.success! */
              if (responseJson.success) {
                console.log('registration successful');
                this.props.navigation.navigate('Login');
              }
            }).catch((err) => {
              /* do something if there was an error with fetching */
              console.log('error', err)
            });
          }
          render() {
            return (
              <View style={styles.container}>
                <TextInput style={styles.inputfield} placeholder="Enter your username" onChangeText={(text) => this.setState({username: text})}/>
                <TextInput style={styles.inputfield} secureTextEntry={true} placeholder="Enter your password" onChangeText={(text) => this.setState({password: text})}/>

                <TouchableOpacity onPress={this.post.bind(this)}>
                  <Text style={styles.textBig}>Register</Text>
                </TouchableOpacity>
              </View>
            )
          }
        }

        //Navigator
        export default StackNavigator({
          Login: {
            screen: LoginScreen
          },
          Register: {
            screen: RegisterScreen
          },
          User: {
            screen: UserScreen
          },
          Messages: {
            screen: MessagesScreen
          }
        }, {initialRouteName: 'Login'});

        //Styles
        const styles = StyleSheet.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5FCFF',
            width:'100%'
          },
          containerFull: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'stretch',
            backgroundColor: '#F5FCFF'
          },
          welcome: {
            fontSize: 20,
            textAlign: 'center',
            margin: 10
          },
          instructions: {
            textAlign: 'center',
            color: '#333333',
            marginBottom: 5
          },
          textBig: {
            fontSize: 36,
            textAlign: 'center',
            margin: 10
          },
          button: {
            alignSelf: 'stretch',
            paddingTop: 10,
            paddingBottom: 10,
            marginTop: 10,
            marginLeft: 5,
            marginRight: 5,
            borderRadius: 5
          },
          buttonRed: {
            backgroundColor: '#FF585B'
          },
          buttonBlue: {
            backgroundColor: '#0074D9'
          },
          buttonGreen: {
            backgroundColor: '#2ECC40'
          },
          buttonLabel: {
            textAlign: 'center',
            fontSize: 16,
            color: 'white'
          },
          inputfield: {
            marginTop: 5,
            height: 40,
            width: '100%',
            borderWidth: 1,
            borderColor: 'black',
            borderRadius: 3
          },
          userfield: {
            marginTop: 1,
            height: 20,
            width: '100%',
            borderWidth: 1,
            borderColor: 'black',
            borderRadius: 3,
            textAlign: 'center'
          },
          message: {
            borderTopWidth: 1,
            width: '100%',
            borderColor: 'black',
            backgroundColor: '#CCCCCC',
            display: 'block'
          }, map:{
            height:60,
            width:'100%',

          }
        });
