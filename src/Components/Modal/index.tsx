import React from "react";
import { Text,
   View,
    StyleSheet,
    TouchableOpacity,
     Dimensions,
    ScrollView} from 'react-native';
import { categoryProps } from '../../pages/Order/index';

interface ModalPickerProps{
  options:categoryProps[];
  handleCloseModal:()=>void;
  selectedItem:(item:categoryProps)=>void;
}

const {width:WIDTH,height:HEIGHT} = Dimensions.get('window')
export function  ModalPicker({options,handleCloseModal,selectedItem}:ModalPickerProps){
  
  function  onPressItem(item:categoryProps){
    selectedItem(item)
    handleCloseModal();
  }
  const option= options.map((item,index)=>{
    return(
    <TouchableOpacity key={index}
      style={styles.optionstyle}
      onPress={()=> onPressItem(item)}
      >
        <Text style={styles.item}>
          {item?.name}
        </Text>
      </TouchableOpacity>
      )
  })
  
  return(
   <TouchableOpacity 
   style={styles.container}
   onPress={handleCloseModal}
   >
    <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
              {option}
          </ScrollView>
    </View>

   </TouchableOpacity>
  )
}
const styles=StyleSheet.create({ 
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',

  },
  content:{
    width:WIDTH - 20,
    height: HEIGHT / 2,
    borderWidth:1,
    borderBlockColor:'#8a8a8a',
    borderRadius:4,
    backgroundColor:'#fff'
  },
  optionstyle:{
    alignItems:'flex-start',
    borderTopWidth:0.8,
    borderColor:'#8a8a8a'
  },
  item:{
    margin:18,
    fontSize:14,
    fontWeight:'bold',
    color:'#101026'
  }
})