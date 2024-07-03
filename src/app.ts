import express from 'express'
import apiRoutes from './api/routes'

const app = express()
// @TODO Move to .env
const port = 5006

app.get('/', (req, res) => {
  res.send('Test TS API')
})

app.use('/api', apiRoutes)

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`)
})
