import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import {Feather} from '@expo/vector-icons'
interface itensProps{
  data:{
    id:string;
    produt_id:string;
    amount:string | number;
    name:string
  },
  deleteItem:(item_id:string)=>void;
}

export default function Items({data,deleteItem}:itensProps){
  function handleDeleteItem(){
    deleteItem(data.id)
  }
  return(
    <View style={styles.container}>
      <Text style={styles.item}>{data.name}</Text>
      <Text style={styles.item}>{data.amount}</Text>
      <TouchableOpacity onPress={handleDeleteItem}>
        <Feather name="trash-2" color='#ff3f4b' size={25}/>
      </TouchableOpacity>
    </View>
  )
}
const styles=StyleSheet.create(
  {
    container:{
      backgroundColor:'#101026',
      flex:1,
      alignItems:'center',
      justifyContent:'space-between',
      flexDirection:'row',
      marginBottom:12,
      paddingVertical:12,
      paddingHorizontal:12,
      borderRadius:4,
      borderWidth:0.3,
      borderColor:'#8a8a8a'
    },
    item:{
      color:'#fff'
    }
  }
)