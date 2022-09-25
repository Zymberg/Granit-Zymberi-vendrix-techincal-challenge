import axios from 'axios';
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

export default axios.create({
  // headers: [
  //   { key: "Access-Control-Allow-Origin", value: "http://example.com" },
  // ],
  headers: {"Access-Control-Allow-Origin": "http://127.0.0.1:3000"},
  proxy: false,
  timeout: 10000,
});
