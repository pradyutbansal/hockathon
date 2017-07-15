import React from 'react';
import { StyleSheet, Text, View, ListView, TextInput, TouchableOpacity,
        AsyncStorage, RefreshControl, ScrollView, Image } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { List, ListItem, FormLabel, FormInput, CheckBox} from 'react-native-elements';

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

  componentWillMount () {
    // console.log(this.state.datasource)
    fetch('https://breadstick.herokuapp.com/api/meals', {
      method: 'GET',
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log("responseJson",responseJson.response)
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
      console.log('data source', ds);
      console.log("mealCategoryMap", mealCategoryMap)
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
        res(responseJson)
        this.setState({
          dataSource: ds.cloneWithRows(responseJson.response)
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
        avatar = {{title:rowData.time}}
        onPressRightIcon={() => navigate('Meal', {meal: rowData})}
      />
    </View>
      // </TouchableOpacity>
    )
  }

  renderSectionHeader(sectionData, date) {
    return (
      <Text>{date}</Text>
    )
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <View><Text>SEARCH GOES HERE</Text>
        <TouchableOpacity onPress={() => navigate('CreateMeal')}>
          <Text>Host meal</Text>
        </TouchableOpacity>
      </View>
        <List>
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
    );
  }
}


class MealScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      meal: {}
    }
  }
  componentWillMount() {
    const { params } = this.props.navigation.state
    fetch('https://breadstick.herokuapp.com/api/meals/' + params.meal._id, {
      method: 'GET',
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        meal: responseJson.response
      });
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
        <TouchableOpacity>
          <Text>RSVP</Text>
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
    fetch('https://breadstick.herokuapp.com/api/meals/register?hostId=59695b7ff36d28739db80c57', {
      method: 'POST',
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
      //  this.props.navigation.goBack()
    })
    .catch((err) => {
      console.log("unable to create meal")
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
        <View style={styles.checkbox}>
          <CheckBox
            title='Contains Nuts'
          />
          <CheckBox
            title='Dairy Free'
          />
      </View>
    <View style={styles.checkbox}>
      <CheckBox
        title='Gluten Free'
      />
      <CheckBox
        title='Vegan'
      />
    </View>
      <View style={styles.checkbox}>
        <CheckBox
          title='Vegetarian'
        />
      </View>
        <TouchableOpacity onPress={this.createMeal.bind(this)}>
          <Image
          source={require('./img/nudl2logo-trans.png')}
          style={{width:110, height:90,display:'flex', alignItems:'center', justifyContent:'center'}} >
          <View style={styles.headline}><Text style={{fontSize: 14}}>Sign em up!</Text></View>
        </Image>
        </TouchableOpacity>
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
  }
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
    display: 'flex',
    flexDirection: 'row'
  }
});
