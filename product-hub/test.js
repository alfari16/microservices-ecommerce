const axios = require('axios')

const doTest = (idx) =>
  axios.post(
    'http://localhost:3000/orders/create',
    {
      items: [
        {
          id: 5,
          item: 2,
          total: 26000
        },
        {
          id: 6,
          item: 2,
          total: 35000
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
Promise.all([doTest(1), doTest(2), doTest(3), doTest(4)])