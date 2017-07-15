import React from 'react';
import { StyleSheet, Text, View, ListView, TextInput, TouchableOpacity, AsyncStorage, RefreshControl } from 'react-native';
import { StackNavigator } from 'react-navigation';
// import { } from '@shoutem/ui';
import { List, ListItem} from 'react-native-elements';
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
// Screens
class MealListScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: ds.cloneWithRows([])
    }
  }

  componentWillMount () {
    fetch('https://breadstick.herokuapp.com/api/meals', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          dataSource: ds.cloneWithRows(responseJson.response)
        });
      });
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
    <ListItem
      mediumAvatar
      title = {rowData.title}
      subtitle = {rowData.host}
      avatar = {{title:rowData.time}}
      onPressRightIcon={() => navigate('Meal', {meal: rowData})}
    />
  // </TouchableOpacity>
  )
}

render() {
const { navigate } = this.props.navigation;
  console.log(this.state.mealList)
  return (
    <View>
      <View><Text>SEARCH GOES HERE</Text></View>
      <TouchableOpacity onPress={() => navigate('CreateMeal')}>
                 <Text>Host meal</Text>
               </TouchableOpacity>
      <List>
        <ListView
          renderRow = {this.renderRow.bind(this)}
          dataSource = {this.state.dataSource}
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



  // render() {
  //   const { navigate } = this.props.navigation;
  //   return (
  //     <View style={styles.container}>
  //       <View>
  //         <Text>SEARCH GOES HERE</Text>
  //         <TouchableOpacity onPress={() => navigate('CreateMeal')}>
  //           <Text>Host meal</Text>
  //         </TouchableOpacity>
  //       </View>
  //       <ListView
  //         refreshControl={
  //           <RefreshControl
  //             refreshing={this.state.refreshing}
  //             onRefresh={this._onRefresh.bind(this)}
  //           />
  //         }
  //         dataSource={this.state.dataSource}
  //         renderRow={(rowData) => <View>
  //           <View><Text>DATE THINGY{rowData.date}</Text></View>
  //           <TouchableOpacity
  //             onPress={() => navigate('Meal', {meal: rowData})}
  //             onLongPress={this.longTouchMeal.bind(this,rowData)}
  //             delayLongPress={2000}
  //           >
  //             <View>
  //               <Text>{rowData.time}</Text>
  //               <Text>{rowData.title}</Text>
  //               <Text>{rowData.host}</Text>
  //               {rowData.capacity === rowData.numberOfGoing? <Text>Full</Text> : <Text>Not Full</Text>}
  //             </View>
  //           </TouchableOpacity>
  //         </View>}
  //       />
  //     </View>
  //   );
  // }
// }

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
    fetch('https://breadstick.herokuapp.com/api/meals/register/59695b7ff36d28739db80c57', {
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
      <View>
        <Text>Host a Meal</Text>
        <TextInput
          placeholder="Title"
          value={this.state.title}
          onChangeText={(text) => this.setState({title: text})}
        />
        <TextInput
          placeholder="Description"
          value={this.state.description}
          onChangeText={(text) => this.setState({description: text})}
        />
        <TextInput
          placeholder="Date"
          value={this.state.date}
          onChangeText={(text) => this.setState({date: text})}
        />
        <TextInput
          placeholder="Time"
          value={this.state.time}
          onChangeText={(text) => this.setState({time: text})}
        />
        <TextInput
          placeholder="Location"
          value={this.state.location}
          onChangeText={(text) => this.setState({date: location})}
        />
        <TextInput
          placeholder="Price"
          value={this.state.price}
          onChangeText={(text) => this.setState({price: text})}
        />
        <TextInput
          placeholder="Capacity"
          value={this.state.capacity}
          onChangeText={(text) => this.setState({capacity: text})}
        />
        <TouchableOpacity onPress={this.createMeal.bind(this)}>
          <Text>Host Meal</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
