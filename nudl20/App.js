import React from 'react';
import { StyleSheet, Text, View, ListView, TextInput, TouchableOpacity,
  AsyncStorage, RefreshControl, ScrollView, Image } from 'react-native';
  import { StackNavigator } from 'react-navigation';
  import { List, ListItem, FormLabel, FormInput, CheckBox, Avatar, SearchBar} from 'react-native-elements';

  const ds = new ListView.DataSource({
    rowHasChanged: (r1, r2) => r1 !== r2,
    sectionHeaderHasChanged: (s1,s2) => s1 != s2
  });

  // Screens
  class MealListScreen extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        dataSource: ds.cloneWithRowsAndSections([]),
        refreshing:false
      }
    }

  componentDidMount () {
    // console.log(this.state.datasource)
    fetch('https://breadstick.herokuapp.com/api/meals', {
      method: 'GET',
    })
    .then((response) => response.json())
    .then((responseJson) => {
      // console.log("responseJson",responseJson.response)
      mealCategoryMap = {}
      const convertMealArrayToMap = responseJson.response.map((meal) => {
        if (!mealCategoryMap[meal.date]) {
          mealCategoryMap[meal.date] = []
        }
        mealCategoryMap[meal.date].push(meal)
      })
      return mealCategoryMap
    })
    .then((mealCategoryMap) => {
      // console.log('data source', ds);
      // console.log("mealCategoryMap", mealCategoryMap)
      this.setState({
        dataSource: ds.cloneWithRowsAndSections(mealCategoryMap)
      });
    })
  }

  longTouchMeal(meal) {
    fetch('https://breadstick.herokuapp.com/api/meals', {
      method: 'POST',
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log("toggled")
    });
  }

  fetchData() {
    return new Promise((res,rej)=>{
      fetch('https://breadstick.herokuapp.com/api/meals', {
        method: 'GET',
      })
      .then((response) => response.json())
      .then((responseJson) => {
        // console.log("responseJson",responseJson.response)
        res(responseJson)
        mealCategoryMap = {}
        const convertMealArrayToMap = responseJson.response.map((meal) => {
          // console.log("responseJson",meal)
          if (!mealCategoryMap[meal.date]) {
            mealCategoryMap[meal.date] = []
          }
          mealCategoryMap[meal.date].push(meal)
        })
        return mealCategoryMap
      })
      .then((mealCategoryMap) => {
        // console.log('data source', ds);
        // console.log("mealCategoryMap", mealCategoryMap)
        this.setState({
          dataSource: ds.cloneWithRowsAndSections(mealCategoryMap)
        });
      })
      .catch((err)=>{
        rej(err)
      })
    })
  }
    _onRefresh() {
      this.setState({refreshing: true});
      this.fetchData().then((stuff) => {
        this.setState({refreshing: false});
      });
    }
    renderRow(rowData, sectionID){
      const { navigate } = this.props.navigation;
      return (
        // <TouchableOpacity
        //   onPress={() => navigate('Meal', {meal: rowData})}
        //   // onLongPress={this.longTouchMeal.bind(this,rowData)}
        //   // delayLongPress={2000}
        // >
        <View>
          <ListItem
            mediumAvatar
            title = {rowData.title}
            subtitle = {rowData.host.name}
            avatar = {<Avatar
              medium
              rounded
              title={rowData.time}
              activeOpacity={0.7}
              titleStyle={{fontSize:16, margin:3, marginTop:6, marginBottom:3}}
              containerStyle={{paddingVertical:6}}
              overlayContainerStyle= {{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
                alignSelf: 'stretch',
                justifyContent: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}></Avatar>
            }
            titleContainerStyle={{paddingLeft:9}}
            subtitleContainerStyle={{paddingLeft:9}}
            style={styles.mealCard}
            onPress={() => navigate('Meal', {meal: rowData})}
          />
        </View>
        // </TouchableOpacity>
      )
    }

    renderSectionHeader(sectionData, date) {
      // console.log("DATE", date)
      return (
        <Text>{date}</Text>
      )
    }

    render() {
      this.fetchData.bind(this)
      console.log("HEREEEEE", this.state.dataSource)
      const { navigate } = this.props.navigation;
      return (
        <View style={{flex:1}}>
          <View style={styles.container}>
            <Image
              source={require('./img/nudl2logo-trans.png')}
              style={{marginLeft:10,width:50,height:48}}
            /><SearchBar
              lightTheme
              round
              // onChangeText={someMethod}
              placeholder='Type Here...'
              // style={{flex:1}}
            />
              <TouchableOpacity onPress={() => navigate('CreateMeal')}>
                <Text>Host meal</Text>
              </TouchableOpacity>

            </View>
            <View style={{flex:11, borderTopWidth:1, borderColor:'#AAAAAA'}}>
              <List style={{backgroundColor:'#d35400'}}>
                <ListView
                  renderRow = {this.renderRow.bind(this)}
                  dataSource = {this.state.dataSource}
                  renderSectionHeader = {this.renderSectionHeader.bind(this)}
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={this._onRefresh.bind(this)}
                    />
                  }
                />
              </List>
            </View>
          </View>
        );
      }
    }

    class MealScreen extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          meal: {},
          rsvp: false,
        }
      }
      componentDidMount() {
        const { params } = this.props.navigation.state
        fetch('https://breadstick.herokuapp.com/api/meals/' + params.meal._id, {
          method: 'GET',
        })
        .then((response) => response.json())
        .then((responseJson) => {
          const rsvps = responseJson.response.attendees
          if (rsvps.length > 0) {
            this.setState({
              meal: responseJson.response,
              rsvp: rsvp()
            });
          }
        });
      }

      pressRSVP () {
        const { params } = this.props.navigation.state
        const { goBack } = this.props.navigation;
        fetch('https://breadstick.herokuapp.com/api/meals/rsvp/' + params.meal._id + '?userId=596a00721467be0011b3f376', {
          method: 'POST',
        })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("rsvp created!")
          this.props.navigation.goBack()
        })
        .catch((err) => {
          console.log("unable to create rsvp", err)
        });
      }

      render() {
        return (
          <View>
            <Text>{this.state.meal.title}</Text>
            <Text>{this.state.meal.price}</Text>
            <TouchableOpacity>
              <Text>{this.state.meal.host}</Text>
            </TouchableOpacity>
            <Text>{this.state.meal.description}</Text>
            <Text>{this.state.meal.time}</Text>
            <Text>{this.state.meal.location}</Text>
            <TouchableOpacity onPress={this.pressRSVP.bind(this)}>
              {this.state.rsvp ? <Text style={{backgroundColor: 'red'}}>Un-RSVP</Text> : <Text style={{backgroundColor: 'green'}}>RSVP</Text>}
            </TouchableOpacity>
          </View>
        );
      }
    }



    class CreateMealScreen extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          title: '',
          description: '',
          date: '',
          time: '',
          price: '',
          capacity: '',
          location: ''
        }
      }


      createMeal() {
        const {goBack} = this.props.navigation;
        fetch('https://breadstick.herokuapp.com/api/meals/register?hostId=5969792c3de5190d9940ce16', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: this.state.title,
            description: this.state.description,
            date: this.state.date,
            time: this.state.time,
            price: this.state.price,
            capacity: this.state.capacity,
            location: this.state.location
          })
        })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("meal created!")
          this.props.navigation.goBack()
        })
        .catch((err) => {
          console.log("unable to create meal", err)
        });
      }

      render() {
        return (
          <ScrollView>
            <View>
              <Text>Host a Meal</Text>
              <FormLabel>Title </FormLabel>
              <FormInput onChangeText={(text) => this.setState({title: text})} />
              <FormLabel>Description </FormLabel>
              <FormInput onChangeText={(text) => this.setState({description: text})} />
              <FormLabel>Date </FormLabel>
              <FormInput onChangeText={(text) => this.setState({date: text})} />
              <FormLabel>Time </FormLabel>
              <FormInput onChangeText={(text) => this.setState({time: text})} />
              <FormLabel>Location </FormLabel>
              <FormInput onChangeText={(text) => this.setState({location: text})} />
              <FormLabel>Price </FormLabel>
              <FormInput onChangeText={(text) => this.setState({price: text})} />
              <FormLabel>Capacity </FormLabel>
              <FormInput onChangeText={(text) => this.setState({capacity: text})} />
              <View style={searchStyles.checkbox}>
                <CheckBox
                  title='Contains Nuts'
                  style={{padding:4, marginTop:7, marginLeft:5}}
                  checked={this.state.checked}
                />
                <CheckBox
                  title='Dairy Free'
                  style={{padding:2, marginTop:9, marginLeft:3}}
                  checked={this.state.checked}
                />

                <CheckBox
                  title='Vegan'
                  style={{padding:2, marginTop:9, marginLeft:3}}
                  checked={this.state.checked}
                />
                <CheckBox
                  title='Gluten Free'
                  style={{padding:2, marginTop:9, marginLeft:8}}
                  checked={this.state.checked}
                />
                <CheckBox
                  title='Vegetarian'
                  style={{padding:2, marginTop:9, marginLeft:5, marginRight:6}}
                  checked={this.state.checked}
                />
              </View>
              <View style={{display:'flex', alignItems:'center', justifyContent:'center'}} >
                <TouchableOpacity onPress={this.createMeal.bind(this)}>
                  <Image
                    source={require('./img/nudl2logo-trans.png')}
                    style={{width:110, height:90}}>
                    <View style={styles.headline}><Text style={{fontSize: 14}}>Sign em up!</Text></View>
                  </Image>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );
      }
    }

    export default StackNavigator({
      MealList: {
        screen: MealListScreen,
      },
      Meal: {
        screen: MealScreen,
      },
      CreateMeal: {
        screen: CreateMealScreen,
      },
    }, {initialRouteName: 'MealList'});

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        flexDirection:'row',
        flex:1,
        backgroundColor: '#d35400',
        height:'100%',

        // alignItems: 'center',
        // justifyContent: 'center',
      },
      checkbox: {
        display: 'flex',
        flexDirection: 'row'
      },
      headline: {
        display: 'flex',
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0)',
      },
      mealCard:{height:55,
        backgroundColor:'rgba(255,255,255,.35)',
        marginVertical:5,
        paddingTop:4,
        borderTopWidth:1, borderBottomWidth:1,
        borderColor:'#ecf0f1',
        paddingBottom:20}
      });

      const searchStyles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#d35400',
          opacity: .7,
          marginBottom: 10
          // alignItems: 'center',
          // justifyContent: 'center',
        },
        checkbox: {
          flex:1,
          flexDirection: 'row',
          padding:2,
          flexWrap:'wrap'
        }
      });
