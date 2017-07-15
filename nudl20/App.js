import React from 'react';
import { StyleSheet, Text, View, ListView, TextInput, TouchableOpacity, AsyncStorage } from 'react-native';
import Swiper from 'react-native-swiper'
import { StackNavigator } from 'react-navigation';
import { Examples } from '@shoutem/ui';

// Screens
class MealListScreen extends React.Component {
  constructor(props) {
    super(props)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([])
    }
  }
  componentDidMount() {
    fetch('https://breadstick.herokuapp.com/api/meals', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json"
        },
      })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          dataSource: ds.cloneWithRows(responseJson.meals)
        });
      });
    }
  }

  longTouchMeal(meal) {
    fetch('https://breadstick.herokuapp.com/api/meals', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("toggled")
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View>SEARCH GOES HERE</View>
        <ListView
          datasource={this.state.dataSource}
          renderRow={(rowData) => <View>
            <View><Text>DATE THINGY{rowData.date}</Text></View>
            <TouchableOpacity
              onPress={() => navigate('Meal', {meal: rowData})}
              onLongPress={this.longTouchMeal.bind(this,rowData)}
              delayLongPress={2000}
              <View>
                <Text>{rowData.time}</Text>
                <Text>{rowData.title}</Text>
                <Text>{rowData.host}</Text>
                {rowData.capacity === rowData.numberOfGoing? <Text>Full</Text> : <Text>Not Full</Text>}
              </View>
            />
          </View>}
        />
      </View>
    );
  }
}

class MealScreen extends React.Component {
  constructor(props) {
    super(props)
  }
  const { params } = this.props.navigation.state
  console.log(params.meal)
  fetch('https://breadstick.herokuapp.com/api/meals/' + params.meal._id, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        meal: responseJson.meal
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.meal.title}</Text>
        <Text>{this.state.meal.price}</Text>
        <TouchableOpacity>
          <Text>{this.state.meal.host}</Text>
        </TouchableOpacity>
        <Text>{this.state.meal.description}</Text>
        <Text>{this.state.meal.time}</Text>
        <Text>{this.state.meal.address}</Text>
        <Text>{this.state.meal.dietary}</Text>
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
      title: null,
      description: null,
      date: null,
      time: null,
      price: null,
      capacity: null,
    }
  }

  createMeal() {
    fetch('https://breadstick.herokuapp.com/api/meals/register/59695b7ff36d28739db80c57', {
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
        capacity: this.state.capacity
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log("meal created!")
       this.props.navigation.goBack()
    })
    .catch((err) => {
      console.log("unable to create meal")
    });
  }

  render() {
    return (
      <View style={styles.container}>
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

class SwiperScreen extends React.Component {
  render() {
    return (
      <Swiper>
        <CreateMealScreen />
        <MealListScreen />
        <MealScreen />
      </Swiper>
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
  Swiper: {
    screen: SwiperScreen,
  }
}, {initialRouteName: 'MealList'});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
