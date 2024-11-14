import axios from "axios";

const api = axios.create({
  //baseURL:'http://localhost:3333'
  baseURL:'http://10.20.23.66:3333'
})
export {api};