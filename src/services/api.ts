import axios from "axios";

const api = axios.create({
  //baseURL:'http://192.168.43.104:3333'
  baseURL:'https://raqui.vercel.app' 
})
export {api};