const axios = require('axios')

const doTest = async idx => {
  try {
    const { data } = await axios.post(
      'http://localhost:4000/create',
      {
        items: [
          {
            id: 5, //id produk
            item: 2, //jumlah produk yg dibeli
            total: 26000 //total harga
          }
        ]
      },
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyMUBlbWFpbC5jb20iLCJpYXQiOjE1NDE5MTU3MjEsImV4cCI6MTU3MzAxOTcyMX0.clFglco3ZWRPb5xw1eJdTRURp2cdGi89lrJqWArpbFY'
        }
      }
    )
    console.log(`Transaction id #${idx}`, data)
  } catch (err) {
    console.log(err.response)
  }
}
Promise.all([doTest(1), doTest(2), doTest(3), doTest(4)])
