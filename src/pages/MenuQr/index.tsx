import React, { useEffect, useState,useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useRoute, RouteProp,useNavigation } from "@react-navigation/native";
import {Feather} from '@expo/vector-icons'
import { api } from "../../services/api";
import { ModalPicker } from "../../Components/Modal";
import Items from "../../Components/Items";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StackPramsList } from "../../routes/app.routes";
import { AuthContext } from "../../contexts/AuthContext";


export type RouteDeatilParams={
  Order:{
    number:string | number;
    order_id:string;
    organizationId:String;
  },
  Finish:{
    number:string | number;
    order_id:string;
  }
}
export type categoryProps={
  id:string;
  name:string;
}
export type produtsprops={
  id:string;
  name: string;
  price: string;
}
type itemsProps={
id:string;
produt_id:string;
name:string
amount:string | number;
organizationId:String;
}

type OrderRouteProps = RouteProp<RouteDeatilParams,'Order'>

export default function MenuQr(){
  const route = useRoute<OrderRouteProps>();
  const navigation= useNavigation<NativeStackNavigationProp<StackPramsList>>();;
  const {user} = useContext(AuthContext)
  const [category,SetCategory]=useState<categoryProps[] | []>([]);
  const [CategorySelected, setCategorySelected]=useState<categoryProps>();
  const [modalCategoryVisible,setModalCategoryVisible]=useState(false);

  const [produt, setProdut]=useState<produtsprops[] | []>([]);
  const [produtselect, setProdutselect]=useState<produtsprops | undefined>();
  const [modalProdutVisible,setModalProdutVisible]=useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const [amount, setAmount]=useState('1');
  const [items,setItems]=useState<itemsProps[]>([])

  async function handdleAdd() {
  if (!produtselect) return; // Verifica se um produto está selecionado

  const response = await api.post('/order/add', {
    id_order: route.params?.order_id,
    produt_id: produtselect?.id,
    organizationId: route.params?.organizationId,
    amount: Number(amount),
  });

  console.log(response.data);
  
  // Cria um novo objeto de dados para adicionar ao estado
  let data = {
    id: response.data.id,
    produt_id: produtselect?.id as string,
    name: produtselect?.name as string,
    organizationId: route.params?.organizationId as string,
    amount: amount,
  };

  // Acesse o preço diretamente do objeto produtselect
  const price = parsePrice(produtselect.price || '0'); // Ajuste aqui
  const totalProductPrice = price * Number(amount); 

  // Atualiza o totalPrice corretamente
  setTotalPrice((oldPrice) => oldPrice + totalProductPrice);
  setItems((oldArray) => [...oldArray, data]);
}

function parsePrice(priceString: any) {
  // Verifica se priceString é uma string ou número
  if (typeof priceString === 'undefined' || priceString === null) {
    return 0; // Retorna 0 se for undefined ou null
  }

  // Se priceString for um número, converte para string
  if (typeof priceString !== 'string') {
    priceString = priceString.toString();
  }

  const cleanedPrice = priceString.replace(/[^\d.,]/g, '');
  const formattedPrice = cleanedPrice.replace(',', '.');

  return parseFloat(formattedPrice) || 0; // Garantindo que sempre retorne um número
}




  function handleFinish(){
    navigation.navigate('Finish',{number:route.params.number, order_id:route.params.order_id})
  }
  useEffect(()=>{
    async function loadInfo() {
      if(user){
        const response= await api.get('/category',{
          params:{
            organizationId:route.params?.organizationId,
          }
        });
        console.log("Categorias" + response.data);
        SetCategory(response.data);
        setCategorySelected(response.data[0])
      }
      
    }
    loadInfo();
  }, [])

 useEffect(()=>{
    async function loadProduts() {
      if(user){
        const response = await api.get('/stock_categoryQr', {
          params: {
            categoryId: CategorySelected?.id,
            organizationId: route.params?.organizationId,
          }
        });

        // Aqui formatamos os produtos ao setar no estado
        const formattedProducts = response.data.map(item => ({
          ...item.product,  // Copia os dados do produto
            name: `${item.product.name} - ${item.product.price} Kz`,
        }));

        // Seta os produtos formatados no estado
        setProdut(formattedProducts);

        // Seleciona o primeiro produto como padrão
        setProdutselect(formattedProducts[0]);
      }
    }

    loadProduts();

}, [CategorySelected]);

  async function handleDeleteItems(item_id: string) {
  // Encontrar o item que está sendo removido
  const itemToRemove = items.find(item => item.id === item_id);

  // Fazer a requisição para remover o item do backend
  await api.delete('/order/remove', {
    params: {
      id_item: item_id,
    },
  });

  // Se o item foi encontrado, subtraia seu preço do totalPrice
  if (itemToRemove) {
    const product = produt.find(p => p.id === itemToRemove.produt_id); // Encontra o produto associado
    if (product) {
      const price = parsePrice(product.price);
      const totalProductPrice = price * Number(itemToRemove.amount); // Multiplica o preço pela quantidade
      setTotalPrice(oldPrice => oldPrice - totalProductPrice);
    }
  }

  // Filtrar o item da lista
  const removeItem = items.filter(item => item.id !== item_id);
  
  // Atualiza o estado com a lista de itens filtrada
  setItems(removeItem);
}


  
  async function handlecloseOrder() {
   try {
   await api.delete('/order',{
    params:{
      id_order:route.params?.order_id
    }
   })
   navigation.goBack();
   } catch (error) {
    console.log(error)
   }
  }
  function handleChangeCategory(item:categoryProps){
    setCategorySelected(item)
  }
  function handleChangeproduts(item:produtsprops){
    setProdutselect(item)
  }
  return(
    
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}> mesa {route.params.number}</Text>
        {items.length === 0 && (
          <TouchableOpacity onPress={handlecloseOrder}>
          <Feather name="trash-2" size={28} color='#ff3f4b'/>
        </TouchableOpacity>
        )}
      </View>

      {category.length !== 0 && (
        <TouchableOpacity 
        onPress={()=>setModalCategoryVisible(true)}
         style={styles.input}>
        <Text style={{color:'#fff'}}>
          {CategorySelected?.name}
        </Text>
      </TouchableOpacity>
      )}

      {produt.length !== 0 && (
        <TouchableOpacity style={styles.input} onPress={()=>setModalProdutVisible(true)}>
        <Text style={{color:'#fff'}}>{produtselect?.name}</Text>
      </TouchableOpacity>
      )}

      <View style={styles.qtContainer}>
    <Text style={styles.qtdText}>Quantidade</Text>
    <TextInput
    style={[styles.input, {width:'60%', textAlign:'center'}]}
    placeholderTextColor="#f0f0f0"
    keyboardType="numeric"
    value={amount}
    onChangeText={setAmount}
    />
      </View>

      <View style={styles.actions}>

          <TouchableOpacity style={styles.buttonAdd} onPress={handdleAdd}>
              <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
          onPress={handleFinish}
           style={[styles.button, {opacity:items.length=== 0 ? 0.3 : 1}]}
           disabled={items.length===0}
           >
              <Text style={styles.buttonText}>Avançar</Text>
          </TouchableOpacity>

      </View>
      <FlatList
      showsVerticalScrollIndicator={false}
      style={{flex:1, marginTop:24}}
      data={items}
      keyExtractor={(item)=>item.id}
      renderItem={({item})=> <Items data={item} deleteItem={handleDeleteItems}/> }
      />

        <Modal
        transparent={true}
        visible={modalCategoryVisible}
        animationType="fade"
        >
          <ModalPicker
          handleCloseModal={()=>setModalCategoryVisible(false)}
          options={category}
          selectedItem={handleChangeCategory}
          />
        </Modal>

        <Modal
        transparent={true}
        visible={modalProdutVisible}
        animationType="fade"
        >
          <ModalPicker
          handleCloseModal={()=>setModalProdutVisible(false)}
          options={produt}
          selectedItem={handleChangeproduts}
          />
      </Modal>
      
      <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: {totalPrice.toFixed(2)} Kz</Text>
      </View>

    </View>
  )
}
const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#1d1d2e',
    paddingVertical:'5%',
    paddingEnd:'4%',
    paddingStart:'4%',
  },
  header:{
    flexDirection:'row',
    marginBottom:12,
    alignItems:'center',
    marginTop:24
  },
  title:{
    fontSize:30,
    fontWeight:'bold',
    color:'#fff',
    marginRight:14,
  },
  input:{
    backgroundColor:'#101026',
    borderRadius:4,
    width:'100%',
    height:40,
    marginBottom:12,
    justifyContent:'center',
    paddingHorizontal:8,
    fontSize:20,
    color:'#f0f0f0'
  },
  qtContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'
  },
  qtdText:{
    fontSize:20,
    fontWeight:'bold',
    color:'#fff'
  },
  actions:{
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-between',
  },
  buttonAdd:{
    width:'20%',
    backgroundColor:'#3fb1ff',
    borderRadius:4,
    height:40,
    justifyContent:'center',
    alignItems:'center',

  },
  buttonText:{
    color:'#101026',
    fontSize:18,
    fontWeight:'bold'
  },
  button:{
    backgroundColor:'#3fffa3',
    borderRadius:4,
    height:40,
    width:'75%',
    alignItems:'center',
    justifyContent:'center'
  },
  totalContainer: {
  marginTop: 20,
  alignItems: 'center',
},
totalText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#fff',
},

})