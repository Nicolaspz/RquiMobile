import axios from "axios";

const api = axios.create({
  //baseURL:'http://10.20.23.51:3333'
  baseURL:'https://raqui.vercel.app'
})
export {api};